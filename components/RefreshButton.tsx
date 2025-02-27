import React from "react";

interface RefreshButtonProps {
  onClick: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="p-2 bg-blue-500 text-white rounded mb-4">
      Refresh Data
    </button>
  );
};