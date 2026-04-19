import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5142", // 👉 改成你后端端口
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
