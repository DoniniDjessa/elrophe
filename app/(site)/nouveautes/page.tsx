import type { Metadata } from 'next';
import ShopPage from '@/components/site/ShopPage';

export const metadata: Metadata = { title: 'Nouveautés' };

export default function NouveautesPage() {
  return <ShopPage preset="new" />;
}
