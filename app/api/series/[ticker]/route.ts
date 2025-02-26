// app/api/series/[ticker]/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

// Define the structure of an Alpaca bar
interface AlpacaBar {
  t: string; // Timestamp
  o: number; // Open price
  h: number; // High price
  l: number; // Low price
  c: number; // Close price
  v: number; // Volume
  n: number; // Number of trades
  vw: number; // Volume-weighted average price
}

type ContextParams = {
  params: Promise<{ ticker: string }>;
};

export async function GET(req: Request, ctx: ContextParams) {
  const params = await ctx.params;
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
    const response = await axios.get<{
      bars: AlpacaBar[];
      symbol: string;
      next_page_token: string | null;
    }>(url, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_KEY_ID,
        "APCA-API-SECRET-KEY": ALPACA_SECRET_KEY,
      },
      params: {
        timeframe: "1Hour",
        limit: 24,
        adjustment: "raw",
        start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    });

    const bars = response.data.bars || [];
    console.log(`Alpaca response for ${ticker}:`, response.data);

    const lineData = bars.map((bar: AlpacaBar) => bar.c); // Typed as AlpacaBar
    const barData = bars.map((bar: AlpacaBar) => bar.v);  // Typed as AlpacaBar

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