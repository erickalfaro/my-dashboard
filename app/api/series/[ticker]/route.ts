// app/api/series/[ticker]/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

type ContextParams = {
  params: Promise<{ ticker: string }>; // params is a Promise
};

export async function GET(req: Request, ctx: ContextParams) {
  const params = await ctx.params; // Await the params
  const { ticker } = params;

  console.log(`Fetching Alpaca data for ticker: ${ticker}`);

  const ALPACA_KEY_ID = process.env.ALPACA_KEY_ID;
  const ALPACA_SECRET_KEY = process.env.ALPACA_SECRET_KEY;

  if (!ALPACA_KEY_ID || !ALPACA_SECRET_KEY) {
    return NextResponse.json(
      { error: "Alpaca API credentials are missing" },
      { status: 500 }
    );
  }

  try {
    const url = `https://data.alpaca.markets/v2/stocks/${ticker}/bars`;
    const response = await axios.get(url, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_KEY_ID,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
      },
      params: {
        timeframe: "1Hour",
        limit: 24,
        adjustment: "raw",
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        end: new Date().toISOString(), // Now
      },
    });

    const bars = response.data.bars || [];
    console.log(`Alpaca response for ${ticker}:`, response.data);

    const lineData = bars.map((bar: any) => bar.c);
    const barData = bars.map((bar: any) => bar.v);

    console.log(`Processed data for ${ticker}:`, { ticker, lineData, barData });

    return NextResponse.json({
      ticker,
      lineData,
      barData,
    });
  } catch (error) {
    console.error("Error fetching Alpaca data:", error);
    return NextResponse.json(
      { error: "Failed to fetch hourly data from Alpaca" },
      { status: 500 }
    );
  }
}