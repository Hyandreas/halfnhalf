import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-03-25.dahlia",
    });
  }
  return _stripe;
}

// Convenience re-export for callers that use `stripe` directly
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export async function getOrCreateStripeCustomer(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  email: string
): Promise<string> {
  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (user?.stripe_customer_id) return user.stripe_customer_id;

  const customer = await getStripe().customers.create({
    email,
    metadata: { supabase_user_id: userId },
  });

  await supabase
    .from("users")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
