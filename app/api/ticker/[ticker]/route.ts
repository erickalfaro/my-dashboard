/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

type TickerContext = {
  params: {
    ticker: string;
  };
};

export async function GET(req: Request, ctx: unknown) {
  // Cast 'ctx' to the known type so we can safely extract params.
  const { params } = ctx as TickerContext;
  const { ticker } = params;

  // (Optional) Simulate a slight delay
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Return a static JSON response
  return NextResponse.json({
    message: `Mock response for ${ticker}: Detailed info about ${ticker}.`,
  });
}
