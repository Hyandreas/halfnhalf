import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { verifyExportToken, hashToken } from "@/lib/export-token";
import { incrementUsage } from "@/lib/usage";
import { AD_DURATION_SECONDS } from "@/lib/constants";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
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

  // Verify JWT signature and expiry
  let payload: { userId: string };
  try {
    payload = await verifyExportToken(token);
  } catch {
    return Response.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  // Fetch user to check plan
  const { data: user } = await supabase
    .from("users")
    .select("id, plan")
    .eq("id", payload.userId)
    .single();

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Confirm clerk user matches token subject
  const { data: clerkUser } = await supabase
    .from("users")
    .select("id")
    .eq("clerk_id", userId)
    .eq("id", payload.userId)
    .single();

  if (!clerkUser) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Atomically claim the token: only succeeds if it exists, is unused, and not expired.
  // Using update with a WHERE clause means exactly one request wins the race.
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
    // Could be not found, already used, or expired — don't distinguish to avoid oracle attacks
    return Response.json({ error: "Token invalid, already used, or expired" }, { status: 409 });
  }

  const tokenRecord = claimedTokens[0];

  // Server-side 20-second enforcement (skipped for pro users)
  if (user.plan !== "pro") {
    const issuedAt = new Date(tokenRecord.issued_at).getTime();
    const elapsed = (Date.now() - issuedAt) / 1000;
    if (elapsed < AD_DURATION_SECONDS) {
      // Roll back the claim so the token can be retried after the wait
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

  // Record the export
  await incrementUsage(supabase, user.id, clipTopName, clipBottomName);

  return Response.json({ ok: true });
}
