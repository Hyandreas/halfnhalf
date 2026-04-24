import { createAuthClient, createServiceRoleClient } from "@/lib/supabase/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: Request) {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: dbUser } = await supabase
    .from("users")
    .select("id, email, plan")
    .eq("auth_id", user.id)
    .single();

  if (!dbUser) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (dbUser.plan === "pro") {
    return Response.json({ error: "Already on Pro plan" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(supabase, dbUser.id, dbUser.email);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      { price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!, quantity: 1 },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    subscription_data: {
      metadata: { supabase_user_id: dbUser.id },
    },
    metadata: { supabase_user_id: dbUser.id },
  });

  return Response.json({ url: session.url });
}
