import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import Providers from '@/components/site/Providers';
import { getCategories, getProducts, getSettings } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, allCategories, products] = await Promise.all([getSettings(), getCategories(), getProducts()]);
  // Uniquement les catégories qui ont des produits en vente
  const categories = allCategories.filter((c) => products.some((p) => p.category_slug === c.slug));
  return (
    <Providers site={{ brandName: settings.brand.name, currency: settings.shop.currency }}>
      {/* Mobile : marge basse pour la barre d'onglets */}
      <div className="site pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-forest focus:px-4 focus:py-2 focus:text-white">
          Aller au contenu
        </a>
        <Navbar iconUrl={settings.brand.icon_url} countries={settings.brand.countries} transparentOnHome={settings.hero.transparent_nav} />
        <main id="contenu">{children}</main>
        <Footer brand={settings.brand} categories={categories} />
      </div>
    </Providers>
  );
}
