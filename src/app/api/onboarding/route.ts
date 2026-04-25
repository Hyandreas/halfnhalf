import { NextResponse } from "next/server";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createAuthClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await req.json();
    const { name, birth_date, country, referral_source } = body as {
      name: string;
      birth_date: string;
      country: string;
      referral_source?: string;
    };

    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!birth_date) return NextResponse.json({ error: "Birth date is required" }, { status: 400 });
    if (!country?.trim()) return NextResponse.json({ error: "Country is required" }, { status: 400 });

    const db = createServiceRoleClient();
    const { error } = await db
      .from("users")
      .update({
        name: name.trim(),
        birth_date,
        country: country.trim(),
        referral_source: referral_source?.trim() || null,
        onboarding_completed: true,
      })
      .eq("auth_id", user.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
