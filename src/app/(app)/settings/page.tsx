import { redirect } from "next/navigation";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { AccountSettings } from "@/components/settings/AccountSettings";

export const metadata = { title: "settings — halfnhalf" };

export default async function SettingsPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) redirect("/sign-in");

  const db = createServiceRoleClient();
  const { data: dbUser } = await db
    .from("users")
    .select("id, email, plan, role, created_at")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) redirect("/sign-in");

  return (
    <AccountSettings
      email={dbUser.email}
      plan={dbUser.plan as "free" | "pro"}
      role={dbUser.role as "user" | "admin"}
      createdAt={dbUser.created_at}
    />
  );
}
