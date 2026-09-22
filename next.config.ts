import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix workspace root detection warning when a package-lock.json exists
  // at a higher level directory (e.g. the Desktop)
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
