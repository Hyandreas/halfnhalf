import { Webhook } from "svix";
import { headers } from "next/headers";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
  let event: {
    type: string;
    data: {
      id: string;
      email_addresses: Array<{ email_address: string }>;
    };
  };

  try {
    event = wh.verify(body, {
      "svix-id": headersList.get("svix-id")!,
      "svix-timestamp": headersList.get("svix-timestamp")!,
      "svix-signature": headersList.get("svix-signature")!,
    }) as typeof event;
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (event.type === "user.created") {
    const { id, email_addresses } = event.data;
    if (!email_addresses?.length) {
      return Response.json({ error: "No email address" }, { status: 400 });
    }
    await supabase.from("users").insert({
      clerk_id: id,
      email: email_addresses[0].email_address,
      plan: "free",
    });
  }

  if (event.type === "user.updated") {
    const { id, email_addresses } = event.data;
    if (!email_addresses?.length) {
      return Response.json({ error: "No email address" }, { status: 400 });
    }
    await supabase
      .from("users")
      .update({ email: email_addresses[0].email_address })
      .eq("clerk_id", id);
  }

  if (event.type === "user.deleted") {
    // Cascade deletes export_records + export_tokens via FK
    await supabase.from("users").delete().eq("clerk_id", event.data.id);
  }

  return Response.json({ received: true });
}
