import { Suspense } from 'react';
import { getCategories, getProducts } from '@/lib/data';
import PageHeader from './PageHeader';
import ShopView from './ShopView';

export default async function ShopPage() {
  const [products, allCategories] = await Promise.all([getProducts(), getCategories()]);
  // Filtres : uniquement les catégories réellement disponibles
  const categories = allCategories.filter((c) => products.some((p) => p.category_slug === c.slug));
  return (
    <>
      <PageHeader
        kicker="Nos produits"
        title="Une sélection pensée avec exigence."
        text="Des produits naturels haut de gamme, choisis pour votre bien-être global."
        crumbs={[{ label: 'Nos produits' }]}
      />
      {/* useSearchParams : la grille lit les filtres de l'URL au moment de la requête */}
      <Suspense fallback={<div className="container-site min-h-[60vh]" aria-busy="true" />}>
        <ShopView products={products} categories={categories} />
      </Suspense>
    </>
  );
}
