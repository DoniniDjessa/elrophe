'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import ProductCard from '@/components/site/ProductCard';
import { useFavorites } from '@/components/site/Providers';
import type { Product } from '@/lib/types';

export default function FavoritesList({ products }: { products: Product[] }) {
  const { ids } = useFavorites();
  const list = products.filter((p) => ids.includes(p.id));
  if (list.length === 0) {
    return (
      <div className="card mx-auto max-w-lg p-10 text-center">
        <Heart className="mx-auto h-10 w-10 text-forest" strokeWidth={1.4} aria-hidden="true" />
        <p className="heading-lg mt-4 text-xl">Aucun favori pour le moment</p>
        <p className="mt-2 text-sm text-ink-muted">Touchez le cœur d’un produit pour le retrouver ici.</p>
        <Link href="/boutique" className="btn-primary mt-6">Découvrir la boutique</Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {list.map((p) => (
        <li key={p.id}><ProductCard product={p} /></li>
      ))}
    </ul>
  );
}
