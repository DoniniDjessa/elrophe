import type { Metadata } from 'next';
import ShopPage from '@/components/site/ShopPage';

export const metadata: Metadata = { title: 'Boutique', description: 'Tous les produits naturels ELROPHE : compléments, huiles essentielles, tisanes et soins.' };

export default function BoutiquePage() {
  return <ShopPage preset="all" />;
}
