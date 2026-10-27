import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import BestSellerSpotlight from '@/components/site/home/BestSellerSpotlight';
import Engagements from '@/components/site/home/Engagements';
import HomeHero from '@/components/site/home/HomeHero';
import MaisonSplit from '@/components/site/home/MaisonSplit';
import Testimonials from '@/components/site/home/Testimonials';
import { getCategories, getProducts, getSettings, getTestimonials } from '@/lib/data';
import { pickSpecialProduct } from '@/lib/landing';
import { previewOrder } from '@/lib/preview';
import { byRank } from '@/lib/ranking';

/** Accueil : bannière, sélection, maison, engagements — rien de plus (cahier des charges) */
export default async function HomePage() {
  const [products, categories, { hero, shop }, testimonials] = await Promise.all([getProducts(), getCategories(), getSettings(), getTestimonials()]);
  const special = pickSpecialProduct(products);
  // Sélection (4 à 6 produits) : les produits mis en avant, puis les meilleures ventes, puis le reste du catalogue
  const featured = previewOrder.flatMap((slug) => products.filter((p) => p.slug === slug));
  const selection = [
    ...featured,
    ...products.filter((p) => !featured.includes(p) && p.is_bestseller).sort(byRank('bestseller_order')),
    ...products.filter((p) => !featured.includes(p) && !p.is_bestseller).sort(byRank('sort_order')),
  ].slice(0, 6);
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
          {/* 2 colonnes sur mobile ; sur ordinateur 4 produits sur une ligne, ou 3 par ligne au-delà */}
          <ul className={`mt-10 grid grid-cols-2 gap-2 sm:gap-4 ${selection.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
            {selection.map((p) => (
              <li key={p.id}>
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
      <Testimonials items={testimonials} />
    </>
  );
}
