import { NextResponse } from "next/server";

export function handleApiError(error: unknown, message: string): NextResponse {
  console.error(message, error);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function withValidation(handler: (req: Request, ctx: any) => Promise<NextResponse>) {
  return async (req: Request, ctx: any) => {
    const { ticker } = await ctx.params;
    if (!ticker || typeof ticker !== "string") {
      return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
    }
    return handler(req, ctx);
  };
}