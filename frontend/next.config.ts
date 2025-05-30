import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  reactStrictMode: true,
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
