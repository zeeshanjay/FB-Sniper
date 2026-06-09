"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const emailParam   = searchParams.get("email") || "";

  const [email, setEmail]       = useState(emailParam);
  const [otp, setOtp]           = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  const strength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8)          s++;
    if (/[A-Z]/.test(password))        s++;
    if (/[0-9]/.test(password))        s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) { setError("Enter the 6-digit code from your email."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBase}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otp, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Something went wrong.");
      setSuccess(true);
      setTimeout(() => router.push("/signin"), 2500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const eyeIcon = (visible: boolean) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {visible ? (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
      ) : (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      )}
    </svg>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Interdisplay, Arial, sans-serif" }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex"
        style={{ width: "50%", backgroundColor: "#1d1d1d", flexDirection: "column", justifyContent: "space-between", padding: "3rem", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(64,106,228,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Image src="/logo-new.png" alt="Astraventa" width={160} height={40} style={{ objectFit: "contain", objectPosition: "left", filter: "brightness(0) invert(1)" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6.25rem", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span style={{ color: "#dde5ed", fontSize: "0.875rem", fontWeight: 500 }}>FB Sniper — Elite Automation</span>
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "3rem", lineHeight: "1.2em", letterSpacing: "-1px", color: "#ffffff", margin: "0 0 1.25rem 0" }}>
            New password,<br /><span style={{ color: "#3b82f6" }}>fresh</span> start.
          </h1>
          <p style={{ color: "#bababa", fontSize: "1.125rem", lineHeight: "1.6em", fontWeight: 500, margin: 0, maxWidth: "420px" }}>
            Enter the code from your email and choose a strong new password to secure your account.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", position: "relative", zIndex: 2 }}>
          {[{ number: "60-day", label: "Token lifetime" }, { number: "100%", label: "Isolated data" }, { number: "∞", label: "Scale" }].map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "#ffffff", lineHeight: 1, marginBottom: "0.25rem" }}>{s.number}</div>
              <div style={{ color: "#4d585f", fontSize: "0.875rem", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", backgroundColor: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: "center", marginBottom: "2.5rem" }}>
            <Image src="/logo-new.png" alt="Astraventa" width={140} height={36} style={{ objectFit: "contain", objectPosition: "left" }} />
          </div>

          {!success ? (
            <>
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", backgroundColor: "#f0f4ff", border: "1px solid #dde5ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "2rem", lineHeight: "1.2em", letterSpacing: "-1px", color: "#1d1d1d", margin: "0 0 0.625rem 0" }}>
                  Set new password
                </h2>
                <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
                  Enter the code we emailed you, then choose a new password.
                </p>
              </div>

              {error && (
                <div style={{ borderRadius: "0.625rem", backgroundColor: "rgba(245,28,35,0.08)", border: "1px solid rgba(245,28,35,0.2)", color: "#c0392b", padding: "0.875rem 1.25rem", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "1.25rem" }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email — pre-filled, editable */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="sniper-input" />
                </div>

                {/* OTP code */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>6-digit reset code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    required
                    className="sniper-input"
                    style={{ letterSpacing: "0.35em", fontFamily: "'Courier New', monospace", fontSize: "1.25rem", textAlign: "center" }}
                  />
                </div>

                {/* New password */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>New password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="sniper-input" style={{ paddingRight: "3rem" }} />
                    <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bababa", padding: 0, display: "flex", alignItems: "center" }}>
                      {eyeIcon(showPass)}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div style={{ marginTop: "0.625rem" }}>
                      <div style={{ display: "flex", gap: "4px", marginBottom: "0.375rem" }}>
                        {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: "3px", borderRadius: "99px", backgroundColor: i <= strength ? strengthColor : "#edf1f4", transition: "background-color 0.2s ease" }} />)}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: 600, color: strengthColor }}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: "1.75rem" }}>
                  <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>Confirm password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConf ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="sniper-input"
                      style={{ paddingRight: "3rem", borderColor: confirm.length > 0 ? (confirm === password ? "#10b981" : "#ef4444") : undefined }}
                    />
                    <button type="button" onClick={() => setShowConf(v => !v)} style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#bababa", padding: 0, display: "flex", alignItems: "center" }}>
                      {eyeIcon(showConf)}
                    </button>
                  </div>
                  {confirm.length > 0 && confirm !== password && <p style={{ margin: "0.375rem 0 0", fontSize: "0.75rem", fontWeight: 600, color: "#ef4444" }}>Passwords do not match</p>}
                  {confirm.length > 0 && confirm === password && <p style={{ margin: "0.375rem 0 0", fontSize: "0.75rem", fontWeight: 600, color: "#10b981" }}>Passwords match ✓</p>}
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <button type="submit" disabled={loading} className="sniper-btn" style={{ opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Saving…" : "Save new password"}
                  </button>
                </div>
              </form>

              <p style={{ textAlign: "center", color: "#4d585f", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>
                Didn&apos;t get a code?{" "}
                <Link href="/forgot-password" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>Resend</Link>
                {" · "}
                <Link href="/signin" style={{ color: "#1d1d1d", fontWeight: 600, textDecoration: "none" }}>Back to sign in</Link>
              </p>
            </>
          ) : (
            /* ── Success ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", animation: "fadeSlideUp 0.3s ease" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.75px", color: "#1d1d1d", margin: "0 0 0.75rem 0" }}>Password updated!</h2>
              <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: "0 0 2rem 0", lineHeight: "1.6em" }}>
                Your password has been changed successfully.<br />Redirecting you to sign in…
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                {[0,1,2].map(i => <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: i === 0 ? "#10b981" : "#dde5ed" }} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: "Interdisplay, Arial, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "28px", height: "28px", border: "2px solid #edf1f4", borderTopColor: "#1d1d1d", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 0.875rem" }} />
          <p style={{ color: "#bababa", fontSize: "0.875rem", margin: 0 }}>Loading…</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
