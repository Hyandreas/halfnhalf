import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { createServiceRoleClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let plan: "free" | "pro" = "free";
  try {
    const supabase = createServiceRoleClient();
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("clerk_id", userId)
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
