import withPWAInit from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co"
      },
      {
        protocol: "https",
        hostname: "mosaic.scdn.co"
      },
      {
        protocol: "https",
        hostname: "profile-images.scdn.co"
      },
      {
        protocol: "https",
        hostname: "image-cdn-ak.spotifycdn.com"
      },
      {
        protocol: "https",
        hostname: "image-cdn-fa.spotifycdn.com"
      }
    ]
  }
};

export default withPWA(nextConfig);
