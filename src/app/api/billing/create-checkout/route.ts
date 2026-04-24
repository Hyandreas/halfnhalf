import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { stripe, getOrCreateStripeCustomer } from "@/lib/stripe";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, email, plan")
    .eq("clerk_id", userId)
    .single();

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.plan === "pro") {
    return Response.json({ error: "Already on Pro plan" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(
    supabase,
    user.id,
    user.email,
    userId
  );

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [
      { price: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!, quantity: 1 },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
    metadata: { supabase_user_id: user.id },
  });

  return Response.json({ url: session.url });
}
