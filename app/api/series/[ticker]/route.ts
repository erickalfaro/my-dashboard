import { NextResponse } from "next/server";

export async function GET(_req: Request, context: any) {
  const ticker = context.params?.ticker ?? "UNKNOWN";

  // Simulate processing
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Generate some fake data
  const lineData = Array.from({ length: 20 }, () =>
    Number((Math.random() * 100 + 100).toFixed(2))
  );
  const barData = Array.from({ length: 20 }, () =>
    Number((Math.random() * 50 + 50).toFixed(2))
  );

  return NextResponse.json({ ticker, lineData, barData });
}
