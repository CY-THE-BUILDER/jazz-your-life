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
  }
};

export default withPWA(nextConfig);
