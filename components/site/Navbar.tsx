'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import {
  ChartNoAxesColumnIncreasing,
  ChevronRight,
  Flower2,
  Gift,
  HandHeart,
  Heart,
  House,
  Menu,
  Phone,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useCart, useFavorites, useSite } from './Providers';

export const navLinks = [
  { href: '/', label: 'Accueil', Icon: House },
  { href: '/boutique', label: 'Boutique', Icon: ShoppingBag },
  { href: '/meilleures-ventes', label: 'Meilleures ventes', Icon: ChartNoAxesColumnIncreasing },
  { href: '/nouveautes', label: 'Nouveautés', Icon: Gift },
  { href: '/#rituel', label: 'Rituels bien-être', Icon: Flower2 },
  { href: '/a-propos', label: 'À propos', Icon: HandHeart },
  { href: '/contact', label: 'Contact', Icon: Phone },
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href);

export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-full" aria-label={`${name} — accueil`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream/70">
        <Image
          src="/icon2.png"
          alt=""
          width={1024}
          height={984}
          priority
          sizes="32px"
          className="h-7 w-auto transition-transform duration-500 group-hover:rotate-[-8deg]"
        />
      </span>
      <span className="font-display text-[15px] font-extrabold tracking-[0.32em] text-ink uppercase">El Rophe</span>
    </Link>
  );
}

export default function Navbar({ announcement }: { announcement?: string }) {
  const pathname = usePathname() ?? '/';
  const { brandName } = useSite();
  const { count } = useCart();
  const { ids } = useFavorites();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {announcement && (
        <div className="marquee bg-forest py-2 text-[11px] font-medium tracking-[0.18em] text-white/90 uppercase" role="marquee" aria-label={announcement}>
          {/* Deux pistes identiques : la seconde prend le relais pour un défilement sans couture */}
          {[0, 1].map((track) => (
            <div key={track} className="marquee-track" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="flex items-center gap-8 pr-8">
                  {announcement}
                  <span className="h-1 w-1 rounded-full bg-lime" />
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
      <header className="sticky top-0 z-50">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          <div className="glass rounded-full py-1 pr-4 pl-1 shadow-[var(--shadow-card)] xl:border-transparent xl:bg-transparent xl:shadow-none xl:backdrop-blur-none">
            <Logo name={brandName} />
          </div>

          <nav aria-label="Navigation principale" className="glass hidden items-center gap-0.5 rounded-full p-1.5 shadow-[var(--shadow-card)] xl:flex">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-medium whitespace-nowrap transition-colors ${
                    active ? 'bg-forest text-white shadow-sm' : 'text-ink hover:bg-white/60'
                  }`}
                >
                  {link.href === '/' && <House className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/panier" className="icon-btn glass relative shadow-[var(--shadow-card)]" aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime px-1 text-[10px] font-bold text-forest">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/favoris" className="icon-btn glass relative hidden shadow-[var(--shadow-card)] sm:inline-flex" aria-label={`Favoris, ${ids.length}`}>
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
              {ids.length > 0 && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-leaf" aria-hidden="true" />}
            </Link>
            <Link href="/compte" className="icon-btn glass hidden shadow-[var(--shadow-card)] sm:inline-flex" aria-label="Mon compte et suivi de commande">
              <User className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="icon-btn glass shadow-[var(--shadow-card)] xl:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <Menu className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[linear-gradient(170deg,#f1efe4_0%,#e6e6d6_55%,#dcdfcb_100%)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Voile végétal en haut à droite, comme sur la maquette */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--leaf)_28%,transparent),transparent)] blur-2xl" />
            <div className="pointer-events-none absolute right-0 bottom-40 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--leaf)_12%,transparent),transparent)] blur-2xl" />

            <div className="relative flex items-center justify-between gap-3 px-5 pt-6 pb-4">
              <Link href="/" onClick={() => setOpen(false)} className="flex min-w-0 items-center gap-3" aria-label={`${brandName} — accueil`}>
                <Image src="/icon2.png" alt="" width={1024} height={984} sizes="64px" className="h-16 w-auto shrink-0" />
                <span className="min-w-0">
                  <span className="block font-serif text-[1.65rem] leading-none tracking-[0.06em] text-forest uppercase">{brandName}</span>
                  <span className="mt-1.5 block text-[9px] font-medium tracking-[0.28em] text-ink-muted uppercase">Premium natural products</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-gold/70 bg-cream text-ink shadow-[var(--shadow-card)] transition-transform active:scale-95"
                aria-label="Fermer le menu"
                autoFocus
              >
                <X className="h-6 w-6" strokeWidth={1.6} />
              </button>
            </div>

            <nav aria-label="Navigation mobile" className="relative flex flex-1 flex-col px-4 pt-4">
              {navLinks.map(({ href, label, Icon }, i) => {
                const active = isActive(pathname, href);
                return (
                  <m.div key={href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors ${
                        active
                          ? 'border border-white/70 bg-[color-mix(in_srgb,var(--leaf)_10%,white_40%)] shadow-[var(--shadow-card)]'
                          : 'border border-transparent'
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cream/90 text-gold shadow-[0_4px_14px_-8px_color-mix(in_srgb,var(--forest)_45%,transparent)]">
                        <Icon className="h-[22px] w-[22px]" strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="flex-1 font-serif text-[1.55rem] leading-tight font-bold text-forest">{label}</span>
                      <ChevronRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden="true" />
                    </Link>
                    {i < navLinks.length - 1 && <div className="mx-3 my-1 h-px bg-[color-mix(in_srgb,var(--gold)_22%,transparent)]" />}
                  </m.div>
                );
              })}
            </nav>

            <div className="relative grid grid-cols-3 gap-3 px-5 pt-6 pb-8">
              {[
                { href: '/panier', label: `Panier (${count})`, Icon: ShoppingBag },
                { href: '/favoris', label: 'Favoris', Icon: Heart },
                { href: '/compte', label: 'Compte', Icon: User },
              ].map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-white/70 bg-cream/90 py-4 text-sm font-medium text-ink shadow-[var(--shadow-card)] transition-transform active:scale-[0.97]"
                >
                  <Icon className="h-6 w-6" strokeWidth={1.6} />
                  {label}
                </Link>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
