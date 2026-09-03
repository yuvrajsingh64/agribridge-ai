import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/**": ["./prisma/dev.db"],
    "/orders/**": ["./prisma/dev.db"],
  },
};

export default nextConfig;
