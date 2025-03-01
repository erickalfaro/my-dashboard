import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  // Determine the base URL dynamically
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

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