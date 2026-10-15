'use client';

import { db, refreshSite, reorder, TABLES } from '@/lib/admin';
import type { Product } from '@/lib/types';

export type CollectionKey = 'is_new' | 'is_bestseller';
export const ORDER_COLUMN = { is_new: 'new_order', is_bestseller: 'bestseller_order' } as const;

/** Un seul produit du moment : on retire l'ancien avant de marquer le nouveau (index unique en base) */
export async function setFeatured(productId: string | null | undefined) {
  const clear = await db().from(TABLES.products).update({ is_featured: false } as never).eq('is_featured', true);
  if (clear.error) return { error: clear.error.message };
  if (productId) {
    const { error } = await db().from(TABLES.products).update({ is_featured: true } as never).eq('id', productId);
    if (error) return { error: error.message };
  }
  await refreshSite();
  return { error: null };
}

/** Ajoute ou retire un produit d'une collection (Nouveautés / Meilleures ventes), en fin de liste */
export async function setInCollection(product: Product, key: CollectionKey, on: boolean, position: number) {
  const { error } = await db()
    .from(TABLES.products)
    .update({ [key]: on, [ORDER_COLUMN[key]]: on ? position : 0 } as never)
    .eq('id', product.id);
  if (!error) await refreshSite();
  return { error: error?.message ?? null };
}

export const reorderProducts = (ids: string[], column: 'sort_order' | 'new_order' | 'bestseller_order' = 'sort_order') =>
  reorder(TABLES.products, ids, column);
