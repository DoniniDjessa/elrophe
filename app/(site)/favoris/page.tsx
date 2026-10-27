import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import { getProducts } from '@/lib/data';
import FavoritesList from './FavoritesList';

export const metadata: Metadata = { title: 'Mes favoris', robots: { index: false } };

export default async function FavorisPage() {
  const products = await getProducts();
  return (
    <>
      <PageHeader title="Mes favoris" crumbs={[{ label: 'Favoris' }]} />
      <div className="container-site pb-16">
        <FavoritesList products={products} />
      </div>
    </>
  );
}
