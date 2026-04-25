import { redirect } from "next/navigation";
import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

export const metadata = { title: "welcome — halfnhalf" };

export default async function OnboardingPage() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const db = createServiceRoleClient();
  const { data: dbUser } = await db
    .from("users")
    .select("onboarding_completed")
    .eq("auth_id", user.id)
    .single();

  if (dbUser?.onboarding_completed) redirect("/studio");

  return <OnboardingForm />;
}
