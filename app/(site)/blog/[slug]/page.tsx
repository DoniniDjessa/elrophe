import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import BlogContent from '@/components/site/blog/BlogContent';
import BlogNewsletter from '@/components/site/blog/BlogNewsletter';
import ViewCounter from '@/components/site/blog/ViewCounter';
import { BlogTrust, categoryOf, PostMeta, PostRow } from '@/components/site/blog/blog';
import SmartImage from '@/components/ui/SmartImage';
import { getBlogPostBySlug, getBlogPosts, getSettings } from '@/lib/data';

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  // Cache Components exige au moins un résultat : blog vide → une page 404 générée
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: 'blog-vide' }];
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Article introuvable' };
  return {
    title: post.title,
    description: post.excerpt.slice(0, 160) || undefined,
    openGraph: { type: 'article', images: post.cover_url && !post.cover_url.endsWith('.svg') ? [post.cover_url] : undefined },
  };
}

async function PostContent({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const { slug } = await params;
  const [post, posts, { blog }] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts(), getSettings()]);
  if (!post) notFound();

  const category = categoryOf(blog.categories, post.category_slug);
  // À lire aussi : même catégorie d'abord, puis les plus récents
  const others = posts.filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => p.category_slug === post.category_slug), ...others.filter((p) => p.category_slug !== post.category_slug)].slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    image: post.cover_url || undefined,
    author: post.author ? { '@type': 'Organization', name: post.author } : undefined,
  };

  return (
    <>
      <ViewCounter slug={post.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <article className="container-site max-w-3xl! pt-6 pb-14 lg:pt-10 lg:pb-20">
        <nav aria-label="Fil d'Ariane" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
            <li>
              <Link href="/" className="hover:text-forest">
                Accueil
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <Link href="/blog" className="hover:text-forest">
                Blog
              </Link>
            </li>
            {category && (
              <li className="flex items-center gap-1.5">
                <ChevronRight className="h-3 w-3" aria-hidden="true" />
                <Link href={`/blog?categorie=${category.slug}`} className="hover:text-forest">
                  {category.name}
                </Link>
              </li>
            )}
          </ol>
        </nav>

        <header className="rise">
          {category && <p className="text-[11px] font-semibold tracking-[0.2em] text-anthracite uppercase">{category.name}</p>}
          <h1 className="title-xl mt-3 text-[clamp(2rem,5.4vw,3.1rem)]">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-[18px] leading-relaxed text-muted">{post.excerpt}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3">
            {post.author && <span className="text-[14px] font-medium text-anthracite">{post.author}</span>}
            <PostMeta post={post} showViews={blog.show_views} />
          </div>
        </header>

        {post.cover_url && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-white">
            <SmartImage src={post.cover_url} alt={post.cover_alt} fill priority sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
          </div>
        )}

        <div className="mt-10">
          <BlogContent content={post.content} />
        </div>

        <Link href="/blog" className="btn btn-outline mt-12">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tous les articles
        </Link>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-line bg-white/60 py-12 lg:py-16">
          <div className="container-site max-w-3xl!">
            <h2 id="related-title" className="text-[clamp(1.6rem,3.4vw,2.2rem)]">
              {blog.related_title}
            </h2>
            <ul className="mt-6 space-y-5">
              {related.map((p) => (
                <li key={p.id}>
                  <PostRow post={p} category={categoryOf(blog.categories, p.category_slug)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {blog.newsletter.visible && <BlogNewsletter settings={blog.newsletter} />}
      <BlogTrust items={blog.trust} />
    </>
  );
}

export default function BlogPostPage({ params }: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" aria-busy="true" />}>
      <PostContent params={params} />
    </Suspense>
  );
}
