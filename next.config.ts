import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed output: 'export' to enable API routes
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        bufferutil: false,
        'utf-8-validate': false,
      };
    }
    return config;
  },
};

export default nextConfig;
