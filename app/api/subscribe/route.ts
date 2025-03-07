// app/api/subscribe/route.ts
import { NextResponse } from "next/server";
import { stripe } from "../../../lib/stripe";
import { supabase } from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: session } = await supabase.auth.getSession();
    if (!session.session || session.session.user.id !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user already has a Stripe customer ID
    let { data: userSub } = await supabase
      .from("user_subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    let customerId = userSub?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.session.user.email,
        metadata: { supabaseUserId: userId },
      });
      customerId = customer.id;

      await supabase
        .from("user_subscriptions")
        .upsert({ user_id: userId, stripe_customer_id: customerId });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?canceled=true`,
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}