'use client';

import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

/** Recherche de la bannière : met à jour ?q= (garde la catégorie choisie) */
export function SearchForm({ placeholder, query = '', category = '' }: { placeholder: string; query?: string; category?: string }) {
  return (
    <Form action="/blog" scroll={false} className="flex items-center gap-2 rounded-full bg-ivory p-1.5 pl-4 shadow-[var(--shadow-soft)]" role="search">
      <Search className="h-5 w-5 shrink-0 text-anthracite" strokeWidth={1.5} aria-hidden="true" />
      <label htmlFor="blog-search" className="sr-only">
        Rechercher un article
      </label>
      <input
        key={query}
        id="blog-search"
        name="q"
        type="search"
        defaultValue={query}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-anthracite outline-none placeholder:text-muted"
      />
      {category && <input type="hidden" name="categorie" value={category} />}
      <button type="submit" aria-label="Rechercher" className="flex h-10 w-11 shrink-0 items-center justify-center rounded-full bg-champagne text-forest">
        <Search className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
      </button>
    </Form>
  );
}

export default function BlogSearch({ placeholder }: { placeholder: string }) {
  const params = useSearchParams();
  return <SearchForm placeholder={placeholder} query={params.get('q') ?? ''} category={params.get('categorie') ?? ''} />;
}
