import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  devIndicators: {
    appIsrStatus: false,
  },
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
