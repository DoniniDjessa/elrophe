'use client';

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion';
import { toast } from 'sonner';
import type { LandingOffer, Product } from '@/lib/types';

/* ---------- Contexte du site (valeurs du pilotage utiles côté client) ---------- */
interface SiteInfo {
  brandName: string;
  currency: string;
}
const SiteContext = createContext<SiteInfo>({ brandName: 'ELROPHE', currency: 'FCFA' });
export const useSite = () => useContext(SiteContext);

/* ---------- Panier ---------- */
export interface CartLine {
  /** Identifiant de ligne : produit + variante */
  key: string;
  product_id: string;
  /** Variante (format) choisie ; vide = produit à l'unité */
  offer_id: string;
  variant: string;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  /** Format d'un produit à livraison offerte (même règle que elrophe_place_order) */
  free_shipping?: boolean;
}

export const lineKey = (productId: string, offerId = '') => `${productId}:${offerId}`;

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  ready: boolean;
  add: (product: Product, quantity?: number, variant?: LandingOffer | null) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}
const CartContext = createContext<CartState | null>(null);
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans <Providers>');
  return ctx;
}

/* ---------- Favoris ---------- */
interface FavoritesState {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (product: Pick<Product, 'id' | 'name'>) => void;
}
const FavoritesContext = createContext<FavoritesState | null>(null);
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites doit être utilisé dans <Providers>');
  return ctx;
}

/* ---------- État persistant (localStorage), synchronisé entre onglets ---------- */
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = () => {
    cache.clear();
    callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function readStored<T>(key: string, initial: T): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    /* stockage indisponible */
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = initial;
  try {
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    /* valeur corrompue : on repart de la valeur initiale */
  }
  cache.set(key, { raw, value });
  return value;
}

function writeStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
  cache.delete(key);
  listeners.forEach((l) => l());
}

const noopSubscribe = () => () => {};

function usePersistentState<T>(key: string, initial: T) {
  const [fallback] = useState(initial);
  const value = useSyncExternalStore(subscribe, () => readStored(key, fallback), () => fallback);
  // false pendant le rendu serveur et l'hydratation, true ensuite
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStored(key, fallback);
      writeStored(key, typeof next === 'function' ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, setValue, ready] as const;
}

export default function Providers({ children, site }: { children: ReactNode; site: SiteInfo }) {
  const [storedLines, setLines, ready] = usePersistentState<CartLine[]>('elrophe-cart', []);
  // Paniers enregistrés avant les variantes : complétés à la lecture
  const lines = useMemo(
    () => storedLines.map((l) => (l.key ? l : { ...l, key: lineKey(l.product_id), offer_id: '', variant: '' })),
    [storedLines],
  );
  const [favIds, setFavIds] = usePersistentState<string[]>('elrophe-favorites', []);

  const add = useCallback(
    (product: Product, quantity = 1, variant?: LandingOffer | null) => {
      const offerId = variant?.id ?? '';
      const key = lineKey(product.id, offerId);
      setLines((prev) => {
        const existing = prev.find((l) => (l.key ?? lineKey(l.product_id)) === key);
        if (existing) {
          return prev.map((l) => ((l.key ?? lineKey(l.product_id)) === key ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l));
        }
        return [
          ...prev,
          {
            key,
            product_id: product.id,
            offer_id: offerId,
            variant: offerId ? (variant?.label ?? '') : '',
            slug: product.slug,
            name: product.name,
            price: variant?.price ?? product.price,
            image_url: product.image_url,
            quantity,
            free_shipping: !!(offerId && product.landing?.free_shipping),
          },
        ];
      });
      toast.success(`${product.name} ajouté au panier`);
    },
    [setLines],
  );

  const toggleFavorite = useCallback(
    (product: Pick<Product, 'id' | 'name'>) => {
      const on = favIds.includes(product.id);
      setFavIds(on ? favIds.filter((x) => x !== product.id) : [...favIds, product.id]);
      toast(on ? `${product.name} retiré des favoris` : `${product.name} ajouté aux favoris`);
    },
    [favIds, setFavIds],
  );

  const cart = useMemo<CartState>(
    () => ({
      lines,
      ready,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: lines.reduce((n, l) => n + l.price * l.quantity, 0),
      add,
      setQuantity: (key, q) =>
        setLines((prev) =>
          q <= 0
            ? prev.filter((l) => (l.key ?? lineKey(l.product_id)) !== key)
            : prev.map((l) => ((l.key ?? lineKey(l.product_id)) === key ? { ...l, quantity: Math.min(99, q) } : l)),
        ),
      remove: (key) => setLines((prev) => prev.filter((l) => (l.key ?? lineKey(l.product_id)) !== key)),
      clear: () => setLines([]),
    }),
    [lines, ready, add, setLines],
  );

  const favorites = useMemo<FavoritesState>(
    () => ({ ids: favIds, has: (id) => favIds.includes(id), toggle: toggleFavorite }),
    [favIds, toggleFavorite],
  );

  return (
    <SiteContext.Provider value={site}>
      <CartContext.Provider value={cart}>
        <FavoritesContext.Provider value={favorites}>
          <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
          </LazyMotion>
        </FavoritesContext.Provider>
      </CartContext.Provider>
    </SiteContext.Provider>
  );
}
