"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Target, Key, BarChart3, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Failed to send verification code.");
        setLoading(false);
        return;
      }

      // Store credentials temporarily for OTP page
      sessionStorage.setItem("sniper_pending_auth", JSON.stringify({ email, password, fullName }));
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch {
      setError("Network error. Is the backend running?");
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Interdisplay, Arial, sans-serif" }}>

      {/* Left Panel — Dark / Brand */}
      <div
        style={{
          width: "50%",
          backgroundColor: "#1d1d1d",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "3rem",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden lg:flex"
      >
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            left: "-80px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(64,106,228,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div>
          <Image src="/logo-new-white.png" alt="Astraventa" width={160} height={40} style={{ objectFit: "contain", objectPosition: "left" }} />
        </div>

        {/* Feature checklist */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <h2
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 600,
              fontSize: "2.5rem",
              lineHeight: "1.2em",
              letterSpacing: "-1px",
              color: "#ffffff",
              margin: "0 0 2rem 0",
            }}
          >
            Start automating
            <br />
            in minutes.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              { Icon: Target,     title: "Precision Targeting",    desc: "Target specific groups and pages with surgical accuracy." },
              { Icon: Key,        title: "60-Day Tokens",          desc: "Auto-exchange to long-lived tokens. No constant re-auth." },
              { Icon: BarChart3,  title: "Full Audit Trail",       desc: "Every action logged with status, timestamp, and metadata." },
              { Icon: ShieldCheck, title: "Multi-Tenant Isolation", desc: "Your data is fully isolated from all other users." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="#3b82f6" strokeWidth={1.75} />
                </div>
                <div>
                  <div style={{ color: "#ffffff", fontWeight: 600, fontSize: "0.9375rem", marginBottom: "0.2rem" }}>
                    {title}
                  </div>
                  <div style={{ color: "#4d585f", fontSize: "0.875rem", lineHeight: "1.5em" }}>
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "1.5rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          <p style={{ color: "#4d585f", fontSize: "0.875rem", margin: 0 }}>
            Free to start. No credit card required.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem 2rem",
          backgroundColor: "#ffffff",
        }}
      >
        <div style={{ width: "100%", maxWidth: "420px" }}>

          {/* Mobile logo */}
          <div
            className="flex lg:hidden"
            style={{ alignItems: "center", marginBottom: "2.5rem" }}
          >
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
              Create your account
            </h2>
            <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
              Get started with FB Sniper today
            </p>
          </div>

          {/* Error message */}
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
                marginBottom: "1.25rem",
              }}
            >
              {error}
            </div>
          )}

          {/* Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading}
            className="sniper-btn-outline"
            style={{ marginBottom: "1.5rem" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde5ed" }} />
            <span style={{ color: "#bababa", fontSize: "0.875rem", fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde5ed" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Smith"
                required
                className="sniper-input"
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="sniper-input"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#1d1d1d", fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="sniper-input"
              />
            </div>

            {/* Terms */}
            <p style={{ color: "#bababa", fontSize: "0.8125rem", lineHeight: "1.5em", marginBottom: "1.5rem" }}>
              By creating an account you agree to our{" "}
              <Link href="/terms" style={{ color: "#1d1d1d", fontWeight: 600, textDecoration: "none" }}>Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" style={{ color: "#1d1d1d", fontWeight: 600, textDecoration: "none" }}>Privacy Policy</Link>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="sniper-btn"
              style={{ opacity: loading ? 0.6 : 1, marginBottom: "2rem" }}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          {/* Sign in link */}
          <p style={{ textAlign: "center", color: "#4d585f", fontSize: "0.9375rem", fontWeight: 500, margin: 0 }}>
            Already have an account?{" "}
            <Link href="/signin" style={{ color: "#1d1d1d", fontWeight: 700, textDecoration: "none" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
