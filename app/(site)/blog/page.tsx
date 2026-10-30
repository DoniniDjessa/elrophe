import type { Metadata } from 'next';
import { Suspense } from 'react';
import BlogNewsletter from '@/components/site/blog/BlogNewsletter';
import BlogSearch, { SearchForm } from '@/components/site/blog/BlogSearch';
import BlogView from '@/components/site/blog/BlogView';
import { BlogTrust } from '@/components/site/blog/blog';
import SmartImage from '@/components/ui/SmartImage';
import { getBlogPosts, getSettings } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const { blog } = await getSettings();
  return { title: 'Blog', description: blog.hero.text };
}

/** Blog : contenu des articles dans Pilotage › Blog, textes et visuels de la page dans Pilotage › Blog › Page du blog */
export default async function BlogPage() {
  const [{ blog }, posts] = await Promise.all([getSettings(), getBlogPosts()]);
  const { hero } = blog;

  return (
    <>
      <section aria-labelledby="blog-title" className="relative overflow-hidden bg-forest text-ivory">
        {hero.image_url && (
          <div aria-hidden="true" className="absolute inset-0 md:left-1/3">
            <SmartImage src={hero.image_url} alt="" fill priority sizes="(min-width: 768px) 70vw, 100vw" className="object-cover object-right" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--forest)_0%,color-mix(in_srgb,var(--forest)_80%,transparent)_40%,color-mix(in_srgb,var(--forest)_25%,transparent)_100%)]" />
          </div>
        )}
        <div className="container-site relative py-10 md:py-16">
          <div className="rise max-w-xl">
            {hero.kicker && <p className="kicker text-champagne!">{hero.kicker}</p>}
            <h1 id="blog-title" className="title-xl mt-3 text-[clamp(2rem,6vw,3.2rem)] text-ivory!">
              {hero.title}
            </h1>
            <span aria-hidden="true" className="mt-5 block h-0.5 w-14 bg-champagne" />
            {hero.text && <p className="mt-5 text-[16px] leading-relaxed text-ivory/85">{hero.text}</p>}
            <div className="mt-7 max-w-lg">
              <Suspense fallback={<SearchForm placeholder={hero.search_placeholder} />}>
                <BlogSearch placeholder={hero.search_placeholder} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* useSearchParams : catégorie et recherche lues dans l'URL au moment de la requête */}
      <Suspense fallback={<div className="container-site min-h-[60vh]" aria-busy="true" />}>
        <BlogView posts={posts} settings={blog} />
      </Suspense>

      {blog.newsletter.visible && <BlogNewsletter settings={blog.newsletter} />}
      <BlogTrust items={blog.trust} />
    </>
  );
}
