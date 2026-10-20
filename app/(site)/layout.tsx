import Footer from '@/components/site/Footer';
import Navbar from '@/components/site/Navbar';
import Providers from '@/components/site/Providers';
import { getCategories, getSettings } from '@/lib/data';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  return (
    <Providers site={{ brandName: settings.brand.name, currency: settings.shop.currency }}>
      <div className="site">
        <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-forest focus:px-4 focus:py-2 focus:text-white">
          Aller au contenu
        </a>
        <Navbar announcement="El Rophe, PREMIUM NATURAL PRODUCTS" />
        <main id="contenu">{children}</main>
        <Footer brand={settings.brand} categories={categories} />
      </div>
    </Providers>
  );
}
