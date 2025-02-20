/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

type ContextParams = {
  params: {
    ticker: string;
  };
};

export async function GET(req: Request, ctx: unknown) {
  // Cast 'ctx' to the context type so we can extract params.
  const { params } = ctx as ContextParams;
  const { ticker } = params;

  // Return a simple static JSON object.
  return NextResponse.json({
    ticker,
    lineData: [101, 102, 103, 104, 105],
    barData: [10, 12, 15, 14, 18],
  });
}
