import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser?.stripe_customer_id) {
    return Response.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: dbUser.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return Response.json({ url: session.url });
}
