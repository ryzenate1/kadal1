/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors are caught in dev; don't block production builds
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
      "img.clerk.com",
      "images.clerk.dev",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "source.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "ext.same-assets.com", pathname: "/**" },
      { protocol: "https", hostname: "ugc.same-assets.com", pathname: "/**" },
      { protocol: "https", hostname: "img.clerk.com", pathname: "/**" },
      { protocol: "https", hostname: "images.clerk.dev", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      {
        source: '/catagory',
        destination: '/category',
        permanent: true,
      },
      {
        source: '/catagory/:slug*',
        destination: '/category/:slug*',
        permanent: true,
      },
      {
        source: '/categoriesmobile',
        destination: '/categories',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
