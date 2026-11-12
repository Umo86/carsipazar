import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg is a Node library; keep it out of the bundler.
  serverExternalPackages: ["pg"],
  // The social image routes read their fonts from disk at request time; say so
  // here so the files are included in the Vercel deployment.
  outputFileTracingIncludes: {
    "/social/**": ["./assets/fonts/**"],
  },
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
