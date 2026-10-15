import { Suspense } from 'react';
import { getCategories, getProducts } from '@/lib/data';
import PageHeader from './PageHeader';
import ShopView, { type ShopPreset } from './ShopView';

const headers: Record<ShopPreset, { eyebrow: string; accent: string; title: string; script: string; text: string; crumb: string }> = {
  all: { eyebrow: 'La', accent: 'boutique', title: 'Tous nos produits', script: 'naturels', text: 'Compléments, huiles, tisanes et soins : des formules simples, tracées et testées.', crumb: 'Boutique' },
  bestsellers: { eyebrow: 'Les plus', accent: 'aimés', title: 'Meilleures ventes', script: 'adoptés', text: 'Les essentiels que nos clients rachètent, mois après mois.', crumb: 'Meilleures ventes' },
  new: { eyebrow: 'Tout juste', accent: 'arrivés', title: 'Nouveautés', script: 'fraîches', text: 'Les dernières formules imaginées par notre équipe.', crumb: 'Nouveautés' },
};

export default async function ShopPage({ preset }: { preset: ShopPreset }) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const h = headers[preset];
  return (
    <>
      <PageHeader eyebrow={h.eyebrow} accent={h.accent} title={h.title} script={h.script} text={h.text} crumbs={[{ label: h.crumb }]} />
      {/* useSearchParams : la grille lit les filtres de l'URL au moment de la requête */}
      <Suspense fallback={<div className="mx-auto min-h-[60vh] max-w-[1440px] px-4 sm:px-6 lg:px-10" aria-busy="true" />}>
        <ShopView products={products} categories={categories} preset={preset} />
      </Suspense>
    </>
  );
}
