"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Resolve dark mode for conditional assets
const getResolvedDark = () => {
  if (typeof window === "undefined") return false;
  const theme = document.documentElement.getAttribute("data-theme");
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  return theme === "dark" || (theme === "system" && mq.matches);
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Fire the request but always show success — never reveal whether
    // the email is registered or expose backend errors (security + UX).
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      await fetch(`${apiBase}/api/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Network error — still show "check inbox" so user experience is clean.
    } finally {
      setLoading(false);
      setSent(true);
    }
  }

  function handleContinue() {
    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Interdisplay, Arial, sans-serif" }}>

      {/* ── Left Panel ── */}
      <div
        className="hidden lg:flex"
        style={{ width: "50%", backgroundColor: "#1d1d1d", flexDirection: "column", justifyContent: "space-between", padding: "3rem", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(64,106,228,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <Image src="/logo-new-white.png" alt="Astraventa" width={160} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6.25rem", padding: "0.375rem 1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
            <span style={{ color: "#dde5ed", fontSize: "0.875rem", fontWeight: 500 }}>FB Sniper — Elite Automation</span>
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "3rem", lineHeight: "1.2em", letterSpacing: "-1px", color: "#ffffff", margin: "0 0 1.25rem 0" }}>
            Secure access,<br /><span style={{ color: "#3b82f6" }}>zero</span> compromise.
          </h1>
          <p style={{ color: "#bababa", fontSize: "1.125rem", lineHeight: "1.6em", fontWeight: 500, margin: 0, maxWidth: "420px" }}>
            We&apos;ll send a 6-digit code to your inbox. Use it to set a fresh password and get back in.
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
              <Image src={getResolvedDark() ? "/logo-new-white.png" : "/logo-new.png"} alt="Astraventa" width={140} height={36} style={{ objectFit: "contain", objectPosition: "left" }} />
            </div>

          {!sent ? (
            <>
              <div style={{ marginBottom: "2.5rem" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "0.75rem", backgroundColor: "#f0f4ff", border: "1px solid #dde5ed", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "2rem", lineHeight: "1.2em", letterSpacing: "-1px", color: "#1d1d1d", margin: "0 0 0.625rem 0" }}>
                  Forgot password?
                </h2>
                <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0, lineHeight: "1.5em" }}>
                  Enter your email and we&apos;ll send you a 6-digit reset code.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>Email address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="sniper-input" />
                </div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <button type="submit" disabled={loading} className="sniper-btn" style={{ opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Sending…" : "Send reset code"}
                  </button>
                </div>
              </form>

              <p style={{ textAlign: "center", color: "#4d585f", fontSize: "0.9375rem", fontWeight: 500, margin: 0 }}>
                Remembered it?{" "}
                <Link href="/signin" style={{ color: "#1d1d1d", fontWeight: 700, textDecoration: "none" }}>Back to sign in</Link>
              </p>
            </>
          ) : (
            /* ── Sent state ── */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>

              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.75rem", letterSpacing: "-0.75px", color: "#1d1d1d", margin: "0 0 0.75rem 0" }}>
                Check your inbox
              </h2>
              <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: "0 0 0.375rem 0", lineHeight: "1.6em" }}>
                We sent a 6-digit code to
              </p>
              <p style={{ color: "#1d1d1d", fontWeight: 700, fontSize: "1rem", margin: "0 0 2rem 0" }}>
                {email}
              </p>

              <button onClick={handleContinue} className="sniper-btn" style={{ marginBottom: "1.5rem" }}>
                Enter reset code →
              </button>

              <div style={{ backgroundColor: "#f5f7fa", borderRadius: "0.75rem", border: "1px solid #edf1f4", padding: "1rem 1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "#4d585f", lineHeight: "1.6em" }}>
                  <strong style={{ color: "#1d1d1d" }}>Didn&apos;t receive it?</strong> Check your spam folder, or{" "}
                  <button type="button" onClick={() => { setSent(false); }} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: 600, cursor: "pointer", padding: 0, fontSize: "0.875rem", fontFamily: "Interdisplay, Arial, sans-serif" }}>
                    try another email
                  </button>.
                </p>
              </div>

              <Link href="/signin" style={{ display: "block", textAlign: "center", color: "#4d585f", fontWeight: 500, fontSize: "0.9375rem", textDecoration: "none" }}>
                ← Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
