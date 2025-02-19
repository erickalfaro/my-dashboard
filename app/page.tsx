"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";

interface DataItem {
  id: number;
  name: string;
  value: number;
  trend: number[];
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "/api/mockdata"; // Adjust if using external API

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get<DataItem[]>(API_URL);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Stock Data Table</h1>
      <button 
        onClick={fetchData} 
        className="p-2 bg-blue-500 text-white rounded mb-4"
      >
        Refresh Data
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="border-collapse border border-gray-400 w-full text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-400 p-2">ID</th>
              <th className="border border-gray-400 p-2">Stock</th>
              <th className="border border-gray-400 p-2">Price</th>
              <th className="border border-gray-400 p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="border border-gray-400 p-2">{item.id}</td>
                <td className="border border-gray-400 p-2">{item.name}</td>
                <td className="border border-gray-400 p-2">${item.value.toFixed(2)}</td>
                <td className="border border-gray-400 p-2">
                  <Sparklines data={item.trend} width={100} height={20}>
                    <SparklinesLine color="blue" />
                  </Sparklines>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
