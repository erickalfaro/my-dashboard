import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Determine the base URL dynamically
  const isVercel = !!process.env.VERCEL_URL; // True if running on Vercel
  const baseUrl = isVercel
    ? `https://${process.env.VERCEL_URL}` // Use Vercel deployment URL
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Fallback to local

  console.log("Callback baseUrl:", baseUrl); // Debug

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Auth error:", error);
        throw error;
      }
      return NextResponse.redirect(`${baseUrl}/`);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${baseUrl}/?error=auth_failed`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/`);
}