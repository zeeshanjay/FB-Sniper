"""
Authentication API Routes
Handles custom OTP email auth and Meta OAuth flow
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import os
import hashlib
import httpx
from datetime import datetime, timezone
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

router = APIRouter()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

def get_admin_client():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def hash_otp(otp: str) -> str:
    return hashlib.sha256(otp.encode()).hexdigest()


async def _find_auth_user_by_email(email: str) -> Optional[dict]:
    """
    Look up a user in Supabase auth.users by email via the GoTrue admin API.
    Used as a fallback when the user is not in public.users (e.g. Google OAuth users).
    Returns the raw user dict (with 'id', 'email') or None.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/auth/v1/admin/users",
                headers={
                    "apikey": SUPABASE_SERVICE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                },
                params={"page": 1, "per_page": 1000},
            )
            if resp.status_code == 200:
                for u in resp.json().get("users", []):
                    if (u.get("email") or "").lower() == email.lower():
                        return u
    except Exception:
        pass
    return None


# ── Request / Response Models ──────────────────────────────────────────────

class OTPRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str
    password: str

class OTPResponse(BaseModel):
    success: bool
    message: str
    error: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

class MetaAuthRequest(BaseModel):
    short_lived_token: str

class MetaAuthResponse(BaseModel):
    success: bool
    access_token: Optional[str] = None
    expires_at: Optional[str] = None
    error: Optional[str] = None


# ── OTP Endpoints ──────────────────────────────────────────────────────────

@router.post("/request-otp", response_model=OTPResponse)
async def request_otp(req: OTPRequest):
    """
    Step 1: Generate 6-digit OTP, store hash in DB, send via Resend.
    """
    from app.services.email import generate_otp, send_otp_email

    db = get_admin_client()

    # Delete any previous unverified OTPs for this email
    db.table("otp_verifications").delete().eq("email", req.email).eq("verified", False).execute()

    # Check if email already has a confirmed Supabase account
    existing = db.table("users").select("id").eq("email", req.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    db.table("otp_verifications").insert({
        "email": req.email,
        "otp_hash": otp_hash,
        "full_name": req.full_name,
    }).execute()

    sent = await send_otp_email(req.email, otp, req.full_name)
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")

    return OTPResponse(success=True, message="Verification code sent.")


@router.post("/verify-otp", response_model=OTPResponse)
async def verify_otp(req: OTPVerifyRequest):
    """
    Step 2: Verify OTP → create pre-confirmed Supabase user → store in users table.
    """
    db = get_admin_client()
    otp_hash = hash_otp(req.otp_code)

    result = db.table("otp_verifications") \
        .select("*") \
        .eq("email", req.email) \
        .eq("verified", False) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="No pending verification found. Please request a new code.")

    record = result.data[0]

    # Check expiry
    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=410, detail="Verification code expired. Please request a new one.")

    # Check attempts
    if record["attempts"] >= 3:
        raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new code.")

    # Wrong code — increment attempts
    if record["otp_hash"] != otp_hash:
        db.table("otp_verifications").update({"attempts": record["attempts"] + 1}) \
            .eq("id", record["id"]).execute()
        remaining = 3 - record["attempts"] - 1
        raise HTTPException(status_code=400, detail=f"Incorrect code. {remaining} attempt(s) remaining.")

    # ✅ OTP correct — create Supabase user (pre-confirmed, no email needed)
    try:
        user_resp = db.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {"full_name": record.get("full_name", "")},
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create account: {str(e)}")

    # Mark OTP as verified
    db.table("otp_verifications").update({"verified": True}).eq("id", record["id"]).execute()

    return OTPResponse(success=True, message="Email verified. Account created.")


# ── Password Reset Endpoints ──────────────────────────────────────────────

