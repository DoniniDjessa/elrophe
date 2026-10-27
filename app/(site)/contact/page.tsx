import type { Metadata } from 'next';
import Image from 'next/image';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { WhatsappIcon } from '@/components/site/Icons';
import { getSettings } from '@/lib/data';

export const metadata: Metadata = { title: 'Contact', description: 'Contactez EL ROPHE : WhatsApp, téléphone, e-mail.' };

/** Coordonnées : uniquement celles renseignées dans Pilotage › Personnalisation */
export default async function ContactPage() {
  const { brand } = await getSettings();
  const wa = brand.whatsapp.replace(/\D/g, '');
  const place = brand.address.replace(/^Représentation\s*:\s*/i, '');
  const cards = [
    wa && { Icon: WhatsappIcon, title: 'WhatsApp', value: brand.whatsapp, href: `https://wa.me/${wa}` },
    brand.phone && { Icon: Phone, title: 'Téléphone', value: brand.phone, href: `tel:${brand.phone.replace(/\s/g, '')}` },
    brand.email && { Icon: Mail, title: 'E-mail', value: brand.email, href: `mailto:${brand.email}` },
    brand.address && { Icon: MapPin, title: 'Notre localisation', value: brand.address },
    brand.hours && { Icon: Clock, title: 'Horaires', value: brand.hours },
  ].filter(Boolean) as { Icon: React.ComponentType<{ className?: string }>; title: string; value: string; href?: string }[];

  return (
    <section aria-labelledby="contact-title" className="bg-forest text-ivory">
      <div className="container-site grid gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <p className="kicker text-champagne!">
            <span className="h-px w-8 bg-champagne" aria-hidden="true" />
            Contact
          </p>
          <h1 id="contact-title" className="title-xl mt-3 text-[clamp(2.4rem,6vw,3.6rem)] text-ivory!">
            Contactez-nous
          </h1>
          <p className="mt-3 text-[17px] text-ivory/80">Nous sommes à votre écoute pour toute question sur un produit ou une commande.</p>

          <ul className="mt-8 space-y-3">
            {cards.map(({ Icon, title, value, href }) => {
              const body = (
                <>
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne/60 text-champagne">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium text-ivory">{title}</span>
                    <span className="block text-[15px] break-words text-ivory/75">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={title}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 rounded-lg border border-ivory/15 p-4 transition-colors hover:border-champagne/60"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-lg border border-ivory/15 p-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:flex-1">
            <Image src="/images/refonte/contact-botanique.png" alt="Plantes fraîches : moringa, gingembre, menthe" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
          {place && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-champagne w-full"
            >
              <MapPin className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" />
              Voir sur Google Maps
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
