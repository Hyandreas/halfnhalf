import { auth } from "@clerk/nextjs/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const { data: user } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("clerk_id", userId)
    .single();

  if (!user?.stripe_customer_id) {
    return Response.json({ error: "No billing account found" }, { status: 404 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
  });

  return Response.json({ url: session.url });
}
