'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ExternalLink, HeartPulse, KeyRound, LayoutDashboard, Leaf, LogOut, Mail, Menu, MessageSquareQuote, Palette, ShoppingCart, Store, Users, X,
  type LucideIcon,
} from 'lucide-react';
import { db, TABLES } from '@/lib/admin';

interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

// Regroupé comme la navbar verticale d'atelierzo
const menuSections: { label: string; items: MenuItem[] }[] = [
  { label: 'Pilotage', items: [{ name: 'Tableau de bord', path: '/pilotage', icon: LayoutDashboard }] },
  {
    label: 'Ventes',
    items: [
      { name: 'Commandes', path: '/pilotage/orders', icon: ShoppingCart },
      { name: 'Clients', path: '/pilotage/clients', icon: Users },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { name: 'Boutique', path: '/pilotage/boutique', icon: Store },
      { name: 'Solutions', path: '/pilotage/solutions', icon: HeartPulse },
      { name: 'Ingrédients', path: '/pilotage/ingredients', icon: Leaf },
    ],
  },
  {
    label: 'Site',
    items: [
      { name: 'Personnalisation', path: '/pilotage/personnalisation', icon: Palette },
      { name: 'Avis clients', path: '/pilotage/testimonials', icon: MessageSquareQuote },
      { name: 'Newsletter', path: '/pilotage/newsletter', icon: Mail },
      { name: "Code d'accès", path: '/pilotage/acces', icon: KeyRound },
    ],
  },
];

const allItems = menuSections.flatMap((s) => s.items);

const isItemActive = (pathname: string | null, path: string) =>
  pathname === path || (path !== '/pilotage' && !!pathname?.startsWith(path));

export default function AdminNavbar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { count } = await db().from(TABLES.orders).select('id', { count: 'exact', head: true }).eq('status', 'pending');
      setPendingOrders(count ?? 0);
    };
    load();
    // Rafraîchi toutes les 30 secondes
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (path: string) => {
    router.push(path);
    setSidebarOpen(false);
  };

  const current = allItems.find((item) => isItemActive(pathname, item.path));

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--pz-border)] shrink-0">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[var(--pz-900)] text-[#B6E15A]">
          <Leaf className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-[var(--pz-text)] leading-tight truncate tracking-[0.2em]" style={{ fontFamily: 'var(--font-ubuntu)' }}>
            ELROPHE
          </p>
          <p className="pz-eyebrow" style={{ fontSize: '0.5625rem' }}>Pilotage</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="pz-nav-label">{section.label}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isItemActive(pathname, item.path);
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className={`pz-nav-item ${active ? 'is-active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.4 : 2} />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.path === '/pilotage/orders' && (
                      <span className={`pz-nav-count ${pendingOrders > 0 ? 'is-hot' : ''}`} title="Commandes en attente">
                        {pendingOrders}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-[var(--pz-border)] shrink-0">
        <button onClick={onLogout} className="pz-nav-item">
          <LogOut className="h-4 w-4" />
          <span>Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop : barre latérale fixe (.pz réserve sa largeur) */}
      <aside className="pz-sidebar hidden lg:flex fixed inset-y-0 left-0 z-40">{sidebarContent}</aside>

      {/* Barre du haut */}
      <header className="pz-topbar">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => setSidebarOpen(true)} className="pz-btn pz-btn-ghost lg:hidden px-2!" aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 text-xs font-semibold min-w-0">
            <span className="text-[var(--pz-muted)] hidden sm:inline">Pilotage</span>
            {current && current.path !== '/pilotage' && (
              <>
                <span className="text-[var(--pz-muted)] hidden sm:inline">/</span>
                <span className="text-[var(--pz-text)] font-extrabold truncate">{current.name}</span>
              </>
            )}
            {(!current || current.path === '/pilotage') && <span className="text-[var(--pz-text)] font-extrabold sm:hidden">Tableau de bord</span>}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={() => router.push('/pilotage/orders')} className="pz-btn pz-btn-ghost relative px-2!" title="Commandes en attente">
            <ShoppingCart className="h-4 w-4" />
            {pendingOrders > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--pz-500)] rounded-full animate-pulse" />}
          </button>
          <a href="/" target="_blank" rel="noopener noreferrer" className="pz-btn pz-btn-outline" title="Voir le site">
            <ExternalLink className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Voir le site</span>
          </a>
        </div>
      </header>

      {/* Mobile : barre latérale coulissante */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-60 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35, mass: 0.8 }}
              className="pz-sidebar fixed inset-y-0 left-0 z-60 shadow-2xl lg:hidden"
            >
              <button onClick={() => setSidebarOpen(false)} className="pz-btn pz-btn-ghost absolute top-3 right-2 px-2!" aria-label="Fermer le menu">
                <X className="h-4 w-4" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
