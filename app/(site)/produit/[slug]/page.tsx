import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import ProductDetail from '@/components/site/ProductDetail';
import { getCategories, getProductBySlug, getProducts, getSettings } from '@/lib/data';
import { landingOffers, offerSoldOut } from '@/lib/landing';

export async function generateStaticParams() {
  const products = await getProducts();
  // Cache Components exige au moins un résultat : catalogue vide → une page 404 générée
  return products.length ? products.map((p) => ({ slug: p.slug })) : [{ slug: 'catalogue-vide' }];
}

export async function generateMetadata({ params }: PageProps<'/produit/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.name,
    description: product.benefit ?? product.description?.slice(0, 150) ?? undefined,
    openGraph: { images: product.image_url && !product.image_url.endsWith('.svg') ? [product.image_url] : undefined },
  };
}

async function ProductContent({ params }: Pick<PageProps<'/produit/[slug]'>, 'params'>) {
  const { slug } = await params;
  const [product, products, categories, settings] = await Promise.all([getProductBySlug(slug), getProducts(), getCategories(), getSettings()]);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category_slug);
  const related = products.filter((p) => p.id !== product.id && p.category_slug === product.category_slug).slice(0, 4);
  const fill = products.filter((p) => p.id !== product.id && !related.includes(p) && p.is_bestseller);
  const suggestions = [...related, ...fill].slice(0, 4);

  // Données structurées (référencement) : prix et disponibilité réels
  const variants = landingOffers(product);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? product.benefit ?? undefined,
    image: product.image_url && !product.image_url.endsWith('.svg') ? [product.image_url] : undefined,
    brand: { '@type': 'Brand', name: 'EL ROPHE' },
    category: category?.name,
    // Produit pas encore en vente : pas d'offre (ni prix ni disponibilité)
    offers: product.coming_soon ? undefined : variants.map((v) => ({
      '@type': 'Offer',
      name: v.label,
      price: v.price,
      priceCurrency: 'XOF',
      availability: offerSoldOut(product, v) ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
          <li><Link href="/" className="hover:text-forest">Accueil</Link></li>
          <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link href="/boutique" className="hover:text-forest">Nos produits</Link></li>
          {category && (
            <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link href={`/boutique?categorie=${category.slug}`} className="hover:text-forest">{category.name}</Link></li>
          )}
          <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page" className="text-anthracite">{product.name}</span></li>
        </ol>
      </nav>

      <ProductDetail product={product} categoryName={category?.name} shop={settings.shop} />

      {suggestions.length > 0 && (
        <section aria-labelledby="related-title" className="mt-20 lg:mt-28">
          <p className="kicker kicker-lines flex justify-center">Vous aimerez aussi</p>
          <h2 id="related-title" className="title-lg mt-3 text-center text-[clamp(1.8rem,3.6vw,2.4rem)]">À associer</h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {suggestions.map((p) => (
              <li key={p.id}><ProductCard product={p} /></li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function ProductPage({ params }: PageProps<'/produit/[slug]'>) {
  return (
    <div className="container-site pt-6 pb-16 lg:pt-10">
      <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
