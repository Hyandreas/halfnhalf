import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudioPage } from "@/components/studio/StudioPage";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { getWeeklyUsage, canExport } from "@/lib/usage";
import { FREE_EXPORTS_PER_WEEK } from "@/lib/constants";

export const metadata = {
  title: "studio — halfnhalf",
};

export default async function Studio() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let plan: "free" | "pro" = "free";
  let exportsUsed = 0;
  let exportAllowed = true;

  try {
    const supabase = createServiceRoleClient();
    const { data: user } = await supabase
      .from("users")
      .select("id, plan")
      .eq("clerk_id", userId)
      .single();

    if (user) {
      plan = user.plan === "pro" ? "pro" : "free";
      if (plan === "free") {
        exportsUsed = await getWeeklyUsage(supabase, user.id);
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
