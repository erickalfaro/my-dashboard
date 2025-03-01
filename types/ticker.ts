// types/ticker.ts
export interface TickerTapeItem {
  id: number;
  cashtag: string;
  prev_open: number | null;
  prev_eod: number | null;
  latest_price: number | null;
  chng: number | null;
  trend: number[];
}

export interface StockLedgerData {
  stockName: string;
  description: string;
  marketCap: string;
}

export interface MarketCanvasData {
  ticker: string;
  lineData: number[];
  barData: number[];
}

export interface PostData {
  hours: number;
  text: string;
  tweet_id: number; // Added tweet_id
}