import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import LandingPage from '@/components/site/landing/LandingPage';
import { getCategories, getProducts, getSettings } from '@/lib/data';
import { normalizeLanding, pickSpecialProduct } from '@/lib/landing';

export async function generateMetadata(): Promise<Metadata> {
  const product = pickSpecialProduct(await getProducts());
  if (!product) return { title: 'Best-seller' };
  return {
    title: `${product.name} — Best-seller`,
    description: product.landing?.hero_text || product.tagline || product.benefit || undefined,
    openGraph: { images: product.image_url && !product.image_url.endsWith('.svg') ? [product.image_url] : undefined },
  };
}

/** Produit spécial choisi dans Pilotage › Boutique › Produit spécial */
async function SpecialProduct() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const product = pickSpecialProduct(products);
  if (!product) notFound();
  const category = categories.find((c) => c.slug === product.category_slug);
  return <LandingPage product={product} landing={product.landing ?? normalizeLanding(null)} categoryName={category?.name} shop={settings.shop} />;
}

export default function BestSellerPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh]" aria-busy="true" />}>
      <SpecialProduct />
    </Suspense>
  );
}
