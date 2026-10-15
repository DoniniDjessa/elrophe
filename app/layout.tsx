import type { Metadata, Viewport } from 'next';
import { Allura, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { getSettings } from '@/lib/data';
import { themeToCss } from '@/lib/settings';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-jakarta', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const allura = Allura({ subsets: ['latin'], weight: '400', variable: '--font-allura', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getSettings();
  return {
    title: { default: `${brand.name} — ${brand.tagline}`, template: `%s · ${brand.name}` },
    description: brand.footer_text,
    openGraph: { siteName: brand.name, locale: 'fr_FR', type: 'website' },
  };
}

export const viewport: Viewport = { themeColor: '#C9CBB9' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = await getSettings();
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable} ${allura.variable}`}>
      <head>
        <style id="elrophe-theme" dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
      </head>
      <body>
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
