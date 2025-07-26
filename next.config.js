/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  eslint: {
    // Skip ESLint during production builds to avoid incompatible option errors
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/catagory',
        destination: '/categoriesmobile',
        permanent: true,
      },
      {
        source: '/catagory/:slug*',
        destination: '/category/:slug*',
        permanent: true,
      },
      {
        source: '/category',
        destination: '/categoriesmobile',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
