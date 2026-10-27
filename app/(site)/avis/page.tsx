import type { Metadata } from 'next';
import { Quote } from 'lucide-react';
import HelpBanner from '@/components/site/HelpBanner';
import PageHeader from '@/components/site/PageHeader';
import { RatingStars } from '@/components/site/home/Testimonials';
import { getTestimonials } from '@/lib/data';

export const metadata: Metadata = { title: 'Avis clients', description: 'Les retours de nos clients sur les produits EL ROPHE.' };

/** Avis publiés depuis Pilotage › Avis clients : uniquement des retours authentiques, sans portrait artificiel */
export default async function AvisPage() {
  const testimonials = await getTestimonials();
  return (
    <>
      <PageHeader kicker="Avis clients" title="Ils partagent leur expérience." crumbs={[{ label: 'Avis clients' }]} />
      <section className="container-site pb-16">
        {testimonials.length === 0 ? (
          <p className="text-[16px] text-muted">Les premiers avis de nos clients seront publiés ici.</p>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id} className="card flex flex-col p-6">
                <div className="flex items-center justify-between">
                  <Quote className="h-6 w-6 text-champagne" strokeWidth={1.4} aria-hidden="true" />
                  <RatingStars rating={t.rating} />
                </div>
                <blockquote className="mt-4 flex-1 font-serif text-[1.3rem] leading-snug">{t.text.replace(/^«\s*|\s*»$/g, '')}</blockquote>
                <p className="mt-5 flex items-center gap-3 border-t border-line pt-4 text-[15px]">
                  <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full bg-ivory font-serif text-lg text-forest">
                    {t.name.trim().charAt(0)}
                  </span>
                  <span>
                    <span className="block font-medium">{t.name}</span>
                    {(t.location || t.product_name) && (
                      <span className="block text-[13px] text-muted">{[t.location?.trim(), t.product_name].filter(Boolean).join(' · ')}</span>
                    )}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <HelpBanner />
    </>
  );
}
