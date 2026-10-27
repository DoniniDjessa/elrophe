'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { ChevronRight, CircleHelp, HandHeart, Heart, House, Menu, Package, Phone, Search, ShieldCheck, ShoppingBag, Truck, User, X } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import Brand, { Wordmark } from './Brand';
import Flags from './Flags';
import { useCart } from './Providers';

export const navLinks = [
  { href: '/', label: 'Accueil', Icon: House },
  { href: '/boutique', label: 'Nos produits', Icon: ShoppingBag },
  { href: '/notre-maison', label: 'Notre maison', Icon: HandHeart },
  { href: '/engagements', label: 'Nos engagements', Icon: ShieldCheck },
  { href: '/faq', label: 'FAQ', Icon: CircleHelp },
  { href: '/contact', label: 'Contact', Icon: Phone },
];


const isActive = (pathname: string, href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

function CartButton({ count, className = '' }: { count: number; className?: string }) {
  return (
    <Link href="/panier" className={`icon-btn relative ${className}`} aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}>
      <ShoppingBag className="h-5 w-5" strokeWidth={1.6} />
      {count > 0 && (
        <span className="absolute top-1 right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-forest">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Navbar({ iconUrl, countries = [], transparentOnHome = false }: { iconUrl: string; countries?: string[]; transparentOnHome?: boolean }) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const { count } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInput = useRef<HTMLInputElement>(null);

  // Accueil, option du pilotage : barre posée sur l'image du hero, fond clair dès qu'on défile
  const overlay = transparentOnHome && pathname === '/';
  const clear = overlay && !scrolled;
  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overlay]);

  useEffect(() => {
    document.body.style.overflow = menu || search ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setMenu(false);
      setSearch(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menu, search]);

  useEffect(() => {
    if (search) searchInput.current?.focus();
  }, [search]);

  const submitSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get('q')?.toString().trim();
    setSearch(false);
    router.push(q ? `/boutique?q=${encodeURIComponent(q)}` : '/boutique');
  };

  return (
    <>
      {/* Bande d'information : un seul message */}
      <div className="bg-forest text-ivory/90">
        <p className="container-site flex h-9 items-center justify-center gap-2 text-[13px]">
          <Truck className="h-4 w-4 text-champagne" strokeWidth={1.6} aria-hidden="true" />
          Livraison fluide et rapide
        </p>
      </div>

      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${overlay ? '-mb-16 lg:-mb-20' : ''} ${
          clear ? 'border-transparent bg-transparent text-ivory' : 'border-line bg-ivory/95 backdrop-blur-sm'
        }`}
      >
        <div className="container-site grid h-16 grid-cols-[auto_1fr_auto] items-center gap-2 lg:h-20 lg:gap-8">
          {/* Menu (mobile), logo puis pays de présence */}
          <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <button type="button" onClick={() => setMenu(true)} className={`icon-btn -ml-2 shrink-0 lg:hidden ${clear ? 'text-ivory! hover:bg-ivory/10!' : ''}`} aria-label="Ouvrir le menu" aria-expanded={menu} aria-controls="mobile-menu">
              <Menu className="h-6 w-6" strokeWidth={1.6} />
            </button>
            <Brand iconUrl={iconUrl} tone={clear ? 'light' : 'dark'} badge />
          </div>

          <nav aria-label="Navigation principale" className="hidden justify-center lg:flex">
            <ul className="flex items-center gap-7 xl:gap-9">
              {navLinks.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative py-2 text-[15px] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-champagne after:transition-transform ${
                        clear
                          ? active
                            ? 'text-ivory after:scale-x-100'
                            : 'text-ivory/80 after:scale-x-0 hover:text-ivory hover:after:scale-x-100'
                          : active
                            ? 'text-forest after:scale-x-100'
                            : 'text-anthracite/80 after:scale-x-0 hover:text-forest hover:after:scale-x-100'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={`-mr-2 flex items-center justify-self-end ${clear ? '[&_.icon-btn]:text-ivory [&_.icon-btn:hover]:bg-ivory/10' : ''}`}>
            {/* Pays de présence, à droite avant les icônes */}
            <Flags codes={countries} className="mr-1 hidden min-[380px]:flex sm:mr-2" />
            {/* Mobile : la recherche est dans le menu */}
            <button type="button" onClick={() => setSearch(true)} className="icon-btn hidden lg:inline-flex" aria-label="Rechercher un produit">
              <Search className="h-5 w-5" strokeWidth={1.6} />
            </button>
            <Link href="/compte" className="icon-btn hidden lg:inline-flex" aria-label="Mon compte et suivi de commande">
              <User className="h-5 w-5" strokeWidth={1.6} />
            </Link>
            <CartButton count={count} />
          </div>
        </div>
      </header>

      {/* Recherche */}
      {search && (
        <div className="fixed inset-0 z-[70] bg-anthracite/40" onClick={() => setSearch(false)}>
          <div role="dialog" aria-modal="true" aria-label="Recherche" className="bg-ivory shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitSearch} className="container-site flex items-center gap-3 py-4">
              <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              <label htmlFor="site-search" className="sr-only">
                Rechercher un produit
              </label>
              <input ref={searchInput} id="site-search" name="q" type="search" placeholder="Rechercher un produit…" className="field border-0! bg-transparent! px-0! text-lg focus:outline-none!" />
              <button type="button" onClick={() => setSearch(false)} className="icon-btn shrink-0" aria-label="Fermer la recherche">
                <X className="h-5 w-5" strokeWidth={1.6} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu mobile plein écran (structure de l'ancienne interface, textes fins de la refonte) */}
      <AnimatePresence>
        {menu && (
          <m.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-[linear-gradient(170deg,#f6f3ec_0%,#efebe1_55%,#e7e3d5_100%)] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Voile végétal discret */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--sage)_26%,transparent),transparent)] blur-2xl" />
            <div className="pointer-events-none absolute right-0 bottom-40 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--sage)_12%,transparent),transparent)] blur-2xl" />

            <div className="relative flex items-center justify-between gap-3 px-5 pt-6 pb-4">
              <Link href="/" onClick={() => setMenu(false)} className="flex min-w-0 items-center gap-3" aria-label="EL ROPHE — accueil">
                <SmartImage src={iconUrl} alt="" width={1024} height={984} sizes="64px" className="h-14 w-auto shrink-0" />
                <Wordmark size="lg" />
              </Link>
              <button
                type="button"
                onClick={() => setMenu(false)}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-champagne bg-white text-anthracite transition-transform active:scale-95"
                aria-label="Fermer le menu"
                autoFocus
              >
                <X className="h-6 w-6" strokeWidth={1.4} />
              </button>
            </div>

            <form
              role="search"
              onSubmit={(e) => {
                setMenu(false);
                submitSearch(e);
              }}
              className="relative px-5 pt-2"
            >
              <label htmlFor="menu-search" className="sr-only">
                Rechercher un produit
              </label>
              <Search className="pointer-events-none absolute top-1/2 left-9 mt-1 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input id="menu-search" name="q" type="search" placeholder="Rechercher un produit…" className="field rounded-full! border-white/80! bg-white/80! pl-12!" />
            </form>

            <nav aria-label="Navigation mobile" className="relative flex flex-1 flex-col px-4 pt-4">
              {navLinks.map(({ href, label, Icon }, i) => {
                const active = isActive(pathname, href);
                return (
                  <m.div key={href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link
                      href={href}
                      onClick={() => setMenu(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`group flex items-center gap-4 rounded-xl border px-3 py-3 transition-colors ${
                        active ? 'border-white/80 bg-white/70' : 'border-transparent'
                      }`}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne/50 bg-white/80 text-[#a58c62]">
                        <Icon className="h-[21px] w-[21px]" strokeWidth={1.4} aria-hidden="true" />
                      </span>
                      <span className="flex-1 font-serif text-[1.55rem] leading-tight font-normal text-forest">{label}</span>
                      <ChevronRight className="h-5 w-5 text-champagne transition-transform group-hover:translate-x-0.5" strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                    {i < navLinks.length - 1 && <div className="mx-3 my-1 h-px bg-[color-mix(in_srgb,var(--champagne)_30%,transparent)]" />}
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
                  onClick={() => setMenu(false)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-white/80 bg-white/80 py-4 text-[14px] text-anthracite transition-transform active:scale-[0.97]"
                >
                  <Icon className="h-6 w-6 text-forest" strokeWidth={1.4} />
                  {label}
                </Link>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Barre d'onglets (mobile) : navigation à une main */}
      <nav aria-label="Raccourcis" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ivory/97 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        <ul className="grid grid-cols-4">
          {[
            { href: '/', label: 'Accueil', Icon: House },
            { href: '/boutique', label: 'Produits', Icon: Package },
            { href: '/panier', label: 'Panier', Icon: ShoppingBag },
            { href: '/compte', label: 'Compte', Icon: User },
          ].map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex flex-col items-center gap-1 py-2.5 text-[12px] ${active ? 'text-forest' : 'text-muted'}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 1.9 : 1.5} aria-hidden="true" />
                  {label}
                  {href === '/panier' && count > 0 && (
                    <span className="absolute top-1 left-1/2 ml-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[10px] font-semibold text-forest">
                      {count}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
