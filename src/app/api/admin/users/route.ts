import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";

async function getAdminUser() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return null;

  const supabase = createServiceRoleClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "admin") return null;
  return dbUser;
}

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const supabase = createServiceRoleClient();

  const [usersResult, exportsResult, weekExportsResult] = await Promise.all([
    supabase.from("users").select("id, email, plan, role, created_at").order("created_at", { ascending: false }),
    supabase.from("export_records").select("*", { count: "exact", head: true }),
    supabase.from("export_records")
      .select("user_id", { count: "exact" })
      .gte("exported_at", getWeekStart()),
  ]);

  const weeklyByUser: Record<string, number> = {};
  if (weekExportsResult.data) {
    for (const row of weekExportsResult.data) {
      weeklyByUser[row.user_id] = (weeklyByUser[row.user_id] ?? 0) + 1;
    }
  }

  const users = (usersResult.data ?? []).map((u) => ({
    ...u,
    weekly_exports: weeklyByUser[u.id] ?? 0,
  }));

  return Response.json({
    users,
    stats: {
      total_users: users.length,
      pro_users: users.filter((u) => u.plan === "pro").length,
      total_exports: exportsResult.count ?? 0,
    },
  });
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { userId, field, value } = body as { userId: string; field: string; value: string };

  if (!userId || !field || !value) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  if (field === "plan" && !["free", "pro"].includes(value)) {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }
  if (field === "role" && !["user", "admin"].includes(value)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }
  if (field !== "plan" && field !== "role") {
    return Response.json({ error: "Invalid field" }, { status: 400 });
  }

  // Prevent self-demotion
  if (field === "role" && userId === admin.id && value === "user") {
    return Response.json({ error: "Cannot remove your own admin role" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("users").update({ [field]: value }).eq("id", userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday.toISOString();
}
