// app/api/series/[ticker]/route.ts

import { NextResponse } from "next/server";

// 1. Create a type that describes the shape you want
type ContextParams = {
  params: {
    ticker: string;
  };
};

export async function GET(
  req: Request,
  ctx: unknown // Let Next pass you a context object
) {
  // 2. Cast from unknown to our context type
  const { params } = ctx as ContextParams; 
  const { ticker } = params;

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Generate 20 data points for each series (line and bar)
  const lineData = Array.from({ length: 20 }, () =>
    Number((Math.random() * 100 + 100).toFixed(2))
  );
  const barData = Array.from({ length: 20 }, () =>
    Number((Math.random() * 50 + 50).toFixed(2))
  );

  return NextResponse.json({ ticker, lineData, barData });
}
