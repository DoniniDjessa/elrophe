'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { ArrowRight, LayoutGrid, Star } from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { BlogPost, BlogSettings } from '@/lib/types';
import { ArrowBubble, BlogIconView, categoryOf, PostMeta, PostRow } from './blog';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const LATEST = 3;

/** Catégories, article à la une et derniers articles ; filtre et recherche conservés dans l'URL */
export default function BlogView({ posts, settings }: { posts: BlogPost[]; settings: BlogSettings }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = params.get('categorie') ?? '';
  const query = params.get('q') ?? '';
  const all = params.has('tous');
  const filtering = !!category || !!query;

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Catégories affichées : celles qui ont au moins un article
  const categories = settings.categories.filter((c) => c.name.trim() && posts.some((p) => p.category_slug === c.slug));

  const results = useMemo(() => {
    let rows = posts;
    if (category) rows = rows.filter((p) => p.category_slug === category);
    if (query) {
      const q = normalize(query);
      rows = rows.filter((p) => normalize(`${p.title} ${p.excerpt} ${p.content}`).includes(q));
    }
    return rows;
  }, [posts, category, query]);

  const featured = posts.find((p) => p.is_featured) ?? posts[0];
  const rest = posts.filter((p) => p !== featured);
  const latest = all ? rest : rest.slice(0, LATEST);
  const featuredCategory = featured && categoryOf(settings.categories, featured.category_slug);

  return (
    <div className="container-site py-6 lg:py-10">
      {categories.length > 0 && (
        <div className="no-scrollbar -mx-3 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Catégories d’articles">
          {[{ slug: '', name: settings.all_label || 'Tous', icon: null }, ...categories].map((c) => (
            <button key={c.slug || 'all'} type="button" aria-pressed={category === c.slug} onClick={() => setParam('categorie', c.slug)} className="chip inline-flex items-center gap-2 bg-ivory!">
              {c.icon ? <BlogIconView icon={c.icon} className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />}
              {c.name}
            </button>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="py-20 text-center text-muted">Les premiers articles arrivent bientôt.</p>
      ) : filtering ? (
        <section aria-live="polite" className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)]">
              {results.length} article{results.length > 1 ? 's' : ''}
              {query && <span className="text-muted"> pour « {query} »</span>}
            </h2>
            <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="text-[14px] text-forest underline underline-offset-4">
              Effacer les filtres
            </button>
          </div>
          <ul className="mt-6 space-y-5">
            {results.map((p) => (
              <li key={p.id}>
                <PostRow post={p} category={categoryOf(settings.categories, p.category_slug)} />
              </li>
            ))}
          </ul>
          {results.length === 0 && <p className="py-12 text-center text-muted">Aucun article ne correspond à votre recherche.</p>}
        </section>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group mt-6 block overflow-hidden rounded-xl border border-line bg-white shadow-[var(--shadow-soft)] md:grid md:grid-cols-[1.15fr_1fr]">
              <span className="relative block aspect-[16/8] bg-ivory md:aspect-auto md:min-h-[340px]">
                {featured.cover_url && (
                  <SmartImage src={featured.cover_url} alt={featured.cover_alt} fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                )}
                {settings.featured_label && (
                  <span className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-champagne px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] text-forest uppercase">
                    <Star className="h-3.5 w-3.5 fill-forest" aria-hidden="true" />
                    {settings.featured_label}
                  </span>
                )}
              </span>
              <span className="flex flex-col justify-center p-5 sm:p-8">
                {featuredCategory && <span className="text-[11px] font-semibold tracking-[0.2em] text-anthracite uppercase">{featuredCategory.name}</span>}
                <span className="mt-2 block font-serif text-[clamp(1.6rem,3.6vw,2.2rem)] leading-tight text-anthracite">{featured.title}</span>
                {featured.excerpt && <span className="mt-3 block text-[15px] leading-relaxed text-muted">{featured.excerpt}</span>}
                <span className="mt-5 flex items-center justify-between gap-3">
                  <PostMeta post={featured} showViews={settings.show_views} />
                  <ArrowBubble />
                </span>
              </span>
            </Link>
          )}

          {latest.length > 0 && (
            <section aria-labelledby="latest-title" className="mt-12">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="latest-title" className="text-[clamp(1.6rem,3.4vw,2.2rem)]">
                  {settings.latest_title}
                </h2>
                {!all && rest.length > LATEST && settings.see_all_label && (
                  <button type="button" onClick={() => setParam('tous', '1')} className="inline-flex shrink-0 items-center gap-2 text-[14px] font-medium text-anthracite hover:text-forest">
                    {settings.see_all_label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <ul className="mt-6 space-y-5">
                {latest.map((p) => (
                  <li key={p.id}>
                    <PostRow post={p} category={categoryOf(settings.categories, p.category_slug)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
