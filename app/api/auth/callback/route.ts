import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Use NEXT_PUBLIC_BASE_URL if set, otherwise construct from VERCEL_URL or fallback to localhost
  const vercelUrl = process.env.VERCEL_URL;
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return NextResponse.redirect(`${baseUrl}/`);
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${baseUrl}/`);
    }
  }

  return NextResponse.redirect(`${baseUrl}/`);
}