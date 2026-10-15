import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Anciennes adresses du pilotage, regroupées dans Boutique
  async redirects() {
    return [
      { source: '/pilotage/products', destination: '/pilotage/boutique', permanent: true },
      { source: '/pilotage/categories', destination: '/pilotage/boutique?tab=categories', permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'tvhqldvmmbslrcbcwhhs.supabase.co', pathname: '/storage/v1/object/public/**' }],
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
