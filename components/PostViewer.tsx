import React from "react";

interface PostData {
  hours: number;
  text: string;
}

interface PostViewerProps {
  data: PostData[];
  loading: boolean;
  selectedStock: string | null;
}

export const PostViewer: React.FC<PostViewerProps> = ({ data, loading, selectedStock }) => {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">PostViewer{loading ? " (Loading...)" : ""}</h2>
      {loading ? (
        <p>Loading posts...</p>
      ) : data.length > 0 ? (
        <div className="PostViewer">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-700 p-1 text-center">Hours Ago</th>
                <th className="border border-gray-700 p-1 text-center">Post</th>
              </tr>
            </thead>
            <tbody>
              {data.map((post, index) => (
                <tr key={index} className="hover:bg-gray-800">
                  <td className="border border-gray-700 p-1 text-center">{post.hours.toFixed(1)}</td>
                  <td className="border border-gray-700 p-1 text-left">{post.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No posts available for {selectedStock || "selected stock"}.</p>
      )}
    </div>
  );
};