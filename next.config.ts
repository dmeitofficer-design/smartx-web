// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.STORAGE_MODE === 'local',
    
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      // Local server / VPS uploads domain (if serving media from production domain)
      {
        protocol: 'https',
        hostname: 'smartxlimited.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.smartxlimited.com',
        pathname: '/**',
      },
    ],
  },

  // 301 Redirects to fix old indexed WooCommerce/WordPress paths
  async redirects() {
    return [
      // Old WordPress category URLs -> New Next.js category/product structure
      {
        source: '/product-category/:path*',
        destination: '/products',
        permanent: true,
      },
      // Old WordPress single product URLs
      {
        source: '/product/:slug',
        destination: '/products',
        permanent: true,
      },
      // Old WooCommerce shop page
      {
        source: '/shop',
        destination: '/products',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;