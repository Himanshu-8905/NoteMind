import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "i.postimg.cc",
        protocol: "https",
      },
      {
        hostname: "media3.giphy.com",
        protocol: "https",
      },
      {
        hostname: "media2.giphy.com",
        protocol: "https",
      },
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "i.ytimg.com",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
