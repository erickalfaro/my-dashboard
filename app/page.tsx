"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface DataItem {
  id: number;
  name: string;
  value: string;
}

export default function Home() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://api.example.com/data"; // Replace with your API

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Data Table</h1>
      <button onClick={fetchData} className="p-2 bg-blue-500 text-white rounded mb-4">
        Refresh Data
      </button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="border-collapse border border-gray-400 w-full">
          <thead>
            <tr>
              <th className="border border-gray-400 p-2">ID</th>
              <th className="border border-gray-400 p-2">Name</th>
              <th className="border border-gray-400 p-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td className="border border-gray-400 p-2">{item.id}</td>
                <td className="border border-gray-400 p-2">{item.name}</td>
                <td className="border border-gray-400 p-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
