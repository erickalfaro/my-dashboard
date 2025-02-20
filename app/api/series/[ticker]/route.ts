// app/api/series/[ticker]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: { ticker: string } }
) {
  const { ticker } = context.params;

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
