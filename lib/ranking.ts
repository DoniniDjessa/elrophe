import type { Product } from './types';

/** Ordre manuel d'une collection : rang défini d'abord (1, 2, 3…), puis ordre de la boutique */
export const byRank = (key: 'sort_order' | 'new_order' | 'bestseller_order') => (a: Product, b: Product) =>
  (a[key] || Infinity) - (b[key] || Infinity) || a.sort_order - b.sort_order;
