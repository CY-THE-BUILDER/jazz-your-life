import withPWAInit from "next-pwa";
import defaultRuntimeCaching from "next-pwa/cache.js";

const runtimeCaching = [
  ...defaultRuntimeCaching.filter((entry) => entry.options?.cacheName !== "others"),
  {
    urlPattern: ({ request, sameOrigin, url }) =>
      sameOrigin && request.mode === "navigate" && !url.pathname.startsWith("/api/"),
    handler: "NetworkOnly",
    method: "GET"
  },
  {
    urlPattern: ({ request, sameOrigin, url }) =>
      sameOrigin && request.mode !== "navigate" && !url.pathname.startsWith("/api/"),
    handler: "NetworkFirst",
    options: {
      cacheName: "others",
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 3600
      },
      networkTimeoutSeconds: 3
    }
  }
];

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheStartUrl: false,
  publicExcludes: ["!noprecache/**/*", "!sw *.js"],
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
