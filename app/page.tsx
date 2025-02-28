"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale, // Add TimeScale
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns"; // Import the date adapter
import { RefreshButton } from "../components/RefreshButton";
import { TickerTape } from "../components/TickerTape";
import { StockLedger } from "../components/StockLedger";
import { MarketCanvas } from "../components/MarketCanvas";
import { PostViewer } from "../components/PostViewer";

ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale, // Register TimeScale
  Title,
  Tooltip,
  Legend
);

interface TickerTapeItem {
  id: number;
  cashtag: string;
  prev_open: number | null;
  prev_eod: number | null;
  latest_price: number | null;
  chng: number | null;
  trend: number[];
}

interface StockLedgerData {
  stockName: string;
  description: string;
  marketCap: string;
}

interface MarketCanvasData {
  ticker: string;
  lineData: number[];
  barData: number[];
}

interface PostData {
  hours: number;
  text: string;
}

const STOCK_API_URL = "/api/mockdata";
const TICKER_API_URL = "/api/ticker";
const SERIES_API_URL = "/api/series";
const POSTS_API_URL = "/api/posts";

export default function Home() {
  const [tickerTapeData, setTickerTapeData] = useState<TickerTapeItem[]>([]);
  const [stockLedgerData, setStockLedgerData] = useState<StockLedgerData>({
    stockName: "N/A",
    description: "Select a ticker to view details",
    marketCap: "N/A",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [marketCanvasData, setMarketCanvasData] = useState<MarketCanvasData | null>(null);
  const [stockLedgerLoading, setStockLedgerLoading] = useState<boolean>(false);
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TickerTapeItem | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });

  const fetchTickerTapeData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<TickerTapeItem[]>(STOCK_API_URL);
      setTickerTapeData(response.data);
    } catch (error) {
      console.error("Error fetching TickerTape data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerTapeData();
  }, []);

  const handleTickerClick = async (ticker: string): Promise<void> => {
    setStockLedgerLoading(true);
    setPostsLoading(true);
    const cleanTicker = ticker.replace("$", "");
    setSelectedStock(cleanTicker);
    try {
      const ledgerPromise = axios.get<StockLedgerData>(`${TICKER_API_URL}/${cleanTicker}`);
      const canvasPromise = axios.get<MarketCanvasData>(`${SERIES_API_URL}/${cleanTicker}`);
      const postsPromise = axios.get<PostData[]>(`${POSTS_API_URL}/${cleanTicker}`);
      const [ledgerResponse, canvasResponse, postsResponse] = await Promise.all([
        ledgerPromise,
        canvasPromise,
        postsPromise,
      ]);

      setStockLedgerData(ledgerResponse.data);
      setMarketCanvasData(canvasResponse.data);
      setPostsData(postsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setStockLedgerData({ stockName: "Error", description: "Failed to fetch ticker info", marketCap: "N/A" });
      setMarketCanvasData(null);
      setPostsData([]);
    } finally {
      setStockLedgerLoading(false);
      setPostsLoading(false);
    }
  };

  const handleSort = (key: keyof TickerTapeItem): void => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });

    setTickerTapeData((prevData) => {
      const sortedData = [...prevData].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;
        if (typeof aValue === "string" && typeof bValue === "string") {
          return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      });
      return sortedData;
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <RefreshButton onClick={fetchTickerTapeData} />
      <TickerTape
        data={tickerTapeData}
        loading={loading}
        onTickerClick={handleTickerClick}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
      <StockLedger data={stockLedgerData} loading={stockLedgerLoading} />
      <MarketCanvas data={marketCanvasData} selectedStock={selectedStock} />
      <PostViewer data={postsData} loading={postsLoading} selectedStock={selectedStock} />
    </div>
  );
}