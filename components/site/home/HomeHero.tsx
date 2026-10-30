import Link from 'next/link';
import { getImageProps } from 'next/image';
import { ArrowRight } from 'lucide-react';
import type { HeroSettings } from '@/lib/types';

/** Bannière d'accueil : textes et photos modifiables dans Pilotage › Personnalisation › Accueil */
export default function HomeHero({ hero }: { hero: HeroSettings }) {
  const underNav = hero.transparent_nav;
  const common = { alt: hero.photo_alt, sizes: '100vw' };
  // Une seule photo renseignée : elle sert sur ordinateur comme sur mobile
  const desktopSrc = hero.photo_desktop || hero.photo_mobile;
  const mobileSrc = hero.photo_mobile || hero.photo_desktop;
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: desktopSrc, width: 1344, height: 768, quality: 75 });
  const { props: { srcSet: mobile, ...img } } = getImageProps({ ...common, src: mobileSrc, width: 864, height: 1184, quality: 75 });

  return (
    <section aria-labelledby="hero-title" className="relative flex flex-col overflow-hidden bg-forest text-ivory">
      {/* Mobile : texte puis photo ; ordinateur : texte posé sur la photo */}
      {/* underNav : la barre de navigation transparente est posée par-dessus, on réserve sa hauteur */}
      <div
        className={`container-site relative z-10 pb-2 md:flex md:min-h-[540px] md:items-center md:pb-20 lg:min-h-[600px] ${
          underNav ? 'pt-[6.5rem] md:pt-36 lg:min-h-[680px]' : 'pt-10 md:pt-20'
        }`}
      >
        <div className="rise max-w-[640px]">
          <p className="kicker text-champagne!">
            <span className="h-px w-8 bg-champagne" aria-hidden="true" />
            {hero.kicker}
          </p>
          <h1 id="hero-title" className="title-xl mt-5 text-[clamp(2.5rem,7.5vw,4.4rem)] text-ivory!">
            {hero.heading}
            {hero.heading_accent && <span className="block text-champagne">{hero.heading_accent}</span>}
          </h1>
          {hero.intro && <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ivory/85 md:text-[17px]">{hero.intro}</p>}
          {hero.button_label && (
            <Link href={hero.button_href || '/boutique'} className="btn btn-champagne mt-8">
              {hero.button_label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      <div className="relative -mt-14 aspect-[864/820] md:absolute md:inset-0 md:mt-0 md:aspect-auto">
        <picture>
          <source media="(min-width: 768px)" srcSet={desktop} />
          <source srcSet={mobile} />
          {/* LCP : chargé en priorité, une seule des deux images est téléchargée */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...img} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-bottom md:object-right" />
        </picture>
        {/* Mobile : le haut de la photo se fond dans le vert du texte */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2/5 bg-[linear-gradient(180deg,var(--forest)_0%,color-mix(in_srgb,var(--forest)_75%,transparent)_45%,transparent_100%)] md:hidden" />
      </div>
      {/* Mobile : fondu du haut de la photo dans le vert ; ordinateur : voile côté texte */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,color-mix(in_srgb,var(--forest)_90%,transparent)_0%,color-mix(in_srgb,var(--forest)_60%,transparent)_42%,transparent_65%)] max-md:hidden" />
    </section>
  );
}
