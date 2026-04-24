import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  let plan: "free" | "pro" = "free";
  try {
    const db = createServiceRoleClient();
    const { data } = await db
      .from("users")
      .select("plan")
      .eq("auth_id", user.id)
      .single();
    if (data?.plan === "pro") plan = "pro";
  } catch {
    // DB not configured yet — default to free
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar plan={plan} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
