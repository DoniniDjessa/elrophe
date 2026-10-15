import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { WhatsappIcon } from '@/components/site/Icons';
import PageHeader from '@/components/site/PageHeader';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Contact' };

export default async function ContactPage() {
  const { brand } = await getSettings();
  const wa = brand.whatsapp.replace(/\D/g, '');
  const cards = [
    brand.phone && { Icon: Phone, title: 'Téléphone', value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, '')}` },
    wa && { Icon: WhatsappIcon, title: 'WhatsApp', value: 'Écrivez-nous', href: `https://wa.me/${wa}` },
    brand.email && { Icon: Mail, title: 'E-mail', value: brand.email, href: `mailto:${brand.email}` },
    brand.address && { Icon: MapPin, title: 'Adresse', value: brand.address },
    brand.hours && { Icon: Clock, title: 'Horaires', value: brand.hours },
  ].filter(Boolean) as { Icon: React.ComponentType<{ className?: string }>; title: string; value: string; href?: string }[];

  return (
    <>
      <PageHeader eyebrow="Nous" accent="contacter" title="Parlons de votre" script="bien-être" text="Une question sur un produit, une commande ou un conseil personnalisé ? Notre équipe vous répond du lundi au samedi." crumbs={[{ label: 'Contact' }]} />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-10">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ Icon, title, value, href }) => (
            <li key={title} className="card flex items-start gap-4 p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-forest/25 text-forest">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[11px] font-semibold tracking-[0.2em] text-ink-muted uppercase">{title}</span>
                {href ? (
                  <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="mt-1 block font-display text-lg font-bold break-all hover:text-leaf">{value}</a>
                ) : (
                  <span className="mt-1 block font-display text-lg font-bold">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
