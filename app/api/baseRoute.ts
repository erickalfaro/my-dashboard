import { NextResponse } from "next/server";

export function handleApiError(error: unknown, message: string): NextResponse {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}

// Define the context type
interface ApiContext {
  params: Promise<{ ticker?: string }>; // Adjust based on your route structure
}

export function withValidation(
  handler: (req: Request, ctx: ApiContext) => Promise<NextResponse>
) {
  return async (req: Request, ctx: ApiContext) => {
    const params = await ctx.params; // Resolve the Promise
    const { ticker } = params;
    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
    }
    return handler(req, ctx);
  };
}