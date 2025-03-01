import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      return NextResponse.redirect(new URL("/", request.url));
    } catch (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.redirect(new URL("/", request.url));
}