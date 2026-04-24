import { redirect } from "next/navigation";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata = { title: "admin — halfnhalf" };

export default async function AdminPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/sign-in");

  const db = createServiceRoleClient();
  const { data: dbUser } = await db
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser || dbUser.role !== "admin") redirect("/studio");

  const [usersResult, exportsResult, weekExportsResult] = await Promise.all([
    db.from("users").select("id, email, plan, role, created_at").order("created_at", { ascending: false }),
    db.from("export_records").select("*", { count: "exact", head: true }),
    db.from("export_records").select("user_id").gte("exported_at", getWeekStart()),
  ]);

  const weeklyByUser: Record<string, number> = {};
  for (const row of weekExportsResult.data ?? []) {
    weeklyByUser[row.user_id] = (weeklyByUser[row.user_id] ?? 0) + 1;
  }

  const users = (usersResult.data ?? []).map((u) => ({
    ...u,
    weekly_exports: weeklyByUser[u.id] ?? 0,
  }));

  return (
    <AdminDashboard
      initialUsers={users as Parameters<typeof AdminDashboard>[0]["initialUsers"]}
      initialStats={{
        total_users: users.length,
        pro_users: users.filter((u) => u.plan === "pro").length,
        total_exports: exportsResult.count ?? 0,
      }}
      currentAdminId={dbUser.id}
    />
  );
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
