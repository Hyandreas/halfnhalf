import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { signExportToken, hashToken } from "@/lib/export-token";
import { canExport } from "@/lib/usage";
import { EXPORT_TOKEN_EXPIRY_SECONDS } from "@/lib/constants";

export async function POST(req: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const clipTopName: string = String(body.clipTopName ?? "clip").trim().slice(0, 255);
  const clipBottomName: string = String(body.clipBottomName ?? "clip").trim().slice(0, 255);

  if (clipTopName.includes("\0") || clipBottomName.includes("\0")) {
    return Response.json({ error: "Invalid clip name" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: dbUser, error: userErr } = await supabase
    .from("users")
    .select("id, plan")
    .eq("auth_id", user.id)
    .single();

  if (userErr || !dbUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const allowed = await canExport(supabase, dbUser.id, dbUser.plan);
  if (!allowed) {
    return Response.json(
      { error: "Weekly export limit reached" },
      { status: 429 }
    );
  }

  const token = await signExportToken(dbUser.id);
  const tokenHash = hashToken(token);
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + EXPORT_TOKEN_EXPIRY_SECONDS * 1000);

  await supabase.from("export_tokens").insert({
    user_id: dbUser.id,
    token_hash: tokenHash,
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  });

  return Response.json({
    token,
    issuedAt: issuedAt.toISOString(),
    skipAd: dbUser.plan === "pro",
  });
}
