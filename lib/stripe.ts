// lib/stripe.ts
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-02-24.acacia",
});

export const STRIPE_PRICE_ID = "price_1QzqieAu9QNLT1ImkhFHGp2c"; // Replace with your Stripe Price ID for $10/month