import Link from 'next/link';
import SmartImage from '@/components/ui/SmartImage';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { BrandSettings, Category } from '@/lib/types';
import { FacebookIcon, InstagramIcon, TiktokIcon, WhatsappIcon, YoutubeIcon } from './Icons';

export default function Footer({ brand, categories }: { brand: BrandSettings; categories: Category[] }) {
  const socials = [
    { href: brand.socials.instagram, label: 'Instagram', Icon: InstagramIcon },
    { href: brand.socials.facebook, label: 'Facebook', Icon: FacebookIcon },
    { href: brand.socials.tiktok, label: 'TikTok', Icon: TiktokIcon },
    { href: brand.socials.youtube, label: 'YouTube', Icon: YoutubeIcon },
    { href: brand.whatsapp ? `https://wa.me/${brand.whatsapp.replace(/\D/g, '')}` : '', label: 'WhatsApp', Icon: WhatsappIcon },
  ].filter((s) => s.href);

  const columns = [
    {
      title: 'Boutique',
      links: [
        { href: '/boutique', label: 'Tous les produits' },
        ...categories.slice(0, 5).map((c) => ({ href: `/boutique?categorie=${c.slug}`, label: c.name })),
      ],
    },
    {
      title: 'Découvrir',
      links: [
        { href: '/boutique?collection=meilleures-ventes', label: 'Meilleures ventes' },
        { href: '/boutique?collection=nouveautes', label: 'Nouveautés' },
        { href: '/#rituel', label: 'Rituels bien-être' },
        { href: '/a-propos', label: 'Notre histoire' },
      ],
    },
    {
      title: 'Aide',
      links: [
        { href: '/compte', label: 'Suivre ma commande' },
        { href: '/panier', label: 'Mon panier' },
        { href: '/favoris', label: 'Mes favoris' },
        { href: '/contact', label: 'Nous contacter' },
      ],
    },
  ];

  return (
    <footer className="mt-10 border-t border-line bg-[color-mix(in_srgb,var(--bg-sage)_90%,var(--forest))]">
      <div className="mx-auto max-w-[1440px] px-4 pt-16 pb-8 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex" aria-label={`${brand.name} — accueil`}>
              <SmartImage src={brand.logo_url} alt={brand.name} width={1240} height={1288} sizes="120px" className="h-28 w-auto" />
            </Link>
            <p className="mt-5 text-[15px] leading-relaxed text-ink/85">{brand.footer_text}</p>
            {socials.length > 0 && (
              <ul className="mt-6 flex gap-2" aria-label="Réseaux sociaux">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="icon-btn glass">
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-[1fr_1fr_1fr_1.35fr]">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-[11px] font-semibold tracking-[0.24em] text-ink uppercase">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-[14px] text-ink/85 transition-colors hover:text-ink">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div>
              <h2 className="text-[11px] font-semibold tracking-[0.24em] text-ink uppercase">Contact</h2>
              <ul className="mt-4 space-y-3 text-[14px] text-ink/85">
                {brand.phone && (
                  <li className="flex gap-2">
                    <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="hover:text-ink">{brand.phone}</a>
                  </li>
                )}
                {brand.email && (
                  <li className="flex gap-2">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <a href={`mailto:${brand.email}`} className="[overflow-wrap:anywhere] hover:text-ink">{brand.email}</a>
                  </li>
                )}
                {brand.address && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{brand.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-ink/85 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {brand.name}. Tous droits réservés. Ces produits ne se substituent pas à une alimentation variée et équilibrée.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link href="/mentions-legales" className="hover:text-ink">Mentions légales</Link></li>
            <li><Link href="/mentions-legales#cgv" className="hover:text-ink">CGV</Link></li>
            <li><Link href="/mentions-legales#confidentialite" className="hover:text-ink">Confidentialité</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