@router.post("/request-password-reset", response_model=OTPResponse)
async def request_password_reset(req: PasswordResetRequest):
    """
    Step 1: Check email exists → generate OTP → send via Resend.
    Always returns success to avoid email enumeration.
    """
    from app.services.email import generate_otp, send_password_reset_email

    db = get_admin_client()

    # Check public.users first (email/password accounts)
    user_exists = db.table("users").select("id").eq("email", req.email).execute()
    if not user_exists.data:
        # Fall back to auth.users — covers Google OAuth users who may not
        # have a row in public.users yet.
        auth_user = await _find_auth_user_by_email(req.email)
        if not auth_user:
            # Email not found anywhere — return success silently (no enumeration)
            return OTPResponse(success=True, message="If that email is registered, a reset code has been sent.")

    # Clean up any previous unused reset OTPs for this email
    db.table("otp_verifications") \
        .delete() \
        .eq("email", req.email) \
        .eq("verified", False) \
        .eq("purpose", "reset") \
        .execute()

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    db.table("otp_verifications").insert({
        "email": req.email,
        "otp_hash": otp_hash,
        "purpose": "reset",
    }).execute()

    await send_password_reset_email(req.email, otp)

    return OTPResponse(success=True, message="If that email is registered, a reset code has been sent.")


@router.post("/reset-password", response_model=OTPResponse)
async def reset_password(req: PasswordResetVerifyRequest):
    """
    Step 2: Verify OTP → update password via Supabase admin API.
    """
    if len(req.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    db = get_admin_client()
    otp_hash = hash_otp(req.otp_code)

    result = db.table("otp_verifications") \
        .select("*") \
        .eq("email", req.email) \
        .eq("verified", False) \
        .eq("purpose", "reset") \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="No pending reset found. Please request a new code.")

    record = result.data[0]

    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=410, detail="Code expired. Please request a new one.")

    if record["attempts"] >= 3:
        raise HTTPException(status_code=429, detail="Too many incorrect attempts. Please request a new code.")

    if record["otp_hash"] != otp_hash:
        db.table("otp_verifications").update({"attempts": record["attempts"] + 1}) \
            .eq("id", record["id"]).execute()
        remaining = 3 - record["attempts"] - 1
        raise HTTPException(status_code=400, detail=f"Incorrect code. {remaining} attempt(s) remaining.")

    # OTP correct — look up the Supabase auth user ID.
    # Check public.users first, then fall back to auth.users (Google OAuth users).
    user_row = db.table("users").select("id").eq("email", req.email).execute()
    if user_row.data:
        user_id = user_row.data[0]["id"]
    else:
        auth_user = await _find_auth_user_by_email(req.email)
        if not auth_user:
            raise HTTPException(status_code=404, detail="Account not found.")
        user_id = auth_user["id"]

    # Update password via admin API (no session required)
    try:
        db.auth.admin.update_user_by_id(user_id, {"password": req.new_password})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update password: {str(e)}")

    # Mark OTP as used
    db.table("otp_verifications").update({"verified": True}).eq("id", record["id"]).execute()

    return OTPResponse(success=True, message="Password updated successfully.")


# ── Meta OAuth Endpoints ───────────────────────────────────────────────────

@router.post("/meta/exchange-token", response_model=MetaAuthResponse)
async def exchange_meta_token(request: MetaAuthRequest):
    """Exchange short-lived Meta token for 60-day long-lived token."""
    try:
        from app.services.meta import get_meta_api
        app_id = os.getenv("META_APP_ID")
        app_secret = os.getenv("META_APP_SECRET")
        if not app_id or not app_secret:
            raise HTTPException(status_code=500, detail="Meta app credentials not configured")
        meta_api = get_meta_api(app_id, app_secret)
        token_data = await meta_api.exchange_short_lived_token(request.short_lived_token)
        return MetaAuthResponse(success=True, access_token=token_data["access_token"], expires_at=token_data["expires_at"])
    except Exception as e:
        return MetaAuthResponse(success=False, error=str(e))


@router.get("/meta/callback")
async def meta_oauth_callback(code: str, state: Optional[str] = None):
    """Handle Meta OAuth callback."""
    return {"message": "OAuth callback received", "code": code, "state": state}


