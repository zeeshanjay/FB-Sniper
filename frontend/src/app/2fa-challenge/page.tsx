"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TWO_FA_TTL = 12 * 60 * 60 * 1000; // 12 hours
const TWO_FA_KEY = "2fa_verified_at";
function is2FAVerified()  { const t = localStorage.getItem(TWO_FA_KEY); return !!t && Date.now() - parseInt(t) < TWO_FA_TTL; }
function set2FAVerified() { localStorage.setItem(TWO_FA_KEY, Date.now().toString()); }
function clear2FAVerified(){ localStorage.removeItem(TWO_FA_KEY); }

export default function TwoFAChallengePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/signin");
        return;
      }
      // If 2FA verified within the last 12 hours on this device, skip
      if (is2FAVerified()) {
        router.replace("/dashboard");
        return;
      }
      setUserId(session.user.id);
      setChecking(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, [router]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || code.length !== 6) return;
    setLoading(true);
    setError(null);

    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const res = await fetch(`${apiBase}/api/auth/verify-2fa-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Verification failed.");
      set2FAVerified();
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setCode("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  async function handleSignOut() {
    clear2FAVerified();
    await supabase.auth.signOut();
    router.replace("/signin");
  }

  if (checking) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", backgroundColor: "#ffffff" }}>
        <div style={{ width: "32px", height: "32px", border: "3px solid #dde5ed", borderTop: "3px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Interdisplay, Arial, sans-serif" }}>

      {/* Left Panel */}
      <div
        className="hidden lg:flex"
        style={{ width: "50%", backgroundColor: "#1d1d1d", flexDirection: "column", justifyContent: "space-between", padding: "3rem", position: "relative", overflow: "hidden" }}
      >
        <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-80px", left: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(64,106,228,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div>
          <Image src="/logo-new-white.png" alt="Astraventa" width={160} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Shield icon */}
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="rgba(59,130,246,0.3)" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "2.5rem", lineHeight: "1.2em", letterSpacing: "-1px", color: "#ffffff", margin: "0 0 1rem" }}>
            Two-factor<br />
            <span style={{ color: "#3b82f6" }}>verification</span>
          </h1>
          <p style={{ color: "#bababa", fontSize: "1rem", lineHeight: "1.6em", fontWeight: 500, margin: 0, maxWidth: "380px" }}>
            Your account is protected with an authenticator app. Enter the 6-digit code to continue.
          </p>
        </div>

        <div style={{ display: "flex", gap: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "2rem", position: "relative", zIndex: 2 }}>
          {[
            { number: "TOTP", label: "Time-based code" },
            { number: "30s", label: "Code refresh window" },
            { number: "AES", label: "Encrypted secret" },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "#ffffff", lineHeight: 1, marginBottom: "0.25rem" }}>{stat.number}</div>
              <div style={{ color: "#4d585f", fontSize: "0.875rem", fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 2rem", backgroundColor: "#ffffff" }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>

          {/* Mobile logo */}
          <div className="flex lg:hidden" style={{ alignItems: "center", marginBottom: "2.5rem" }}>
            <Image src="/logo-new.png" alt="Astraventa" width={140} height={36} style={{ objectFit: "contain", objectPosition: "left" }} />
          </div>

          {/* Icon + heading */}
          <div style={{ marginBottom: "2.5rem" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#f0f5ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 600, fontSize: "1.875rem", lineHeight: "1.2em", letterSpacing: "-0.75px", color: "#1d1d1d", margin: "0 0 0.5rem" }}>
              Authenticator code
            </h2>
            <p style={{ color: "#4d585f", fontSize: "0.9375rem", fontWeight: 500, margin: 0 }}>
              Open Google Authenticator and enter the 6-digit code for your Astraventa account.
            </p>
          </div>

          {error && (
            <div style={{ borderRadius: "0.625rem", backgroundColor: "rgba(245,28,35,0.08)", border: "1px solid rgba(245,28,35,0.2)", color: "#c0392b", padding: "0.875rem 1.25rem", fontSize: "0.9375rem", fontWeight: 500, marginBottom: "1.25rem" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                6-digit code
              </label>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                required
                className="sniper-input"
                style={{ fontSize: "1.5rem", letterSpacing: "0.5em", textAlign: "center", fontWeight: 700 }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="sniper-btn"
              style={{ opacity: (loading || code.length !== 6) ? 0.5 : 1, marginBottom: "1rem" }}
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>

          <button
            onClick={handleSignOut}
            style={{ width: "100%", padding: "0.75rem", borderRadius: "0.625rem", border: "1px solid #dde5ed", backgroundColor: "transparent", color: "#4d585f", fontSize: "0.9375rem", fontWeight: 600, cursor: "pointer" }}
          >
            Sign out
          </button>

          <p style={{ textAlign: "center", color: "#bababa", fontSize: "0.8125rem", fontWeight: 500, margin: "1.5rem 0 0", lineHeight: "1.5em" }}>
            Lost access to your authenticator?<br />
            Contact support to recover your account.
          </p>
        </div>
      </div>
    </div>
  );
}
