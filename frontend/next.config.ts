import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,
  experimental: {
    webpackBuildWorker: false,
  },
};

export default nextConfig;
