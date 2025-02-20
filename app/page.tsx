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
}

// NOTE: For API integrations, consider moving the URL into an environment variable.
const API_URL = "/api/mockdata";

// Dummy additional data for each stock symbol.
// In the future, this can be replaced or merged with real API data.
const additionalData: Record<string, { open: number; high: number; low: number; volume: number }> = {
  AAPL: { open: 170, high: 175, low: 168, volume: 5000000 },
  TSLA: { open: 800, high: 830, low: 790, volume: 3000000 },
  NVDA: { open: 490, high: 515, low: 485, volume: 2500000 },
  GOOGL: { open: 140, high: 145, low: 138, volume: 4000000 },
  AMZN: { open: 125, high: 130, low: 123, volume: 3500000 },
};

// --------------------------
// Main Component
// --------------------------

export default function Home() {
  const [stockData, setStockData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortColumn, setSortColumn] = useState<keyof DataItem | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // --------------------------
  // API Data Fetching
  // --------------------------

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<DataItem[]>(API_URL);
      setStockData(response.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------
  // Event Handlers
  // --------------------------

  const handleSort = (column: keyof DataItem): void => {
    const isSameColumn = sortColumn === column;
    const newDirection: "asc" | "desc" = isSameColumn && sortDirection === "asc" ? "desc" : "asc";
    setSortColumn(column);
    setSortDirection(newDirection);

    setStockData((prevData) => {
      const sortedData = [...prevData].sort((a, b) => {
        if (a[column] > b[column]) return newDirection === "asc" ? 1 : -1;
        if (a[column] < b[column]) return newDirection === "asc" ? -1 : 1;
        return 0;
      });
      return sortedData;
    });
  };

  const handleStockSelect = (stockName: string): void => {
    console.log("Selected Stock:", stockName);
    setSelectedStock(stockName);
  };

  // Get the data item for the currently selected stock
  const currentStockData = stockData.find((item) => item.name === selectedStock);

  // --------------------------
  // Chart Configuration
  // --------------------------

  const chartData = {
    labels: currentStockData ? currentStockData.trend.map((_, index) => `Point ${index + 1}`) : [],
    datasets: [
      {
        label: `${selectedStock} Trend`,
        data: currentStockData ? currentStockData.trend : [],
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        fill: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: `${selectedStock} Trend Chart` },
    },
  };

  // --------------------------
  // Render
  // --------------------------

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Stock Data Table</h1>
      <button onClick={fetchData} className="p-2 bg-blue-500 text-white rounded mb-4">
        Refresh Data
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table className="border-collapse border border-gray-700 w-full text-center">
            <thead>
              <tr className="bg-gray-800">
                <th
                  className="border border-gray-700 p-1 cursor-pointer w-10"
                  onClick={() => handleSort("id")}
                >
                  ID
                </th>
                <th
                  className="border border-gray-700 p-1 cursor-pointer w-20"
                  onClick={() => handleSort("name")}
                >
                  Stock
                </th>
                <th
                  className="border border-gray-700 p-1 cursor-pointer w-20"
                  onClick={() => handleSort("value")}
                >
                  Price
                </th>
                <th className="border border-gray-700 p-1 w-20">Trend</th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-800">
                  <td className="border border-gray-700 p-1 w-10">{item.id}</td>
                  <td
                    className="border border-gray-700 p-1 cursor-pointer text-blue-400 hover:underline w-20"
                    onClick={() => handleStockSelect(item.name)}
                  >
                    {item.name}
                  </td>
                  <td className="border border-gray-700 p-1 w-20">
                    ${item.value.toFixed(2)}
                  </td>
                  <td className="border border-gray-700 p-0 w-20">
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
          <p className="mt-4 text-lg">
            Selected Stock: <span className="text-blue-400">{selectedStock}</span>
          </p>

          {/* Additional Data Table */}
          <h2 className="text-xl font-semibold mt-4">Additional Data for {selectedStock}</h2>
          {additionalData[selectedStock] ? (
            <table className="border-collapse border border-gray-700 w-full text-center mt-2">
              <thead>
                <tr className="bg-gray-800">
                  <th className="border border-gray-700 p-2">Open</th>
                  <th className="border border-gray-700 p-2">High</th>
                  <th className="border border-gray-700 p-2">Low</th>
                  <th className="border border-gray-700 p-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-800">
                  <td className="border border-gray-700 p-2">{additionalData[selectedStock].open}</td>
                  <td className="border border-gray-700 p-2">{additionalData[selectedStock].high}</td>
                  <td className="border border-gray-700 p-2">{additionalData[selectedStock].low}</td>
                  <td className="border border-gray-700 p-2">{additionalData[selectedStock].volume}</td>
                </tr>
              </tbody>
            </table>
          ) : (
            <p>No additional data available for {selectedStock}</p>
          )}

          {/* Trend Chart */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Trend Chart</h2>
            {currentStockData && currentStockData.trend.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <p>No trend data available for {selectedStock}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
