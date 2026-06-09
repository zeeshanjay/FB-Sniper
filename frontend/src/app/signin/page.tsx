"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function resolveAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("already been registered"))
    return "This email is already registered with email & password. Sign in below — then link Google from Settings.";
  if (lower.includes("email not confirmed"))
    return "Please verify your email before signing in.";
  if (lower.includes("invalid login") || lower.includes("invalid credentials"))
    return "Incorrect email or password.";
  if (lower === "auth_callback_failed")
    return "Google sign-in failed. Make sure Google is enabled in your Supabase project and the redirect URL is whitelisted.";
  return raw; // show the actual error so we know what's happening
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");
    if (authError) {
      setError(resolveAuthError(decodeURIComponent(authError)));
      // Remove query param so refresh doesn't re-show the error
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Check 2FA before entering dashboard
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const r = await fetch(`${apiBase}/api/auth/2fa-status/${data.user.id}`);
      const status = await r.json();
      if (status.two_fa_enabled) {
        router.push("/2fa-challenge");
        return;
      }
    } catch {}

    router.push("/dashboard");
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
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
        {/* Background decoration */}
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

        {/* Hero text */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              borderRadius: "6.25rem",
              padding: "0.375rem 1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
              }}
            />
            <span style={{ color: "#dde5ed", fontSize: "0.875rem", fontWeight: 500 }}>
              FB Sniper — Elite Automation
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 600,
              fontSize: "3rem",
              lineHeight: "1.2em",
              letterSpacing: "-1px",
              color: "#ffffff",
              margin: "0 0 1.25rem 0",
            }}
          >
            Automate Facebook.
            <br />
            <span style={{ color: "#3b82f6" }}>Dominate</span> the feed.
          </h1>

          <p
            style={{
              color: "#bababa",
              fontSize: "1.125rem",
              lineHeight: "1.6em",
              fontWeight: 500,
              margin: 0,
              maxWidth: "420px",
            }}
          >
            Connect your Meta account, define your targets, and let the Sniper Engine handle the rest. Precision automation for elite operators.
          </p>
        </div>

        {/* Bottom stats */}
        <div
          style={{
            display: "flex",
            gap: "2.5rem",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            paddingTop: "2rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {[
            { number: "60-day", label: "Token lifetime" },
            { number: "100%", label: "Isolated data" },
            { number: "∞", label: "Scale" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontWeight: 700,
                  fontSize: "1.5rem",
                  color: "#ffffff",
                  lineHeight: 1,
                  marginBottom: "0.25rem",
                }}
              >
                {stat.number}
              </div>
              <div style={{ color: "#4d585f", fontSize: "0.875rem", fontWeight: 500 }}>
                {stat.label}
              </div>
            </div>
          ))}
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
            <Image
              src="/logo-new.png"
              alt="Astraventa"
              width={140}
              height={36}
              style={{ objectFit: "contain", objectPosition: "left" }}
            />
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
              Welcome back
            </h2>
            <p style={{ color: "#4d585f", fontSize: "1rem", fontWeight: 500, margin: 0 }}>
              Sign in to your Sniper dashboard
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
            onClick={handleGoogleSignIn}
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde5ed" }} />
            <span style={{ color: "#bababa", fontSize: "0.875rem", fontWeight: 500 }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#dde5ed" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  color: "#1d1d1d",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
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

            <div style={{ marginBottom: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label
                  style={{
                    color: "#1d1d1d",
                    fontSize: "0.9375rem",
                    fontWeight: 600,
                  }}
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  style={{
                    color: "#3b82f6",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="sniper-input"
              />
            </div>

            <div style={{ marginBottom: "2rem", marginTop: "1.5rem" }}>
              <button
                type="submit"
                disabled={loading}
                className="sniper-btn"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <p
            style={{
              textAlign: "center",
              color: "#4d585f",
              fontSize: "0.9375rem",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              style={{
                color: "#1d1d1d",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Create one free
            </Link>
          </p>

          {/* Terms link */}
          <p
            style={{
              textAlign: "center",
              color: "#4d585f",
              fontSize: "0.875rem",
              fontWeight: 500,
              margin: "1rem 0 0 0",
            }}
          >
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              style={{
                color: "#3b82f6",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
