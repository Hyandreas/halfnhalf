import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const supabaseUserId = session.metadata?.supabase_user_id;
      const subscriptionId = session.subscription as string;

      if (supabaseUserId && subscriptionId) {
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        await supabase
          .from("users")
          .update({
            plan: "pro",
            stripe_subscription_id: subscriptionId,
            subscription_status: sub.status,
          })
          .eq("id", supabaseUserId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const supabaseUserId = sub.metadata?.supabase_user_id;
      const isActive = sub.status === "active" || sub.status === "trialing";

      if (supabaseUserId) {
        await supabase
          .from("users")
          .update({
            plan: isActive ? "pro" : "free",
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
          })
          .eq("id", supabaseUserId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const supabaseUserId = sub.metadata?.supabase_user_id;

      if (supabaseUserId) {
        await supabase
          .from("users")
          .update({
            plan: "free",
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("id", supabaseUserId);
      }
      break;
    }
  }

  return Response.json({ received: true });
}
