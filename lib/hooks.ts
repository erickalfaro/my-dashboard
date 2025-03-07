"use client";
import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation"; // Added for redirection
import { supabase } from "./supabase";
import { debounce } from "./utils";
import {
  fetchTickerTapeData as apiFetchTickerTapeData,
  fetchStockLedgerData,
  fetchMarketCanvasData,
  fetchPostsData,
} from "./api";
import { TickerTapeItem, StockLedgerData, MarketCanvasData, PostData } from "../types/api"; // Updated

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter(); // Added for navigation

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        router.push("/"); // Redirect to login page on sign-out
        router.refresh(); // Force refresh to clear state
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]); // Router added to dependencies

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null); // Clear user state
      router.push("/"); // Redirect to login page
      router.refresh(); // Ensure fresh state on redirect
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return { user, signOut };
}

export function useTickerData(user: User | null) {
  const [tickerTapeData, setTickerTapeData] = useState<TickerTapeItem[]>([]);
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
  const [stockLedgerLoading, setStockLedgerLoading] = useState<boolean>(false);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTickerTapeData = async (): Promise<void> => {
    setLoading(true);
    try {
      const data = await apiFetchTickerTapeData();
      setTickerTapeData(data);
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

  const handleTickerClick = useCallback(
    (ticker: string) => {
      const debouncedHandleTickerClick = debounce(async (ticker: string): Promise<void> => {
        setStockLedgerLoading(true);
        setPostsLoading(true);
        setErrorMessage(null);
        const cleanTicker = ticker.replace("$", "");
        setSelectedStock(cleanTicker);
        setPostsData([]);
        setMarketCanvasData({ ticker: cleanTicker, lineData: [], barData: [] });
        setStockLedgerData({ stockName: cleanTicker, description: "", marketCap: "" });
        try {
          const [ledgerResponse, canvasResponse, postsResponse] = await Promise.all([
            fetchStockLedgerData(cleanTicker),
            fetchMarketCanvasData(cleanTicker),
            fetchPostsData(cleanTicker),
          ]);

          setStockLedgerData(ledgerResponse);
          if (canvasResponse.lineData.length === 0 || canvasResponse.barData.length === 0) {
            setMarketCanvasData({ ticker: cleanTicker, lineData: [], barData: [] });
            setErrorMessage(`No price/volume data available for ${cleanTicker}.`);
          } else {
            setMarketCanvasData(canvasResponse);
          }
          setPostsData(postsResponse);
        } catch (error) {
          console.error("Error fetching data:", error);
          setStockLedgerData({
            stockName: cleanTicker,
            description: "Failed to fetch ticker info",
            marketCap: "N/A",
          });
          setMarketCanvasData({ ticker: cleanTicker, lineData: [], barData: [] });
          setPostsData([]);
          setErrorMessage(`Unable to load data for ${cleanTicker}. Please try another ticker.`);
        } finally {
          setStockLedgerLoading(false);
          setPostsLoading(false);
        }
      }, 300);
      debouncedHandleTickerClick(ticker);
    },
    [] // No external dependencies needed here since everything is defined within
  );

  return {
    tickerTapeData,
    stockLedgerData,
    marketCanvasData,
    postsData,
    loading,
    stockLedgerLoading,
    postsLoading,
    selectedStock,
    fetchTickerTapeData,
    handleTickerClick,
    errorMessage,
  };
}