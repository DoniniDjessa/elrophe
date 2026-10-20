'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { Heart, House, Menu, ShoppingBag, User, X } from 'lucide-react';
import { useCart, useFavorites, useSite } from './Providers';

export const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/boutique', label: 'Boutique' },
  { href: '/meilleures-ventes', label: 'Meilleures ventes' },
  { href: '/nouveautes', label: 'Nouveautés' },
  { href: '/#rituel', label: 'Rituels bien-être' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
];

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : !href.includes('#') && pathname.startsWith(href);

export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-full" aria-label={`${name} — accueil`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream/70">
        <Image
          src="/logo-mark.png"
          alt=""
          width={109}
          height={160}
          priority
          sizes="20px"
          className="h-6 w-auto transition-transform duration-500 group-hover:rotate-[-8deg]"
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
            className="fixed inset-0 z-[60] flex flex-col bg-sage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_30rem_at_0%_0%,var(--surface-cream),transparent_65%)] opacity-80" />
            <div className="relative flex items-center justify-between px-4 py-4 sm:px-6">
              <Logo name={brandName} />
              <button type="button" onClick={() => setOpen(false)} className="icon-btn glass" aria-label="Fermer le menu" autoFocus>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Navigation mobile" className="relative flex flex-1 flex-col justify-center gap-1 px-6">
              {navLinks.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <m.div key={link.href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`heading-lg block border-b border-line py-3 text-[clamp(1.6rem,7vw,2.4rem)] ${active ? 'text-leaf' : 'text-ink'}`}
                    >
                      {link.label}
                    </Link>
                  </m.div>
                );
              })}
            </nav>
            <div className="relative grid grid-cols-3 gap-2 px-6 pb-8">
              {[
                { href: '/panier', label: `Panier (${count})`, Icon: ShoppingBag },
                { href: '/favoris', label: 'Favoris', Icon: Heart },
                { href: '/compte', label: 'Compte', Icon: User },
              ].map(({ href, label, Icon }) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className="glass flex flex-col items-center gap-1.5 rounded-2xl py-3 text-xs font-medium">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
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
