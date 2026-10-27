import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { FacebookPixel } from '@/components/FacebookPixel';
import { getSettings } from '@/lib/data';
import './globals.css';

// Charte : titres en Cormorant Garamond, textes et interface en Inter
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();
  return {
    title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
    description: brand.footer_text,
    openGraph: { siteName: brand.name, locale: 'fr_FR', type: 'website' },
  };
}

export const viewport: Viewport = { themeColor: '#17372C' };

// Couleurs fixées par la charte graphique (globals.css) : le thème du pilotage n'est plus injecté
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <FacebookPixel />
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
