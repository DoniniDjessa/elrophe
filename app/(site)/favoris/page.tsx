import type { Metadata } from 'next';
import PageHeader from '@/components/site/PageHeader';
import { getProducts } from '@/lib/data';
import FavoritesList from './FavoritesList';

export const metadata: Metadata = { title: 'Mes favoris', robots: { index: false } };

export default async function FavorisPage() {
  const products = await getProducts();
  return (
    <>
      <PageHeader eyebrow="Vos" accent="coups de cœur" title="Mes favoris" crumbs={[{ label: 'Favoris' }]} />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <FavoritesList products={products} />
      </div>
    </>
  );
}
