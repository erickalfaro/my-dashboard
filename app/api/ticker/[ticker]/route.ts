import { NextResponse } from "next/server";
import axios from "axios";

type TickerContext = {
  params: Promise<{ ticker: string }>;
};

export async function GET(req: Request, ctx: TickerContext) {
  const params = await ctx.params;
  const { ticker } = params;

  const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

  if (!POLYGON_API_KEY) {
    return NextResponse.json(
      { error: "Polygon API key is missing" },
      { status: 500 }
    );
  }

  try {
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker}`;
    const response = await axios.get(url, {
      params: {
        apiKey: POLYGON_API_KEY,
      },
    });

    const data = response.data.results;

    // Format market cap
    const formatMarketCap = (marketCap: number) => {
      if (marketCap >= 1e11) return `${(marketCap / 1e9).toFixed(0)}B`;
      if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`;
      return `${(marketCap / 1e6).toFixed(0)}M`;
    };

    const tickerData = {
      stockName: data.name || "Unknown",
      description: data.description || "No description available",
      marketCap: data.market_cap ? formatMarketCap(data.market_cap) : "N/A",
    };

    return NextResponse.json(tickerData);
  } catch (error) {
    console.error("Error fetching Polygon.io data:", error);
    // Handle 404 or other errors gracefully
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return NextResponse.json(
        {
          stockName: ticker,
          description: "Ticker not found in Polygon.io database",
          marketCap: "N/A",
        },
        { status: 200 } // Return 200 with fallback data
      );
    }
    return NextResponse.json(
      { error: `Failed to fetch data for ${ticker}` },
      { status: 500 }
    );
  }
}