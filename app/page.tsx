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

export default function Home() {
  const [stockData, setStockData] = useState<DataItem[]>([]);
  const [additionalData, setAdditionalData] = useState<Record<string, AdditionalData> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [tickerResponse, setTickerResponse] = useState<string>("");
  const [seriesChartData, setSeriesChartData] = useState<TickerChartData | null>(null);
  const [tickerLoading, setTickerLoading] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof DataItem | null; direction: 'asc' | 'desc' }>({
    key: null,
    direction: 'asc',
  });

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

  const seriesChartConfig = seriesChartData
    ? {
        labels: Array.from({ length: seriesChartData.lineData.length }, (_, i) => {
          const date = new Date();
          date.setHours(date.getHours() - (seriesChartData.lineData.length - 1 - i));
          return date;
        }),
        datasets: [
          {
            type: "line" as const,
            data: seriesChartData.lineData,
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
            data: seriesChartData.barData,
            backgroundColor: "rgba(128, 128, 128, 0.5)",
            borderColor: "rgba(128, 128, 128, 1)",
            borderWidth: 1,
            yAxisID: "yVolume",
          },
        ],
      }
    : null;

  const priceMin = seriesChartData ? Math.min(...seriesChartData.lineData) : 0;
  const priceMax = seriesChartData ? Math.max(...seriesChartData.lineData) : 100;
  const priceRange = priceMax - priceMin;
  const buffer = priceRange * 0.1;
  const yPriceMin = priceMin - buffer;
  const yPriceMax = priceMax + buffer;

  const chartOptions: ChartOptions<"bar" | "line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${selectedStock} - 7 Day Hourly Price & Volume`,
        color: "#c9d1d9",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          title: () => '',
          label: (context) => {
            if (context.datasetIndex === 0) {
              return `$${context.parsed.y.toFixed(2)}`;
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        type: "category" as const,
        grid: { display: false },
        ticks: {
          callback: function (_value, index: number) { // Changed value to _value and typed as unused
            const date = seriesChartConfig?.labels[index] as Date;
            if (date.getHours() === 12) {
              return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
            }
            return '';
          },
          color: "#c9d1d9",
          maxTicksLimit: 7,
        },
      },
      yPrice: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "Price ($)",
          color: "#c9d1d9",
        },
        grid: {
          color: "#30363d",
        },
        ticks: {
          color: "#c9d1d9",
          callback: (value) => `$${Number(value).toFixed(2)}`,
        },
        min: yPriceMin,
        max: yPriceMax,
      },
      yVolume: {
        type: "linear" as const,
        position: "right" as const,
        title: {
          display: true,
          text: "Volume",
          color: "#c9d1d9",
        },
        grid: { display: false },
        ticks: {
          color: "#c9d1d9",
          callback: (value) => `${(Number(value) / 1000).toFixed(0)}K`,
        },
        max: Math.max(...(seriesChartData?.barData || [])) * 1.2,
      },
    },
  };

  const handleSort = (key: keyof DataItem): void => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    setStockData((prevData) => {
      const sortedData = [...prevData].sort((a, b) => {
        const aValue = a[key];
        const bValue = b[key];

        if (aValue === null && bValue === null) return 0;
        if (aValue === null) return 1;
        if (bValue === null) return -1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return direction === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
      });
      return sortedData;
    });
  };

  const getChangeColor = (change: number | null) => {
    if (change === null || change === undefined) return '';
    return change < 0 ? 'text-red-500' : 'text-green-500';
  };

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
              <tr className="bg-gray-800 text-center">
                <th className="border border-gray-700 p-1 text-center w-12 cursor-pointer" onClick={() => handleSort("id")}>
                  ID {sortConfig.key === "id" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="border border-gray-700 p-1 text-center w-20 cursor-pointer" onClick={() => handleSort("cashtag")}>
                  Stock {sortConfig.key === "cashtag" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="border border-gray-700 p-1 text-center w-32">Trend</th>
                <th className="border border-gray-700 p-1 text-center w-20 cursor-pointer" onClick={() => handleSort("chng")}>
                  Change {sortConfig.key === "chng" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="border border-gray-700 p-1 text-center w-24 cursor-pointer" onClick={() => handleSort("latest_price")}>
                  Latest Price {sortConfig.key === "latest_price" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="border border-gray-700 p-1 text-center w-20 cursor-pointer" onClick={() => handleSort("prev_eod")}>
                  Prev EOD {sortConfig.key === "prev_eod" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="border border-gray-700 p-1 text-center w-20 cursor-pointer" onClick={() => handleSort("prev_open")}>
                  Prev Open {sortConfig.key === "prev_open" ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {stockData.map((item) => (
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
                    {item.chng !== null && item.chng !== undefined ? item.chng : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-24">
                    {item.latest_price !== null && item.latest_price !== undefined ? `$${item.latest_price.toFixed(2)}` : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-20">
                    {item.prev_eod !== null && item.prev_eod !== undefined ? item.prev_eod : '-'}
                  </td>
                  <td className="border border-gray-700 p-1 text-center w-20">
                    {item.prev_open !== null && item.prev_open !== undefined ? item.prev_open : '-'}
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
            <p className="mt-4 text-base">
              {tickerResponse || "Click on a ticker symbol to see detailed info."}
            </p>
          )}

          <h2 className="text-lg font-semibold mt-4">Additional Data for {selectedStock}</h2>
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

          {seriesChartData && seriesChartConfig && (
            <div className="mt-6 chart-container" style={{ height: "400px" }}>
              <Chart type="bar" data={seriesChartConfig} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}