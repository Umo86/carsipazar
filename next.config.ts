import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg is a Node library; keep it out of the bundler.
  serverExternalPackages: ["pg"],
  experimental: {
    // Listing photos are resized in the browser, then sent with the form.
    serverActions: { bodySizeLimit: "4mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
