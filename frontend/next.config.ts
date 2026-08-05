import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Built as a static site and served by FastAPI. No SSR, no route handlers.
  output: "export",
};

export default nextConfig;