@router.get("/verify")
async def verify_auth():
    """Verify current session."""
    return {"authenticated": False, "message": "Auth verification not implemented yet"}


# ── Profile / Email-change / 2FA Models ────────────────────────────────────────

class UpdateProfileRequest(BaseModel):
    user_id: str
    full_name: str

class RequestEmailChangeRequest(BaseModel):
    user_id: str
    new_email: EmailStr

class VerifyEmailChangeRequest(BaseModel):
    user_id: str
    new_email: EmailStr
    otp_code: str

class Setup2FARequest(BaseModel):
    user_id: str

class Enable2FARequest(BaseModel):
    user_id: str
    secret: str
    code: str

class Disable2FARequest(BaseModel):
    user_id: str
    code: str


# ── Profile Update ──────────────────────────────────────────────────────────────

@router.patch("/update-profile", response_model=OTPResponse)
async def update_profile(req: UpdateProfileRequest):
    """Update display name in public.users and Supabase auth metadata."""
    name = req.full_name.strip()
    if not name:
        raise HTTPException(status_code=422, detail="Name cannot be empty.")
    db = get_admin_client()
    try:
        db.table("users").update({
            "full_name":  name,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", req.user_id).execute()
        db.auth.admin.update_user_by_id(req.user_id, {"user_metadata": {"full_name": name}})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return OTPResponse(success=True, message="Profile updated.")


# ── Email Change ────────────────────────────────────────────────────────────────

@router.post("/request-email-change", response_model=OTPResponse)
async def request_email_change(req: RequestEmailChangeRequest):
    """Send OTP to the NEW email so the user proves they own it."""
    from app.services.email import generate_otp, send_otp_email

    db = get_admin_client()

    taken = db.table("users").select("id").eq("email", req.new_email).execute()
    if taken.data:
        raise HTTPException(status_code=409, detail="That email is already used by another account.")

    db.table("otp_verifications").delete() \
        .eq("email", req.new_email).eq("purpose", "email_change").execute()

    otp      = generate_otp()
    otp_hash = hash_otp(otp)

    # Stash user_id in full_name column (reused for this purpose)
    db.table("otp_verifications").insert({
        "email":     req.new_email,
        "otp_hash":  otp_hash,
        "purpose":   "email_change",
        "full_name": req.user_id,
    }).execute()

    sent = await send_otp_email(req.new_email, otp, "")
    if not sent:
        raise HTTPException(status_code=500, detail="Failed to send verification email.")
    return OTPResponse(success=True, message="Verification code sent to your new email.")


@router.post("/verify-email-change", response_model=OTPResponse)
async def verify_email_change(req: VerifyEmailChangeRequest):
    """Verify OTP and update the user's email in auth + public.users."""
    db       = get_admin_client()
    otp_hash = hash_otp(req.otp_code)

    result = db.table("otp_verifications") \
        .select("*") \
        .eq("email",    req.new_email) \
        .eq("purpose",  "email_change") \
        .eq("verified", False) \
        .order("created_at", desc=True) \
        .limit(1) \
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="No pending verification found. Request a new code.")

    record     = result.data[0]
    expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))

    if datetime.now(timezone.utc) > expires_at:
        raise HTTPException(status_code=410, detail="Code expired. Please request a new one.")
    if record["attempts"] >= 3:
        raise HTTPException(status_code=429, detail="Too many attempts. Please request a new code.")
    if record["otp_hash"] != otp_hash:
        db.table("otp_verifications").update({"attempts": record["attempts"] + 1}) \
            .eq("id", record["id"]).execute()
        remaining = 3 - record["attempts"] - 1
        raise HTTPException(status_code=400, detail=f"Incorrect code. {remaining} attempt(s) remaining.")

    try:
        db.auth.admin.update_user_by_id(req.user_id, {"email": req.new_email})
        db.table("users").update({
            "email":      req.new_email,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }).eq("id", req.user_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update email: {str(e)}")

    db.table("otp_verifications").update({"verified": True}).eq("id", record["id"]).execute()
    return OTPResponse(success=True, message="Email updated. Please sign in again.")


# ── 2FA ────────────────────────────────────────────────────────────────────────
# All 2FA state is stored in auth.users.user_metadata (two_fa_enabled, two_fa_secret)
# so no extra columns are needed on public.users.

def _get_auth_user_metadata(db, user_id: str) -> dict:
    """Fetch user_metadata from auth.users via the admin API."""
    try:
        resp = db.auth.admin.get_user_by_id(user_id)
        return resp.user.user_metadata or {}
    except Exception:
        return {}


@router.get("/2fa-status/{user_id}")
async def get_2fa_status(user_id: str):
    """Return 2FA enabled state for a user."""
    db       = get_admin_client()
    metadata = _get_auth_user_metadata(db, user_id)
    return {"two_fa_enabled": bool(metadata.get("two_fa_enabled", False))}


@router.post("/setup-2fa")
async def setup_2fa(req: Setup2FARequest):
    """Generate a TOTP secret and QR code SVG for the setup wizard."""
    import pyotp
    import segno
    import io
    import base64 as b64

    db         = get_admin_client()
    row        = db.table("users").select("email").eq("id", req.user_id).execute()
    user_email = row.data[0]["email"] if row.data else req.user_id

    secret      = pyotp.random_base32()
    otpauth_uri = pyotp.TOTP(secret).provisioning_uri(
        name=user_email, issuer_name="Astraventa"
    )

    qr  = segno.make(otpauth_uri, micro=False, error="m")
    buf = io.BytesIO()
    qr.save(buf, kind="svg", scale=6, border=2)
    qr_data = "data:image/svg+xml;base64," + b64.b64encode(buf.getvalue()).decode()

    return {"secret": secret, "qr_data": qr_data, "otpauth_uri": otpauth_uri}


@router.post("/enable-2fa", response_model=OTPResponse)
async def enable_2fa(req: Enable2FARequest):
    """Verify TOTP code, then save secret and enable 2FA in user_metadata."""
    import pyotp

    if not pyotp.TOTP(req.secret).verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    db = get_admin_client()
    try:
        db.auth.admin.update_user_by_id(req.user_id, {
            "user_metadata": {
                "two_fa_secret":  req.secret,
                "two_fa_enabled": True,
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return OTPResponse(success=True, message="Two-factor authentication enabled.")


@router.post("/disable-2fa", response_model=OTPResponse)
async def disable_2fa(req: Disable2FARequest):
    """Verify current TOTP code, then wipe secret and disable 2FA in user_metadata."""
    import pyotp

    db       = get_admin_client()
    metadata = _get_auth_user_metadata(db, req.user_id)
    secret   = metadata.get("two_fa_secret")

    if not secret:
        raise HTTPException(status_code=404, detail="2FA is not configured for this account.")

    if not pyotp.TOTP(secret).verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    try:
        db.auth.admin.update_user_by_id(req.user_id, {
            "user_metadata": {
                "two_fa_secret":  None,
                "two_fa_enabled": False,
            }
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return OTPResponse(success=True, message="Two-factor authentication disabled.")


# ── 2FA Login Challenge ────────────────────────────────────────────────────────

class Verify2FAChallengeRequest(BaseModel):
    user_id: str
    code: str

@router.post("/verify-2fa-challenge", response_model=OTPResponse)
async def verify_2fa_challenge(req: Verify2FAChallengeRequest):
    """Verify TOTP code during sign-in (the challenge gate after credentials pass)."""
    import pyotp

    db       = get_admin_client()
    metadata = _get_auth_user_metadata(db, req.user_id)
    secret   = metadata.get("two_fa_secret")

    if not secret:
        # 2FA not actually configured — let them through
        return OTPResponse(success=True, message="OK")

    if not pyotp.TOTP(secret).verify(req.code, valid_window=1):
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")

    return OTPResponse(success=True, message="Verified.")
