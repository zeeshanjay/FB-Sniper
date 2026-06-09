import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const APP_ID       = process.env.META_APP_ID!;
const APP_SECRET   = process.env.META_APP_SECRET!;
const REDIRECT_URI = "http://localhost:3000/api/auth/callback";
const SUPABASE_URL = "https://rqpslulmmzlxnfkpphpg.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY!;

const DASH = "http://localhost:3000/dashboard";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code    = searchParams.get("code");
  const fbError = searchParams.get("error");
  const userId  = searchParams.get("state"); // Supabase user ID passed as state

  if (fbError || !code) {
    return NextResponse.redirect(
      `${DASH}?meta_error=${encodeURIComponent(fbError ?? "access_denied")}&activeNav=Meta+Token`
    );
  }

  try {
    // ── 1. Exchange code → short-lived access token ──────────────────────────
    const shortRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token` +
      `?client_id=${APP_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&client_secret=${APP_SECRET}` +
      `&code=${code}`
    );
    const shortData = await shortRes.json();

    if (shortData.error) {
      console.error("[callback] short-lived exchange error:", shortData.error);
      return NextResponse.redirect(`${DASH}?meta_error=token_exchange_failed&activeNav=Meta+Token`);
    }

    // ── 2. Exchange short-lived → long-lived token (~60 days) ────────────────
    const longRes = await fetch(
      `https://graph.facebook.com/v20.0/oauth/access_token` +
      `?grant_type=fb_exchange_token` +
      `&client_id=${APP_ID}` +
      `&client_secret=${APP_SECRET}` +
      `&fb_exchange_token=${shortData.access_token}`
    );
    const longData = await longRes.json();

    const finalToken = longData.access_token ?? shortData.access_token;
    const expiresIn  = longData.expires_in   ?? 5183944; // 60-day fallback

    // ── 3. Fetch Meta user ID via /me ─────────────────────────────────────────
    const meRes  = await fetch(`https://graph.facebook.com/me?access_token=${finalToken}`);
    const meData = await meRes.json();
    const metaUserId = meData.id ?? null;

    // ── 4. Persist to Supabase (service-role bypasses RLS) ───────────────────
    if (userId) {
      const supabase  = createClient(SUPABASE_URL, SERVICE_KEY);
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      const payload = {
        access_token: finalToken,
        token_type:   "long_lived",
        expires_at:   expiresAt,
        scopes: [
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_posts",
          "pages_manage_engagement",
          "publish_to_groups",
          "groups_access_member_info",
        ],
        meta_user_id: metaUserId,
        is_active:    true,
      };

      // Check if this specific Facebook account is already connected
      const { data: existing } = await supabase
        .from("meta_tokens")
        .select("id")
        .eq("user_id", userId)
        .eq("meta_user_id", metaUserId)
        .maybeSingle();

      if (existing?.id) {
        await supabase.from("meta_tokens").update(payload).eq("id", existing.id);
      } else {
        // Check limit before inserting
        const { count } = await supabase
          .from("meta_tokens")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId);

        if (count !== null && count >= 5) {
          return NextResponse.redirect(`${DASH}?meta_error=account_limit_reached&activeNav=Meta+Token`);
        }

        await supabase.from("meta_tokens").insert({ user_id: userId, ...payload });
      }
    }

    return NextResponse.redirect(`${DASH}?meta_connected=true&activeNav=Meta+Token`);
  } catch (err) {
    console.error("[callback] unexpected error:", err);
    return NextResponse.redirect(`${DASH}?meta_error=server_error&activeNav=Meta+Token`);
  }
}
