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

import { ChartOptions } from "chart.js";

// Register Chart.js modules for mixed chart types
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

// --------------------------
// Type Definitions & Endpoint Constants
// --------------------------

interface DataItem {
  id: number;
  cashtag: string;
  prev_open: number | null;
  prev_eod: number | null;
  latest_price: number | null;
  chng: number | null;
  trend: number[];
}

interface AdditionalData {
  marketCap: string;
  companyDescription: string;
  daysTillEarnings: number;
}

interface TickerChartData {
  ticker: string;
  lineData: number[];
  barData: number[];
}

const STOCK_API_URL = "/api/mockdata";
const ADDITIONAL_DATA_API_URL = "/api/additionalData";
const TICKER_API_URL = "/api/ticker";
const SERIES_API_URL = "/api/series";

// --------------------------
// Main Component
// --------------------------

export default function Home() {
  const [stockData, setStockData] = useState<DataItem[]>([]);
  const [additionalData, setAdditionalData] = useState<Record<string, AdditionalData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tickerResponse, setTickerResponse] = useState<string>("");
  const [seriesChartData, setSeriesChartData] = useState<TickerChartData | null>(null);
  const [tickerLoading, setTickerLoading] = useState<boolean>(false);

  // --------------------------
  // API Data Fetching
  // --------------------------

  const fetchStockData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<DataItem[]>(STOCK_API_URL);
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdditionalData = async (): Promise<void> => {
    try {
      const response = await axios.get<Record<string, AdditionalData>>(ADDITIONAL_DATA_API_URL);
      setAdditionalData(response.data);
    } catch (error) {
      console.error("Error fetching additional data:", error);
    }
  };

  useEffect(() => {
    fetchStockData();
    fetchAdditionalData();
  }, []);

  // --------------------------
  // Event Handler for Ticker Click
  // --------------------------

  const handleTickerClick = async (ticker: string): Promise<void> => {
    setTickerLoading(true);
    setTickerResponse("");
    setSelectedStock(ticker);
    try {
      const detailedPromise = axios.get<{ message: string }>(`${TICKER_API_URL}/${ticker}`);
      const seriesPromise = axios.get<TickerChartData>(`${SERIES_API_URL}/${ticker}`);
      const [detailedResponse, seriesResponse] = await Promise.all([detailedPromise, seriesPromise]);

      setTickerResponse(detailedResponse.data.message);
      setSeriesChartData(seriesResponse.data);
    } catch (error) {
      console.error("Error fetching ticker data:", error);
      setTickerResponse("Error fetching ticker info.");
      setSeriesChartData(null);
    } finally {
      setTickerLoading(false);
    }
  };

  // --------------------------
  // Chart Data & Options
  // --------------------------

  // In app/page.tsx, within the Home component
  const seriesChartConfig = seriesChartData
    ? {
        labels: Array.from({ length: seriesChartData.lineData.length }, (_, i) => {
          const date = new Date();
          date.setHours(date.getHours() - (seriesChartData.lineData.length - 1 - i));
          return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }),
        datasets: [
          {
            type: "line" as const,
            label: `${seriesChartData.ticker} Hourly Price`,
            data: seriesChartData.lineData,
            borderColor: "rgba(75,192,192,1)",
            backgroundColor: "rgba(75,192,192,0.2)",
            fill: false,
            yAxisID: "yLine",
          },
          {
            type: "bar" as const,
            label: `${seriesChartData.ticker} Hourly Volume`,
            data: seriesChartData.barData,
            borderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,0.2)",
            yAxisID: "yBar",
          },
        ],
      }
    : null;

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${selectedStock} Series Chart` },
    },
    scales: {
      x: { type: "category" as const },
      yLine: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "Line Series" },
      },
      yBar: {
        type: "linear" as const,
        position: "right" as const,
        title: { display: true, text: "Bar Series" },
        grid: { drawOnChartArea: false },
      },
    },
  };

  // --------------------------
  // Sort Handler
  // --------------------------

  // Define a type for sortable columns
  type SortableColumn = 'id' | 'cashtag' | 'prev_open' | 'prev_eod' | 'latest_price' | 'chng';

  const handleSort = (column: SortableColumn): void => {
    const newDirection: "asc" | "desc" = "asc";
    setStockData((prevData) => {
      const sortedData = [...prevData].sort((a, b) => {
        const aValue = a[column];
        const bValue = b[column];

        // Handle null values: nulls go to the end
        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        // Compare values (safe now that nulls are handled)
        if (aValue > bValue) return newDirection === "asc" ? 1 : -1;
        if (aValue < bValue) return newDirection === "asc" ? -1 : 1;
        return 0;
      });
      return sortedData;
    });
  };

  // --------------------------
  // Render
  // --------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <button
        onClick={() => {
          fetchStockData();
          fetchAdditionalData();
        }}
        className="p-2 bg-blue-500 text-white rounded mb-4"
      >
        Refresh Data
      </button>

      {loading ? (
        <p>Loading stock data...</p>
      ) : (
        <div className="table-container">
          <table className="border-collapse border border-gray-700 w-full">
            <thead>
              <tr className="bg-gray-800 text-center"><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("id")}>ID</th><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("cashtag")}>Stock</th><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("latest_price")}>Latest Price</th><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("prev_open")}>Prev Open</th><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("prev_eod")}>Prev EOD</th><th className="border border-gray-700 p-1 text-center w-3" onClick={() => handleSort("chng")}>Change</th><th className="border border-gray-700 p-0 text-center w-32">Trend</th></tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 text-center">
                  <td className="border border-gray-700 p-1 text-center w-3">{item.id}</td>
                  <td
                    className="border border-gray-700 p-1 cursor-pointer text-blue-400 hover:underline text-center w-3"
                    onClick={() => handleTickerClick(item.cashtag)}
                  >
                    {item.cashtag}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-3">
                    {item.latest_price !== null && item.latest_price !== undefined ? `$${item.latest_price.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-3">
                    {item.prev_open !== null && item.prev_open !== undefined ? item.prev_open : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-3">
                    {item.prev_eod !== null && item.prev_eod !== undefined ? item.prev_eod : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-3">
                    {item.chng !== null && item.chng !== undefined ? item.chng : '-'}
                  </td>
                  <td className="border border-gray-700 p-0 text-center w-32">
                    <div className="w-full h-full">
                      <Sparklines data={item.trend}>
                        <SparklinesLine color="white" />
                      </Sparklines>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStock && (
        <div className="mt-6">
          {tickerLoading ? (
            <p>Loading ticker data...</p>
          ) : (
            <p className="mt-4 text-lg">
              {tickerResponse || "Click on a ticker symbol to see detailed info."}
            </p>
          )}

          <h2 className="text-xl font-semibold mt-4">Additional Data for {selectedStock}</h2>
          {additionalData && additionalData[selectedStock] ? (
            <table className="border-collapse border border-gray-700 w-full text-center mt-2">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2 text-center">Market Cap</th>
                  <th className="border border-gray-700 p-2 text-center">Description</th>
                  <th className="border border-gray-700 p-2 text-center">Days Till Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-800">
                  <td className="border border-gray-700 p-2 text-center">
                    {additionalData[selectedStock].marketCap}
                  </td>
                  <td className="border border-gray-700 p-2 text-center">
                    {additionalData[selectedStock].companyDescription}
                  </td>
                  <td className="border border-gray-700 p-2 text-center">
                    {additionalData[selectedStock].daysTillEarnings}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No additional data available for {selectedStock}</p>
          )}

          {seriesChartData && seriesChartConfig && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Series Chart</h2>
              <Chart type="bar" data={seriesChartConfig} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}