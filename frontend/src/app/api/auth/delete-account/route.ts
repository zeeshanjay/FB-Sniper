import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rqpslulmmzlxnfkpphpg.supabase.co";
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    await admin.from("meta_tokens").delete().eq("user_id", userId);
    await admin.from("target_groups").delete().eq("user_id", userId);
    await admin.from("automation_posts").delete().eq("user_id", userId);

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
