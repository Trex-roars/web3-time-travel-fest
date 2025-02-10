import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // ...
    config.externals['@solana/web3.js'] = 'commonjs @solana/web3.js';
    return config;
  },
};

export default nextConfig;
