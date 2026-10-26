import { Suspense } from 'react';
import { getCategories, getProducts } from '@/lib/data';
import PageHeader from './PageHeader';
import ShopView from './ShopView';

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  return (
    <>
      <PageHeader
        eyebrow="La"
        accent="boutique"
        title="Tous nos produits"
        script="naturels"
        text="Compléments, huiles, tisanes et soins : des formules simples, tracées et testées."
        crumbs={[{ label: 'Boutique' }]}
      />
      {/* useSearchParams : la grille lit les filtres de l'URL au moment de la requête */}
      <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-[1440px] px-4 sm:px-6 lg:px-10" aria-busy="true" />}>
        <ShopView products={products} categories={categories} />
      </Suspense>
    </>
  );
}
