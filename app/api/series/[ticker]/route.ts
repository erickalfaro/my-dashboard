import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params, searchParams: _searchParams }: { params: { ticker: string }, searchParams: URLSearchParams }
) {
  // Mark the unused searchParams as used to silence ESLint:
  void _searchParams;

  const ticker = params.ticker;
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
