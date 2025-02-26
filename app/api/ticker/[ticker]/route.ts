// app/api/ticker/[ticker]/route.ts
import { NextResponse } from "next/server";

type TickerContext = {
  params: Promise<{ ticker: string }>;
};

export async function GET(req: Request, ctx: TickerContext) {
  const params = await ctx.params;
  const { ticker } = params;

  await new Promise((resolve) => setTimeout(resolve, 10));

  return NextResponse.json({
    message: `Mock response for ${ticker}: Detailed info about ${ticker}.`,
  });
}