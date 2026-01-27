import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
      "tw-animate-css": path.join(projectRoot, "node_modules/tw-animate-css"),
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      path.join(projectRoot, "node_modules"),
      "node_modules",
      ...(config.resolve.modules || []),
    ];
    return config;
  },
};

export default nextConfig;
