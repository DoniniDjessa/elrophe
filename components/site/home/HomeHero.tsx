import Link from 'next/link';
import { getImageProps } from 'next/image';
import { ArrowRight } from 'lucide-react';

/** Bannière d'accueil : Pylor Health Sulfomas dans son décor végétal, signature de la maison */
export default function HomeHero({ underNav = false }: { underNav?: boolean }) {
  const common = { alt: 'Pylor Health Sulfomas, flacon de 120 capsules, entouré de feuillages, de fleurs de jasmin et de gingembre', sizes: '100vw' };
  const { props: { srcSet: desktop } } = getImageProps({ ...common, src: '/images/refonte/hero-desktop.png', width: 1344, height: 768, quality: 75 });
  const { props: { srcSet: mobile, ...img } } = getImageProps({ ...common, src: '/images/refonte/hero-mobile.png', width: 864, height: 1184, quality: 75 });

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
            EL ROPHE
          </p>
          <h1 id="hero-title" className="title-xl mt-5 text-[clamp(2.5rem,7.5vw,4.4rem)] text-ivory!">
            La nature nous inspire.
            <span className="block text-champagne">La qualité nous distingue.</span>
          </h1>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ivory/85 md:text-[17px]">
            Une sélection exigeante de produits naturels haut de gamme, où tradition botanique et innovation se rencontrent.
          </p>
          <Link href="/boutique" className="btn btn-champagne mt-8">
            Découvrir nos produits
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
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
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2/5 bg-[linear-gradient(180deg,#17372c_0%,rgba(23,55,44,0.75)_45%,transparent_100%)] md:hidden" />
      </div>
      {/* Mobile : fondu du haut de la photo dans le vert ; ordinateur : voile côté texte */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[linear-gradient(90deg,rgba(23,55,44,0.9)_0%,rgba(23,55,44,0.6)_42%,transparent_65%)] max-md:hidden" />
    </section>
  );
}
