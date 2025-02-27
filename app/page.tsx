// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOptions, ChartData } from "chart.js";

ChartJS.register(
  LineController,
  BarController,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
    const cleanTicker = ticker.replace("$", ""); // Remove $ prefix for API consistency
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

  const getMarketCanvasConfig = (): { config: ChartData<"bar" | "line">; options: ChartOptions<"bar" | "line"> } | null => {
    if (!marketCanvasData) return null;

    const labels = Array.from({ length: marketCanvasData.lineData.length }, (_, i) => {
      const date = new Date();
      date.setHours(date.getHours() - (marketCanvasData.lineData.length - 1 - i));
      return date;
    });

    const config: ChartData<"bar" | "line"> = {
      labels,
      datasets: [
        {
          type: "line" as const,
          data: marketCanvasData.lineData,
          borderColor: "#00C805",
          backgroundColor: "rgba(0, 200, 5, 0.1)",
          fill: false,
          yAxisID: "yPrice",
          tension: 0.1,
          pointRadius: 0,
          borderWidth: 1,
        },
        {
          type: "bar" as const,
          data: marketCanvasData.barData,
          backgroundColor: "rgba(128, 128, 128, 0.5)",
          borderColor: "rgba(128, 128, 128, 1)",
          borderWidth: 1,
          yAxisID: "yVolume",
        },
      ],
    };

    const priceMin = Math.min(...marketCanvasData.lineData);
    const priceMax = Math.max(...marketCanvasData.lineData);
    const priceRange = priceMax - priceMin;
    const buffer = priceRange * 0.1;
    const yPriceMin = priceMin - buffer;
    const yPriceMax = priceMax + buffer;

    const options: ChartOptions<"bar" | "line"> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: `${selectedStock || "No Stock Selected"} - 7 Day Hourly Price & Volume`,
          color: "#c9d1d9",
        },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          callbacks: {
            title: () => "",
            label: (context) => (context.datasetIndex === 0 ? `$${context.parsed.y.toFixed(2)}` : ""),
          },
        },
      },
      scales: {
        x: {
          type: "category" as const,
          grid: { display: false },
          ticks: {
            callback: function (_value, index: number) {
              const date = labels[index] as Date;
              if (date && date.getHours() === 12) {
                return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${date.getFullYear()}`;
              }
              return "";
            },
            color: "#c9d1d9",
            maxTicksLimit: 7,
          },
        },
        yPrice: {
          type: "linear" as const,
          position: "left" as const,
          title: { display: true, text: "Price ($)", color: "#c9d1d9" },
          grid: { color: "#30363d" },
          ticks: { color: "#c9d1d9", callback: (value) => `$${Number(value).toFixed(2)}` },
          min: yPriceMin,
          max: yPriceMax,
        },
        yVolume: {
          type: "linear" as const,
          position: "right" as const,
          title: { display: true, text: "Volume", color: "#c9d1d9" },
          grid: { display: false },
          ticks: { color: "#c9d1d9", callback: (value) => `${(Number(value) / 1000).toFixed(0)}K` },
          max: Math.max(...marketCanvasData.barData) * 1.2 || 1000,
        },
      },
    };

    return { config, options };
  };

  const marketCanvas = getMarketCanvasConfig();

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

  const getChangeColor = (change: number | null) => {
    if (change === null || change === undefined) return "";
    return change < 0 ? "text-red-500" : "text-green-500";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <button onClick={fetchTickerTapeData} className="p-2 bg-blue-500 text-white rounded mb-4">
        Refresh Data
      </button>

      {loading ? (
        <p>Loading TickerTape data...</p>
      ) : (
        <div className="TickerTape">
          <table className="border-collapse border border-gray-700 w-full">
            <thead>
              <tr className="bg-gray-800 text-center">
                <th
                  className="border border-gray-700 p-1 text-center w-12 cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="border border-gray-700 p-1 text-center w-20 cursor-pointer"
                  onClick={() => handleSort("cashtag")}
                >
                  Stock {sortConfig.key === "cashtag" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="border border-gray-700 p-1 text-center w-32">Trend</th>
                <th
                  className="border border-gray-700 p-1 text-center w-20 cursor-pointer"
                  onClick={() => handleSort("chng")}
                >
                  Change {sortConfig.key === "chng" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="border border-gray-700 p-1 text-center w-24 cursor-pointer"
                  onClick={() => handleSort("latest_price")}
                >
                  Latest Price {sortConfig.key === "latest_price" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="border border-gray-700 p-1 text-center w-20 cursor-pointer"
                  onClick={() => handleSort("prev_eod")}
                >
                  Prev EOD {sortConfig.key === "prev_eod" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="border border-gray-700 p-1 text-center w-20 cursor-pointer"
                  onClick={() => handleSort("prev_open")}
                >
                  Prev Open {sortConfig.key === "prev_open" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                </th>
              </tr>
            </thead>
            <tbody>
              {tickerTapeData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 text-center">
                  <td className="border border-gray-700 p-1 text-center w-12">{item.id}</td>
                  <td
                    className="border border-gray-700 p-1 cursor-pointer text-blue-400 hover:underline text-center w-20"
                    onClick={() => handleTickerClick(item.cashtag)}
                  >
                    {item.cashtag}
                  </td>
                  <td className="border border-gray-700 p-0 text-center w-32">
                    <div className="w-full h-full">
                      <Sparklines data={item.trend}>
                        <SparklinesLine color="white" style={{ strokeWidth: 1 }} />
                      </Sparklines>
                    </div>
                  </td>
                  <td className={`border border-gray-700 p-1 text-center w-20 ${getChangeColor(item.chng)}`}>
                    {item.chng !== null && item.chng !== undefined ? item.chng : "-"}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-24">
                    {item.latest_price !== null && item.latest_price !== undefined
                      ? `$${item.latest_price.toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-20">
                    {item.prev_eod !== null && item.prev_eod !== undefined ? item.prev_eod : "-"}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-20">
                    {item.prev_open !== null && item.prev_open !== undefined ? item.prev_open : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* StockLedger Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">StockLedger{stockLedgerLoading ? " (Loading...)" : ""}</h2>
        <div className="StockLedger">
          <table>
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>Stock Name</th>
                <th className="border border-gray-700 p-2 text-center" style={{ width: "50%" }}>Description</th>
                <th className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>Market Cap</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-800">
                <td className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>
                  {stockLedgerData.stockName}
                </td>
                <td className="border border-gray-700 p-2 text-center" style={{ width: "50%" }}>
                  {stockLedgerData.description}
                </td>
                <td className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>
                  {stockLedgerData.marketCap}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MarketCanvas Section */}
      {marketCanvas && (
        <div className="mt-6 MarketCanvas" style={{ height: "300px" }}>
          <Chart type="bar" data={marketCanvas.config} options={marketCanvas.options} />
        </div>
      )}

      {/* PostViewer Section */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">PostViewer{postsLoading ? " (Loading...)" : ""}</h2>
        {postsLoading ? (
          <p>Loading posts...</p>
        ) : postsData.length > 0 ? (
          <div className="PostViewer">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-1 text-center">Hours Ago</th>
                  <th className="border border-gray-700 p-1 text-center">Post</th>
                </tr>
              </thead>
              <tbody>
                {postsData.map((post, index) => (
                  <tr key={index} className="hover:bg-gray-800">
                    <td className="border border-gray-700 p-1 text-center">{post.hours.toFixed(1)}</td>
                    <td className="border border-gray-700 p-1 text-left">{post.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No posts available for {selectedStock || "selected stock"}.</p>
        )}
      </div>
    </div>
  );
}