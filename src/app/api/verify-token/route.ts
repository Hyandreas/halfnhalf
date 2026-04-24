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
  const { token, clipTopName = "clip", clipBottomName = "clip" } = body as {
    token: string;
    clipTopName?: string;
    clipBottomName?: string;
  };

  if (!token) {
    return Response.json({ error: "Missing token" }, { status: 400 });
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

  // Look up the token record
  const tokenHash = hashToken(token);
  const { data: tokenRecord } = await supabase
    .from("export_tokens")
    .select("id, issued_at, used")
    .eq("token_hash", tokenHash)
    .single();

  if (!tokenRecord) {
    return Response.json({ error: "Token not found" }, { status: 401 });
  }

  if (tokenRecord.used) {
    return Response.json({ error: "Token already used" }, { status: 409 });
  }

  // Server-side 20-second enforcement (skipped for pro users)
  if (user.plan !== "pro") {
    const issuedAt = new Date(tokenRecord.issued_at).getTime();
    const elapsed = (Date.now() - issuedAt) / 1000;
    if (elapsed < AD_DURATION_SECONDS) {
      return Response.json(
        { error: `Please wait ${Math.ceil(AD_DURATION_SECONDS - elapsed)} more seconds` },
        { status: 425 }
      );
    }
  }

  // Mark token as used
  await supabase
    .from("export_tokens")
    .update({ used: true, used_at: new Date().toISOString() })
    .eq("id", tokenRecord.id);

  // Record the export
  await incrementUsage(supabase, user.id, clipTopName, clipBottomName);

  return Response.json({ ok: true });
}
