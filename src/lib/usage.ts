import { SupabaseClient } from "@supabase/supabase-js";
import { FREE_EXPORTS_PER_WEEK } from "./constants";

function getWeekStart(): Date {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day; // back to Monday
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() + diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export async function getWeeklyUsage(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const weekStart = getWeekStart();

  const { count, error } = await supabase
    .from("export_records")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("exported_at", weekStart.toISOString());

  if (error) throw error;
  return count ?? 0;
}

export async function canExport(
  supabase: SupabaseClient,
  userId: string,
  plan: string,
  role = "user"
): Promise<boolean> {
  if (plan === "pro" || role === "admin") return true;
  const usage = await getWeeklyUsage(supabase, userId);
  return usage < FREE_EXPORTS_PER_WEEK;
}

export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string,
  clipTopName: string,
  clipBottomName: string
): Promise<void> {
  const { error } = await supabase.from("export_records").insert({
    user_id: userId,
    clip_top_name: clipTopName,
    clip_bottom_name: clipBottomName,
  });
  if (error) throw error;
}
