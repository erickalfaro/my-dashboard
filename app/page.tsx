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
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  const API_URL = "/api/mockdata";

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

  const handleSort = (column: keyof DataItem) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    setData([...data].sort((a, b) => (newDirection === 'asc' ? a[column] > b[column] : a[column] < b[column]) ? 1 : -1));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Stock Data Table</h1>
      <button onClick={fetchData} className="p-2 bg-blue-500 text-white rounded mb-4">Refresh Data</button>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="border-collapse border border-gray-700 w-full text-center">
          <thead>
            <tr className="bg-gray-800">
              <th className="border border-gray-700 p-2 cursor-pointer" onClick={() => handleSort('id')}>ID</th>
              <th className="border border-gray-700 p-2 cursor-pointer" onClick={() => handleSort('name')}>Stock</th>
              <th className="border border-gray-700 p-2 cursor-pointer" onClick={() => handleSort('value')}>Price</th>
              <th className="border border-gray-700 p-2">Trend</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800">
                <td className="border border-gray-700 p-2">{item.id}</td>
                <td className="border border-gray-700 p-2 cursor-pointer text-blue-400 hover:underline" onClick={() => setSelectedStock(item.name)}>
                  {item.name}
                </td>
                <td className="border border-gray-700 p-2">${item.value.toFixed(2)}</td>
                <td className="border border-gray-700 p-2">
                  <Sparklines data={item.trend} width={100} height={20}>
                    <SparklinesLine color="blue" />
                  </Sparklines>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selectedStock && <p className="mt-4 text-lg">Selected Stock: <span className="text-blue-400">{selectedStock}</span></p>}
    </div>
  );
}
