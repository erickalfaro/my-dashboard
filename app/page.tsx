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
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { AuthButtons } from "../components/AuthButtons";
import { RefreshButton } from "../components/RefreshButton";
import { TickerTape } from "../components/TickerTape";
import { StockLedger } from "../components/StockLedger";
import { MarketCanvas } from "../components/MarketCanvas";
import { PostViewer } from "../components/PostViewer";

// Register ChartJS components
ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  TimeScale,
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
  const [user, setUser] = useState<User | null>(null);
  const [tickerTapeData, setTickerTapeData] = useState<TickerTapeItem[]>([]); // Empty array as initial state
  const [stockLedgerData, setStockLedgerData] = useState<StockLedgerData>({
    stockName: "",
    description: "",
    marketCap: "",
  });
  const [marketCanvasData, setMarketCanvasData] = useState<MarketCanvasData>({
    ticker: "",
    lineData: [],
    barData: [],
  });
  const [postsData, setPostsData] = useState<PostData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockLedgerLoading, setStockLedgerLoading] = useState<boolean>(false);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof TickerTapeItem | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchTickerTapeData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<TickerTapeItem[]>(STOCK_API_URL);
      setTickerTapeData(response.data);
    } catch (error) {
      console.error("Error fetching TickerTape data:", error);
      setErrorMessage("Failed to load ticker tape data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTickerTapeData();
  }, [user]);

  const handleTickerClick = async (ticker: string): Promise<void> => {
    setStockLedgerLoading(true);
    setPostsLoading(true);
    setErrorMessage(null);
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
      if (canvasResponse.data.lineData.length === 0 || canvasResponse.data.barData.length === 0) {
        setMarketCanvasData({ ticker: cleanTicker, lineData: [], barData: [] });
        setErrorMessage(`No price/volume data available for ${cleanTicker}.`);
      } else {
        setMarketCanvasData(canvasResponse.data);
      }
      setPostsData(postsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setStockLedgerData({ stockName: cleanTicker, description: "Failed to fetch ticker info", marketCap: "N/A" });
      setMarketCanvasData({ ticker: cleanTicker, lineData: [], barData: [] });
      setPostsData([]);
      setErrorMessage(`Unable to load data for ${cleanTicker}. Please try another ticker.`);
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <AuthButtons />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Welcome, {user.email}</h1>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>
      <RefreshButton onClick={fetchTickerTapeData} />
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
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