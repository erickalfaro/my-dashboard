import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const { data: _session, error } = await supabase.auth.exchangeCodeForSession(code); // Renamed to _session to indicate it's unused
      if (error) throw error;
      return NextResponse.redirect("http://localhost:3000/"); // Hardcoded for testing, we'll adjust for Vercel
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect("http://localhost:3000/");
    }
  }

  return NextResponse.redirect("http://localhost:3000/");
}