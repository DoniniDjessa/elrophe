import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Anciennes adresses du pilotage, regroupées dans Boutique
  async redirects() {
    return [
      { source: '/pilotage/products', destination: '/pilotage/boutique', permanent: true },
      { source: '/pilotage/categories', destination: '/pilotage/boutique?tab=categories', permanent: true },
      // Collections de la vitrine, devenues des filtres de la boutique
      { source: '/meilleures-ventes', destination: '/boutique?collection=meilleures-ventes', permanent: true },
      { source: '/nouveautes', destination: '/boutique?collection=nouveautes', permanent: true },
      // Refonte : « À propos » devient « Notre maison »
      { source: '/a-propos', destination: '/notre-maison', permanent: true },
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
