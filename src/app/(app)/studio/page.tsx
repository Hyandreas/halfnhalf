import { redirect } from "next/navigation";
import { StudioPage } from "@/components/studio/StudioPage";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getWeeklyUsage, canExport } from "@/lib/usage";
import { FREE_EXPORTS_PER_WEEK } from "@/lib/constants";

export const metadata = {
  title: "studio — halfnhalf",
};

export default async function Studio() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  let plan: "free" | "pro" = "free";
  let exportsUsed = 0;
  let exportAllowed = true;

  try {
    const db = createServiceRoleClient();
    const { data: dbUser } = await db
      .from("users")
      .select("id, plan")
      .eq("auth_id", user.id)
      .single();

    if (dbUser) {
      plan = dbUser.plan === "pro" ? "pro" : "free";
      if (plan === "free") {
        exportsUsed = await getWeeklyUsage(db, dbUser.id);
        exportAllowed = exportsUsed < FREE_EXPORTS_PER_WEEK;
      }
    }
  } catch {
    // DB not configured — allow export (dev mode)
  }

  return (
    <StudioPage
      plan={plan}
      exportsUsed={exportsUsed}
      canExport={exportAllowed}
    />
  );
}
