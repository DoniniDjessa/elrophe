import Link from 'next/link';
import {
  Activity, Apple, ArrowRight, BookOpen, Brain, CalendarDays, Clock, Droplet, Eye, FileText, FlaskConical, Flower2, Heart, Leaf, Moon, RefreshCw,
  ShieldCheck, Soup, Sparkles, Sprout, Sun, Zap, type LucideIcon,
} from 'lucide-react';
import SmartImage from '@/components/ui/SmartImage';
import type { BlogCategory, BlogIcon, BlogPost, BlogSettings } from '@/lib/types';

/** Pictogrammes proposés dans Pilotage › Blog (catégories et bandeau de réassurance) */
export const blogIcons: Record<BlogIcon, { Icon: LucideIcon; label: string }> = {
  leaf: { Icon: Leaf, label: 'Feuille' },
  zap: { Icon: Zap, label: 'Éclair' },
  droplet: { Icon: Droplet, label: 'Goutte' },
  heart: { Icon: Heart, label: 'Cœur' },
  sparkles: { Icon: Sparkles, label: 'Éclat' },
  sun: { Icon: Sun, label: 'Soleil' },
  moon: { Icon: Moon, label: 'Lune' },
  flask: { Icon: FlaskConical, label: 'Fiole' },
  shield: { Icon: ShieldCheck, label: 'Bouclier' },
  sprout: { Icon: Sprout, label: 'Pousse' },
  apple: { Icon: Apple, label: 'Pomme' },
  brain: { Icon: Brain, label: 'Cerveau' },
  activity: { Icon: Activity, label: 'Pouls' },
  soup: { Icon: Soup, label: 'Bol (digestion)' },
  file: { Icon: FileText, label: 'Document' },
  refresh: { Icon: RefreshCw, label: 'Mise à jour' },
  book: { Icon: BookOpen, label: 'Livre' },
  flower: { Icon: Flower2, label: 'Fleur' },
};

export const BlogIconView = ({ icon, className = 'h-5 w-5' }: { icon: BlogIcon; className?: string }) => {
  const Icon = (blogIcons[icon] ?? blogIcons.leaf).Icon;
  return <Icon className={className} strokeWidth={1.4} aria-hidden="true" />;
};

export const formatPostDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/** 1 240 → « 1,2 k » */
export const formatViews = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k` : String(n));

export const categoryOf = (categories: BlogCategory[], slug: string | null) => categories.find((c) => c.slug === slug);

export function PostMeta({ post, showViews, className = '' }: { post: BlogPost; showViews?: boolean; className?: string }) {
  return (
    <p className={`flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-muted ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
      </span>
      {post.reading_minutes > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {post.reading_minutes} min<span className="max-sm:hidden"> de lecture</span>
        </span>
      )}
      {showViews && post.views > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          {formatViews(post.views)} vues
        </span>
      )}
    </p>
  );
}

/** Petit rond champagne avec flèche (fin des cartes) */
export const ArrowBubble = () => (
  <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne text-[#a58c62] transition-colors group-hover:bg-champagne group-hover:text-forest">
    <ArrowRight className="h-4 w-4" />
  </span>
);

/** Ligne d'article : vignette à gauche, catégorie, titre, date */
export function PostRow({ post, category }: { post: BlogPost; category?: BlogCategory }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[240px_minmax(0,1fr)] sm:gap-6">
      <span className="relative block aspect-[16/10] overflow-hidden rounded-lg bg-white">
        {post.cover_url && (
          <SmartImage src={post.cover_url} alt={post.cover_alt} fill sizes="(min-width: 640px) 240px, 45vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        )}
      </span>
      <span className="min-w-0">
        {category && <span className="block text-[10.5px] font-semibold tracking-[0.18em] text-anthracite uppercase">{category.name}</span>}
        <span className="mt-1.5 block font-serif text-[1.2rem] leading-snug text-anthracite sm:text-[1.4rem]">{post.title}</span>
        <span className="mt-2 flex items-center justify-between gap-3">
          <PostMeta post={post} />
          <ArrowBubble />
        </span>
      </span>
    </Link>
  );
}

/** Bandeau de réassurance en bas de page */
export function BlogTrust({ items }: { items: BlogSettings['trust'] }) {
  const shown = items.filter((t) => t.text.trim());
  if (shown.length === 0) return null;
  return (
    <ul className="grid grid-cols-2 border-t border-line bg-white/60 sm:grid-cols-4">
      {shown.map((t, i) => (
        <li key={i} className={`flex flex-col items-center gap-2 px-3 py-6 text-center text-[13px] leading-snug text-anthracite ${i > 0 ? 'sm:border-l sm:border-line' : ''} ${i % 2 ? 'max-sm:border-l max-sm:border-line' : ''}`}>
          <BlogIconView icon={t.icon} className="h-6 w-6 text-forest" />
          {t.text}
        </li>
      ))}
    </ul>
  );
}
