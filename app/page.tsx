"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { API_ENDPOINTS } from "../lib/config";
import { useAuth, useTickerData } from "../lib/hooks";
import { AuthButtons } from "../components/AuthButtons";
import { RefreshButton } from "../components/RefreshButton";
import { TickerTape } from "../components/TickerTape";
import { StockLedger } from "../components/StockLedger";
import { MarketCanvas } from "../components/MarketCanvas";
import { PostViewer } from "../components/PostViewer";
import { TickerTapeItem } from "../types";

export default function Home() {
  const { user, signOut } = useAuth();
  const {
    tickerTapeData,
    loading,
    fetchTickerTapeData,
    stockLedgerData,
    marketCanvasData,
    postsData,
    stockLedgerLoading,
    postsLoading,
    selectedStock,
    handleTickerClick,
    errorMessage,
  } = useTickerData(user);

  const [sortConfig, setSortConfig] = useState<{
    key: keyof TickerTapeItem | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const handleSort = (key: keyof TickerTapeItem): void => {
    const direction = sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    tickerTapeData.sort((a, b) => {
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
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen relative">
      {(loading || stockLedgerLoading || postsLoading) && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <p className="text-white text-lg">Loading...</p>
        </div>
      )}
      <div className="header-controls">
        <h1>Welcome, {user.email}</h1>
        <RefreshButton onClick={fetchTickerTapeData} />
        <button onClick={signOut} className="logout-btn">
          Logout
        </button>
      </div>
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
      <TickerTape
        data={tickerTapeData}
        loading={loading}
        onTickerClick={handleTickerClick}
        onSort={handleSort}
        sortConfig={sortConfig}
      />
      <MarketCanvas data={marketCanvasData} selectedStock={selectedStock} />
      <StockLedger data={stockLedgerData} loading={stockLedgerLoading} />
      <PostViewer data={postsData} loading={postsLoading} selectedStock={selectedStock} />
    </div>
  );
}