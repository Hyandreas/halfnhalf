import { NextResponse } from "next/server";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function DELETE() {
  try {
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const db = createServiceRoleClient();

    const { data: dbUser } = await db
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (dbUser) {
      await db.from("export_records").delete().eq("user_id", dbUser.id);
      await db.from("export_tokens").delete().eq("user_id", dbUser.id);
      await db.from("users").delete().eq("id", dbUser.id);
    }

    // Delete the auth user (requires service role admin API)
    const { error: authDeleteError } = await db.auth.admin.deleteUser(user.id);
    if (authDeleteError) {
      return NextResponse.json({ error: authDeleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
