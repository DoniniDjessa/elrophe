import Link from 'next/link';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { BrandSettings, Category } from '@/lib/types';
import Brand from './Brand';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from './Icons';

/** Pied de page : uniquement les coordonnées et réseaux renseignés dans Pilotage › Personnalisation */
export default function Footer({ brand, categories }: { brand: BrandSettings; categories: Category[] }) {
  const wa = brand.whatsapp.replace(/\D/g, '');
  const socials = [
    { href: wa ? `https://wa.me/${wa}` : '', label: 'WhatsApp', Icon: WhatsappIcon },
    { href: brand.socials.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: brand.socials.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: brand.socials.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: brand.socials.youtube, label: 'YouTube', Icon: YoutubeIcon },
  ].filter((s) => s.href);

  const columns = [
    {
      title: 'Catalogue',
      links: [{ href: '/boutique', label: 'Nos produits' }, ...categories.slice(0, 3).map((c) => ({ href: `/boutique?categorie=${c.slug}`, label: c.name }))],
    },
    {
      title: 'Notre maison',
      links: [
        { href: '/notre-maison', label: 'Notre histoire' },
        { href: '/engagements', label: 'Nos engagements' },
        { href: '/avis', label: 'Avis clients' },
      ],
    },
    {
      title: 'Service client',
      links: [
        { href: '/faq', label: 'Questions fréquentes' },
        { href: '/conditions-generales-de-vente#livraison', label: 'Livraison et retours' },
        { href: '/compte', label: 'Suivi de commande' },
        { href: '/contact', label: 'Nous contacter' },
      ],
    },
    {
      title: 'Informations légales',
      links: [
        { href: '/conditions-generales-de-vente', label: 'Conditions générales de vente' },
        { href: '/mentions-legales', label: 'Mentions légales' },
        { href: '/politique-de-confidentialite', label: 'Politique de confidentialité' },
      ],
    },
  ];

  return (
    <footer className="border-t border-ivory/10 bg-forest text-ivory/80">
      <div className="container-site grid gap-10 py-14 lg:grid-cols-[1.2fr_repeat(4,1fr)_1.3fr] lg:gap-8 lg:py-16">
        <div>
          <Brand iconUrl={brand.icon_url} tone="light" />
          {brand.footer_quote.trim() && (
            <p className="mt-5 font-serif text-lg leading-snug text-ivory italic">
              {brand.footer_quote.split('\n').map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </p>
          )}
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/20 transition-colors hover:border-champagne hover:text-champagne">
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4 lg:gap-6">
          {columns.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans! text-[13px] font-semibold! tracking-[0.12em] text-ivory! uppercase">{col.title}</h2>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-champagne">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <h2 className="font-sans! text-[13px] font-semibold! tracking-[0.12em] text-ivory! uppercase">Nous contacter</h2>
          <ul className="mt-4 space-y-3 text-[14px]">
            {brand.email && (
              <li>
                <a href={`mailto:${brand.email}`} className="flex items-start gap-2.5 hover:text-champagne">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                  {brand.email}
                </a>
              </li>
            )}
            {brand.phone && (
              <li>
                <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="flex items-start gap-2.5 hover:text-champagne">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                  {brand.phone}
                </a>
              </li>
            )}
            {brand.address && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                {brand.address}
              </li>
            )}
            {brand.hours && (
              <li className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden="true" />
                {brand.hours}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container-site flex flex-col gap-2 py-5 text-[13px] text-ivory/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© EL ROPHE. Tous droits réservés. Les compléments alimentaires ne se substituent pas à une alimentation variée et équilibrée.</p>
          <p className="shrink-0 font-serif text-[15px] italic">La nature nous inspire. La qualité nous distingue.</p>
        </div>
      </div>
    </footer>
  );
}
