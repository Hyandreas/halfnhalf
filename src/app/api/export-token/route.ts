import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { signExportToken, hashToken } from "@/lib/export-token";
import { canExport } from "@/lib/usage";
import { EXPORT_TOKEN_EXPIRY_SECONDS } from "@/lib/constants";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const clipTopName: string = body.clipTopName ?? "clip";
  const clipBottomName: string = body.clipBottomName ?? "clip";

  const supabase = createServiceRoleClient();
  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, plan")
    .eq("clerk_id", userId)
    .single();

  if (userErr || !user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const allowed = await canExport(supabase, user.id, user.plan);
  if (!allowed) {
    return Response.json(
      { error: "Weekly export limit reached" },
      { status: 429 }
    );
  }

  const token = await signExportToken(user.id);
  const tokenHash = hashToken(token);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + EXPORT_TOKEN_EXPIRY_SECONDS * 1000);

  await supabase.from("export_tokens").insert({
    user_id: user.id,
    token_hash: tokenHash,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  // Store clip names for later use in incrementUsage (via verify-token)
  // We embed them in a separate field to avoid round-trip DB reads
  // They'll be re-sent by the client in verify-token

  return Response.json({
    token,
    issuedAt: issuedAt.toISOString(),
    skipAd: user.plan === "pro",
  });
}
