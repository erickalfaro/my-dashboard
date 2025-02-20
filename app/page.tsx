"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { ChartOptions } from "chart.js";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// --------------------------
// Type Definitions & Constants
// --------------------------

interface DataItem {
  id: number;
  name: string;
  value: number;
  trend: number[];
  open: number;
  high: number;
}

interface AdditionalData {
  marketCap: string;
  companyDescription: string;
  daysTillEarnings: number;
}

// External API endpoints
const STOCK_API_URL = "/api/mockdata";
const ADDITIONAL_DATA_API_URL = "/api/additionalData";

// Define x-axis labels (15 items to match the trend array length)
const xAxisLabels = [
  "Label 1", "Label 2", "Label 3", "Label 4", "Label 5",
  "Label 6", "Label 7", "Label 8", "Label 9", "Label 10",
  "Label 11", "Label 12", "Label 13", "Label 14", "Label 15"
];

// --------------------------
// Main Component
// --------------------------

export default function Home() {
  const [stockData, setStockData] = useState<DataItem[]>([]);
  const [additionalData, setAdditionalData] = useState<Record<string, AdditionalData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // State for ticker API response and selection
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tickerResponse, setTickerResponse] = useState<string>("");
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
  // Event Handlers
  // --------------------------

  // Handler for ticker clicks
  const handleTickerClick = async (ticker: string): Promise<void> => {
    setTickerLoading(true);
    setTickerResponse(""); // clear previous message
    setSelectedStock(ticker);
    try {
      const response = await axios.get<{ message: string }>(`/api/ticker/${ticker}`);
      setTickerResponse(response.data.message);
    } catch (error) {
      console.error("Error fetching ticker info:", error);
      setTickerResponse("Error fetching ticker info.");
    } finally {
      setTickerLoading(false);
    }
  };

  // (Optional) Example sort handler for the stock table
  const handleSort = (column: keyof DataItem): void => {
    const newDirection: "asc" | "desc" = "asc"; // Simplified for brevity
    setStockData((prevData) => {
      const sortedData = [...prevData].sort((a, b) => {
        if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1;
        if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1;
        return 0;
      });
      return sortedData;
    });
  };

  // --------------------------
  // Chart Data & Options with Dual y-Axes
  // --------------------------

  const currentStockData = stockData.find((item) => item.name === selectedStock);
  const safeSelectedStock = selectedStock ?? "";

  const chartData = {
    labels: currentStockData ? xAxisLabels.slice(0, currentStockData.trend.length) : [],
    datasets: [
      {
        label: `${safeSelectedStock} Trend`,
        data: currentStockData ? currentStockData.trend : [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: false,
        yAxisID: "yTrend",
      },
      {
        label: `${safeSelectedStock} Open Price`,
        data: currentStockData ? Array(currentStockData.trend.length).fill(currentStockData.open) : [],
        borderColor: "rgba(255,99,132,1)",
        backgroundColor: "rgba(255,99,132,0.2)",
        fill: false,
        yAxisID: "yOpen",
      },
    ],
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: `${selectedStock} Trend Chart` },
    },
    scales: {
      x: { type: "category" as const },
      yTrend: {
        type: "linear" as const,
        position: "left" as const,
        title: { display: true, text: "Trend" },
      },
      yOpen: {
        type: "linear" as const,
        position: "right" as const,
        title: { display: true, text: "Open Price" },
        grid: { drawOnChartArea: false },
      },
    },
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
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table className="border-collapse border border-gray-700 w-full">
            <thead>
              <tr className="bg-gray-800 text-center">
                <th className="border border-gray-700 p-1 text-center w-5" onClick={() => handleSort("id")}>
                  ID
                </th>
                <th className="border border-gray-700 p-1 text-center w-5" onClick={() => handleSort("name")}>
                  Stock
                </th>
                <th className="border border-gray-700 p-1 text-center w-5" onClick={() => handleSort("value")}>
                  Price
                </th>
                <th className="border border-gray-700 p-1 text-center w-5">Open</th>
                <th className="border border-gray-700 p-1 text-center w-5">High</th>
                <th className="border border-gray-700 p-0 text-center w-20">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800 text-center">
                  <td className="border border-gray-700 p-1 text-center w-5">{item.id}</td>
                  <td
                    className="border border-gray-700 p-1 cursor-pointer text-blue-400 hover:underline text-center w-5"
                    onClick={() => handleTickerClick(item.name)}
                  >
                    {item.name}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-5">
                    ${item.value.toFixed(2)}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-5">
                    {item.open !== undefined ? item.open : "-"}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-5">
                    {item.high !== undefined ? item.high : "-"}
                  </td>
                  <td className="border border-gray-700 p-0 text-center w-20">
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
          {/* New Summary (Ticker API Response) */}
          {tickerLoading ? (
            <p>Loading ticker data...</p>
          ) : (
            <p className="mt-4 text-lg">{tickerResponse || "Click on a ticker symbol to see detailed info."}</p>
          )}

          {/* Additional Data Table */}
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
                  <td className="border border-gray-700 p-2 text-center">{additionalData[selectedStock].marketCap}</td>
                  <td className="border border-gray-700 p-2 text-center">{additionalData[selectedStock].companyDescription}</td>
                  <td className="border border-gray-700 p-2 text-center">{additionalData[selectedStock].daysTillEarnings}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No additional data available for {selectedStock}</p>
          )}

          {/* Trend Chart */}
          {currentStockData && currentStockData.trend.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Trend Chart</h2>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
