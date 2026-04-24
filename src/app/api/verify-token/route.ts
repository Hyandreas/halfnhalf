import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { verifyExportToken, hashToken } from "@/lib/export-token";
import { incrementUsage } from "@/lib/usage";
import { AD_DURATION_SECONDS } from "@/lib/constants";

export async function POST(req: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { token } = body as { token: string };
  const clipTopName = String(body.clipTopName ?? "clip").trim().slice(0, 255);
  const clipBottomName = String(body.clipBottomName ?? "clip").trim().slice(0, 255);

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
  }

  if (clipTopName.includes("\0") || clipBottomName.includes("\0")) {
    return Response.json({ error: "Invalid clip name" }, { status: 400 });
  }

  let payload: { userId: string };
  try {
    payload = await verifyExportToken(token);
  } catch {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const { data: dbUser } = await supabase
    .from("users")
    .select("id, plan, role")
    .eq("id", payload.userId)
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const tokenHash = hashToken(token);
  const now = new Date().toISOString();
  const { data: claimedTokens, error: claimError } = await supabase
    .from("export_tokens")
    .update({ used: true, used_at: now })
    .eq("token_hash", tokenHash)
    .eq("used", false)
    .gt("expires_at", now)
    .select("id, issued_at");

  if (claimError || !claimedTokens || claimedTokens.length === 0) {
    return Response.json({ error: "Token invalid, already used, or expired" }, { status: 409 });
  }

  const tokenRecord = claimedTokens[0];

  if (dbUser.plan !== "pro" && dbUser.role !== "admin") {
    const issuedAt = new Date(tokenRecord.issued_at).getTime();
    const elapsed = (Date.now() - issuedAt) / 1000;
    if (elapsed < AD_DURATION_SECONDS) {
      await supabase
        .from("export_tokens")
        .update({ used: false, used_at: null })
        .eq("id", tokenRecord.id);
      return Response.json(
        { error: `Please wait ${Math.ceil(AD_DURATION_SECONDS - elapsed)} more seconds` },
        { status: 425 }
      );
    }
  }

  await incrementUsage(supabase, dbUser.id, clipTopName, clipBottomName);

  return Response.json({ ok: true });
}
