import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { FacebookPixel } from '@/components/FacebookPixel';
import { getSettings } from '@/lib/data';
import { defaultSettings } from '@/data/site';
import { themeToCss } from '@/lib/settings';
import './globals.css';

// Charte : titres en Cormorant Garamond, textes et interface en Inter
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

// Adresse publique du site : liens absolus des balises de partage
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.elrophecare.com';

/** Référencement : titre et description modifiables dans Pilotage › Personnalisation › Marque */
export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();
  const title = brand.seo_title || 'EL ROPHE | Produits Naturels Haut de Gamme';
  const description = brand.seo_description || defaultSettings.brand.seo_description;
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: '%s | EL ROPHE' },
    description,
    openGraph: { siteName: 'EL ROPHE', title, description, locale: 'fr_FR', type: 'website', url: '/' },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/** Couleur de la barre du navigateur mobile : vert forêt de la palette */
export async function generateViewport(): Promise<Viewport> {
  const { theme } = await getSettings();
  return { themeColor: theme.forest };
}

/** Palette de Pilotage › Personnalisation › Apparence, par-dessus les valeurs de globals.css */
async function ThemeStyle() {
  const { theme } = await getSettings();
  return <style>{themeToCss(theme)}</style>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <ThemeStyle />
        <FacebookPixel />
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
