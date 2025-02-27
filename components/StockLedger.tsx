import React from "react";

interface StockLedgerData {
  stockName: string;
  description: string;
  marketCap: string;
}

interface StockLedgerProps {
  data: StockLedgerData;
  loading: boolean;
}

export const StockLedger: React.FC<StockLedgerProps> = ({ data, loading }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">StockLedger{loading ? " (Loading...)" : ""}</h2>
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
              <td className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>{data.stockName}</td>
              <td className="border border-gray-700 p-2 text-center" style={{ width: "50%" }}>{data.description}</td>
              <td className="border border-gray-700 p-2 text-center" style={{ width: "25%" }}>{data.marketCap}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};