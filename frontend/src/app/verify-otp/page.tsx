"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function VerifyOTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(null);
    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every((d) => d !== "") && clean) {
      submitOTP(next.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const next = pasted.split("");
      setDigits(next);
      inputRefs.current[5]?.focus();
      submitOTP(pasted);
    }
  }

  async function submitOTP(code: string) {
    const stored = sessionStorage.getItem("sniper_pending_auth");
    if (!stored) {
      router.push("/signup");
      return;
    }
    const { email, password } = JSON.parse(stored);

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: code, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Invalid code. Please try again.");
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setLoading(false);
        return;
      }

      // Account created — sign in to get Supabase session
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("Account created but sign-in failed. Please go to sign in.");
        setLoading(false);
        return;
      }

      sessionStorage.removeItem("sniper_pending_auth");
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  async function handleResend() {
    const stored = sessionStorage.getItem("sniper_pending_auth");
    if (!stored) { router.push("/signup"); return; }
    const { email, password, fullName } = JSON.parse(stored);

    setResending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      if (res.ok) {
        setResendCooldown(60);
        setDigits(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        const d = await res.json();
        setError(d.detail || "Failed to resend. Try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setResending(false);
  }

  const maskedEmail = emailParam
    ? emailParam.replace(/(.{2}).+(@.+)/, "$1•••$2")
    : "your email";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "Interdisplay, Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>

        {/* Logo */}
        <div style={{ marginBottom: "3rem" }}>
          <Image src="/logo-new.png" alt="Astraventa" width={140} height={36} style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>

        {/* Heading */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 600,
              fontSize: "2rem",
              lineHeight: "1.2em",
              letterSpacing: "-1px",
              color: "#1d1d1d",
              margin: "0 0 0.625rem 0",
            }}
          >
            Check your inbox
          </h2>
          <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0, lineHeight: "1.6em" }}>
            We sent a 6-digit code to{" "}
            <strong style={{ color: "#1d1d1d" }}>{maskedEmail}</strong>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              borderRadius: "0.625rem",
              backgroundColor: "rgba(245,28,35,0.08)",
              border: "1px solid rgba(245,28,35,0.2)",
              color: "#c0392b",
              padding: "0.875rem 1.25rem",
              fontSize: "0.9375rem",
              fontWeight: 500,
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <div
          style={{ display: "flex", gap: "0.25rem", justifyContent: "center", marginBottom: "2rem" }}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "32px",
                height: "40px",
                textAlign: "center",
                fontSize: "0.9375rem",
                fontWeight: 700,
                fontFamily: "'Bricolage Grotesque', monospace",
                color: "#1d1d1d",
                border: `1px solid ${digit ? "#1d1d1d" : error ? "rgba(245,28,35,0.4)" : "#dde5ed"}`,
                borderRadius: "0.375rem",
                backgroundColor: digit ? "#f5f7fa" : "#ffffff",
                outline: "none",
                transition: "border-color 0.15s ease, background-color 0.15s ease",
                cursor: "text",
                flex: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#1d1d1d";
              }}
              onBlur={(e) => {
                if (!digit) e.target.style.borderColor = "#dde5ed";
              }}
            />
          ))}
        </div>

        {/* Submit button */}
        <button
          onClick={() => {
            const code = digits.join("");
            if (code.length === 6) submitOTP(code);
          }}
          disabled={loading || digits.some((d) => !d)}
          className="sniper-btn"
          style={{
            opacity: loading || digits.some((d) => !d) ? 0.5 : 1,
            marginBottom: "1.75rem",
          }}
        >
          {loading ? "Verifying…" : "Verify & activate account"}
        </button>

        {/* Resend */}
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "2rem" }}>
          {resendCooldown > 0 ? (
            <span style={{ color: "#bababa", fontSize: "0.9rem", fontWeight: 500 }}>
              Resend code in {resendCooldown}s
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                fontSize: "0.9375rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: 0,
              }}
            >
              <RotateCcw size={15} strokeWidth={2.5} />
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </div>

        {/* Back */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => router.push("/signup")}
            style={{
              background: "none",
              border: "none",
              color: "#4d585f",
              fontSize: "0.9rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff", fontFamily: "Interdisplay, Arial, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "28px", height: "28px", border: "2px solid #edf1f4", borderTopColor: "#1d1d1d", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 0.875rem" }} />
          <p style={{ color: "#bababa", fontSize: "0.875rem", margin: 0 }}>Loading…</p>
        </div>
      </div>
    }>
      <VerifyOTPForm />
    </Suspense>
  );
}
