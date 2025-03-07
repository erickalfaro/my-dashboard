// components/SubscriptionButton.tsx
"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "../lib/supabase";
import { STRIPE_PRICE_ID } from "../lib/stripe";
import { User } from "@supabase/supabase-js"; // Add this import

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export const SubscriptionButton: React.FC<{ user: User }> = ({ user }) => {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const accessToken = session.session?.access_token;

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error("Stripe failed to load");

      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error initiating subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-500"
    >
      {loading ? "Loading..." : "Upgrade to PREMIUM ($10/month)"}
    </button>
  );
};