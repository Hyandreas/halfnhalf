import { NextResponse } from "next/server";
import { createAuthClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Re-authenticate with current password to verify it
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (signInError) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
