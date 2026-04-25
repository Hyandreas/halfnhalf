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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const db = createServiceRoleClient();

  // Look up the auth_id for this public user id
  const { data: dbUser } = await db
    .from("users")
    .select("auth_id")
    .eq("id", id)
    .single();

  if (!dbUser) return Response.json({ error: "User not found" }, { status: 404 });

  // Fetch auth metadata via service role admin API
  const { data: authUser, error } = await db.auth.admin.getUserById(dbUser.auth_id);
  if (error || !authUser?.user) {
    return Response.json({ error: "Could not fetch auth info" }, { status: 500 });
  }

  const u = authUser.user;
  return Response.json({
    last_sign_in_at: u.last_sign_in_at ?? null,
    created_at: u.created_at ?? null,
    providers: u.app_metadata?.providers ?? (u.app_metadata?.provider ? [u.app_metadata.provider] : []),
    email_confirmed: !!u.email_confirmed_at,
    email_confirmed_at: u.email_confirmed_at ?? null,
  });
}
