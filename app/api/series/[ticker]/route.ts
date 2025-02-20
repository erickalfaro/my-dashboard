import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { ticker: string | string[] } }
) {
  // Ensure ticker is a string
  const ticker = Array.isArray(params.ticker) ? params.ticker[0] : params.ticker;
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
