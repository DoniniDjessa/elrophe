import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import BestSellerSpotlight from '@/components/site/home/BestSellerSpotlight';
import Engagements from '@/components/site/home/Engagements';
import HomeHero from '@/components/site/home/HomeHero';
import MaisonSplit from '@/components/site/home/MaisonSplit';
import { getCategories, getProducts, getSettings } from '@/lib/data';
import { pickSpecialProduct } from '@/lib/landing';
import { previewOrder } from '@/lib/preview';
import { byRank } from '@/lib/ranking';

/** Accueil : bannière, sélection, maison, engagements — rien de plus (cahier des charges) */
export default async function HomePage() {
  const [products, categories, { hero, shop }] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const special = pickSpecialProduct(products);
  // Sélection : les 3 produits mis en avant dans la préversion (Pylor, Moringa, Curcuma), complétés par les meilleures ventes
  const featured = previewOrder.slice(0, 3).flatMap((slug) => products.filter((p) => p.slug === slug && !p.coming_soon));
  const selection = [
    ...featured,
    ...products.filter((p) => !featured.includes(p) && p.is_bestseller && !p.coming_soon).sort(byRank('bestseller_order')),
  ].slice(0, 3);
  const categoryName = (slug: string | null) => categories.find((c) => c.slug === slug)?.name ?? 'Complément alimentaire';

  return (
    <>
      <HomeHero underNav={hero.transparent_nav} />

      {selection.length > 0 && (
        <section aria-labelledby="selection-title" className="container-site py-14 lg:py-20">
          <div className="text-center">
            <p className="kicker kicker-lines">Notre sélection</p>
            <h2 id="selection-title" className="title-lg mt-3 text-[clamp(1.9rem,4vw,2.7rem)]">
              Une sélection pensée avec exigence.
            </h2>
          </div>
          <ul className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0">
            {selection.map((p) => (
              <li key={p.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
                <ProductCard product={p} categoryName={categoryName(p.category_slug)} cta="discover" />
              </li>
            ))}
          </ul>
          {special && <BestSellerSpotlight product={special} currency={shop.currency} />}
          <div className="mt-10 text-center">
            <Link href="/boutique" className="btn btn-outline">
              Voir tous nos produits
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      )}

      <MaisonSplit />
      <Engagements />
    </>
  );
}
