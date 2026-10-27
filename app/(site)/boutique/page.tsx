import type { Metadata } from 'next';
import ShopPage from '@/components/site/ShopPage';

export const metadata: Metadata = { title: 'Nos produits', description: 'Une sélection pensée avec exigence : les produits naturels haut de gamme EL ROPHE, leurs formats et leurs prix.' };

export default function BoutiquePage() {
  return <ShopPage />;
}
