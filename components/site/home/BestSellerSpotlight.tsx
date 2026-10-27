import Link from 'next/link';
import { ArrowRight, Award, Check } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import { formatPrice } from '@/lib/format';
import { landingOffers, offerSoldOut, SPECIAL_PATH } from '@/lib/landing';
import type { Product } from '@/lib/types';

/** Carte « Notre best-seller » sous la sélection de l'accueil : mène à la page /best-seller (contenu : Pilotage › Produit spécial) */
export default function BestSellerSpotlight({ product, currency }: { product: Product; currency: string }) {
  const landing = product.landing;
  const offers = landingOffers(product);
  const available = offers.filter((o) => !offerSoldOut(product, o));
  const fromPrice = Math.min(...(available.length ? available : offers).map((o) => o.price));
  const text = landing?.hero_text || product.tagline || product.description;
  const points = (landing?.trust?.length ? landing.trust : product.highlights).slice(0, 3);

  return (
    <article className="mt-10 grid overflow-hidden rounded-xl bg-forest text-ivory md:grid-cols-2">
      <Link href={SPECIAL_PATH} className="group relative block aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[380px]" aria-label={`Découvrir ${product.name}`}>
        <SmartImage
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="flex flex-col justify-center p-6 sm:p-10">
        <p className="inline-flex items-center gap-2 self-start rounded-full border border-champagne/60 px-3 py-1 text-[12px] font-semibold tracking-[0.14em] text-champagne uppercase">
          <Award className="h-3.5 w-3.5" aria-hidden="true" />
          Notre best-seller
        </p>
        <h3 className="title-lg mt-4 text-[clamp(1.9rem,4vw,2.6rem)] text-ivory!">{product.name}</h3>
        {text && <p className="mt-3 text-[16px] leading-relaxed text-ivory/80">{text}</p>}
        {points.length > 0 && (
          <ul className="mt-5 space-y-2">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 text-[15px] text-ivory/90">
                <Check className="h-4 w-4 shrink-0 text-champagne" strokeWidth={2.2} aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
          {!product.coming_soon && (
            <p className="font-serif text-[1.8rem] leading-none font-semibold">
              {offers.length > 1 && <span className="mr-1.5 text-[0.6em] font-normal text-ivory/70">dès</span>}
              {formatPrice(fromPrice, currency)}
            </p>
          )}
          <Link href={SPECIAL_PATH} className="btn btn-champagne">
            Découvrir le best-seller
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
