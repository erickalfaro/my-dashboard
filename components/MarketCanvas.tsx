"use client";

import React from "react";
import { Chart } from "react-chartjs-2";
import { ChartData, ChartOptions } from "chart.js";

interface MarketCanvasData {
  ticker: string;
  lineData: number[];
  barData: number[];
}

interface MarketCanvasProps {
  data: MarketCanvasData | null;
  selectedStock: string | null;
}

export const MarketCanvas: React.FC<MarketCanvasProps> = ({ data, selectedStock }) => {
  if (!data) return null;

  const labels = Array.from({ length: data.lineData.length }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - (data.lineData.length - 1 - i));
    return date;
  });

  const config: ChartData<"bar" | "line"> = {
    labels,
    datasets: [
      {
        type: "line" as const,
        data: data.lineData,
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
        data: data.barData,
        backgroundColor: "rgba(128, 128, 128, 0.5)",
        borderColor: "rgba(128, 128, 128, 1)",
        borderWidth: 1,
        yAxisID: "yVolume",
      },
    ],
  };

  const priceMin = Math.min(...data.lineData);
  const priceMax = Math.max(...data.lineData);
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
        max: Math.max(...data.barData) * 1.2 || 1000,
      },
    },
  };

  return (
    <div className="mt-6 MarketCanvas" style={{ height: "300px" }}>
      <Chart type="bar" data={config} options={options} />
    </div>
  );
};