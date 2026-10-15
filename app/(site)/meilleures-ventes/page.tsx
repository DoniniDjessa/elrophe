import type { Metadata } from 'next';
import ShopPage from '@/components/site/ShopPage';

export const metadata: Metadata = { title: 'Meilleures ventes' };

export default function MeilleuresVentesPage() {
  return <ShopPage preset="bestsellers" />;
}
