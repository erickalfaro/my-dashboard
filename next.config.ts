import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Ensures Next.js generates static files for Vercel
  distDir: ".next", // Keep the correct output directory
};

export default nextConfig;
