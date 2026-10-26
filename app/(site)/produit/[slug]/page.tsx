import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ChevronRight } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import ProductDetail from '@/components/site/ProductDetail';
import { SectionHeading } from '@/components/site/Typography';
import { getCategories, getProductBySlug, getProducts, getSettings } from '@/lib/data';
import { SPECIAL_PATH } from '@/lib/landing';

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
  // Le produit spécial a sa propre page de vente
  if (product.is_featured) redirect(SPECIAL_PATH);

  const category = categories.find((c) => c.slug === product.category_slug);
  const related = products.filter((p) => p.id !== product.id && p.category_slug === product.category_slug).slice(0, 4);
  const fill = products.filter((p) => p.id !== product.id && !related.includes(p) && p.is_bestseller);
  const suggestions = [...related, ...fill].slice(0, 4);

  return (
    <>
      <nav aria-label="Fil d'Ariane" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
          <li><Link href="/" className="hover:text-ink">Accueil</Link></li>
          <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link href="/boutique" className="hover:text-ink">Boutique</Link></li>
          {category && (
            <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><Link href={`/boutique?categorie=${category.slug}`} className="hover:text-ink">{category.name}</Link></li>
          )}
          <li className="flex items-center gap-1.5"><ChevronRight className="h-3 w-3" aria-hidden="true" /><span aria-current="page" className="text-ink">{product.name}</span></li>
        </ol>
      </nav>

      <ProductDetail product={product} categoryName={category?.name} deliveryInfo={settings.shop.delivery_info} />

      {suggestions.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24">
          <SectionHeading id="related-title" eyebrow="Vous aimerez" accent="aussi" title="À associer" script="naturellement" />
          <ul className="mt-8 grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
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
    <div className="mx-auto max-w-[1440px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
      <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
        <ProductContent params={params} />
      </Suspense>
    </div>
  );
}
