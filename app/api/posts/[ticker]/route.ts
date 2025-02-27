// app/api/posts/[ticker]/route.ts
import { NextResponse } from "next/server";
import { supabase } from "../../../../lib/supabase";

interface PostData {
  hours: number;
  text: string;
}

interface SupabaseResponse {
  cashtag: string;
  json_result: PostData[];
}

type ContextParams = {
  params: Promise<{ ticker: string }>;
};

export async function GET(req: Request, ctx: ContextParams) {
  const params = await ctx.params;
  const { ticker } = params;

  try {
    const { data, error } = await supabase
      .from("query_bot_view_json")
      .select("*")
      .eq("cashtag", ticker); // Removed .single()

    if (error) {
      console.error("Error fetching posts from Supabase:", error);
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    // If no data is returned, send an empty array
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Assuming only one row per cashtag for simplicity; adjust if multiple rows are possible
    const posts: PostData[] = (data[0] as SupabaseResponse).json_result || [];
    return NextResponse.json(posts.sort((a, b) => a.hours - b.hours)); // Sort by hours ascending
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}