"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);

    // OAuth provider returned an error before we even got a code
    const oauthError = params.get("error");
    const oauthErrorDesc = params.get("error_description");
    if (oauthError) {
      router.replace(`/signin?auth_error=${encodeURIComponent(oauthErrorDesc || oauthError)}`);
      return;
    }

    // Supabase auto-exchanges the ?code= param via detectSessionInUrl: true.
    // DO NOT call exchangeCodeForSession here — that would consume the
    // single-use code a second time and wipe the session.
    //
    // Instead, just wait for GoTrue to fire SIGNED_IN, then go to dashboard.
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    let timer: ReturnType<typeof setTimeout>;

    async function redirectAfterAuth(userId: string) {
      // If 2FA was already verified on this device (within TTL), this is a Google identity link — skip challenge
      const twoFaTs = localStorage.getItem("2fa_verified_at");
      if (twoFaTs && Date.now() - parseInt(twoFaTs) < 12 * 60 * 60 * 1000) {
        router.replace("/dashboard");
        return;
      }
      try {
        const r = await fetch(`${apiBase}/api/auth/2fa-status/${userId}`);
        const status = await r.json();
        if (status.two_fa_enabled) {
          router.replace("/2fa-challenge");
          return;
        }
      } catch {}
      router.replace("/dashboard");
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        subscription.unsubscribe();
        clearTimeout(timer);
        // Upsert avatar_url so Google photo stays fresh on each sign-in
        const meta = session.user.user_metadata;
        const avatarUrl = meta?.avatar_url || meta?.picture || null;
        if (avatarUrl) {
          await supabase.from("users").upsert(
            { id: session.user.id, avatar_url: avatarUrl, updated_at: new Date().toISOString() },
            { onConflict: "id" }
          );
        }
        await redirectAfterAuth(session.user.id);
      }
    });

    // Fallback: if no SIGNED_IN within 6 s, check session manually
    timer = setTimeout(async () => {
      subscription.unsubscribe();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirectAfterAuth(session.user.id);
      } else {
        const code = params.get("code");
        const errMsg = code
          ? "Session exchange timed out. Please try again."
          : "auth_callback_failed";
        router.replace(`/signin?auth_error=${encodeURIComponent(errMsg)}`);
      }
    }, 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        fontFamily: "Interdisplay, Arial, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid #dde5ed",
            borderTop: "3px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 1rem",
          }}
        />
        <p style={{ color: "#4d585f", fontSize: "0.9375rem", fontWeight: 500 }}>
          Signing you in…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
