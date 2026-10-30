'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import SmartImage from '@/components/ui/SmartImage';
import type { BlogSettings } from '@/lib/types';

/** « Recevez nos nouveaux articles » : inscription à la newsletter (Pilotage › Newsletter) */
export default function BlogNewsletter({ settings }: { settings: BlogSettings['newsletter'] }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const res = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) }).catch(() => null);
    setBusy(false);
    const json = await res?.json().catch(() => ({}));
    if (!res?.ok) return toast.error(json?.error ?? 'Inscription momentanément indisponible.');
    setDone(true);
    toast.success(settings.success_message);
  };

  return (
    <section aria-labelledby="blog-newsletter-title" className="relative overflow-hidden bg-forest text-ivory">
      {settings.image_url && (
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 opacity-60">
          <SmartImage src={settings.image_url} alt="" fill sizes="50vw" className="object-cover" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--forest)_0%,transparent_70%)]" />
        </div>
      )}
      <div className="container-site relative grid items-center gap-5 py-10 md:grid-cols-2 md:py-12">
        <div>
          <h2 id="blog-newsletter-title" className="text-[clamp(1.6rem,3.5vw,2.1rem)] leading-tight text-ivory!">
            {settings.title}
          </h2>
          {settings.text && <p className="mt-2 text-[15px] text-ivory/80">{settings.text}</p>}
        </div>
        {done ? (
          <p className="rounded-full bg-ivory/10 px-6 py-4 text-[15px]">{settings.success_message}</p>
        ) : (
          <form onSubmit={submit} className="flex items-center gap-1 rounded-full bg-ivory p-1.5">
            <label htmlFor="blog-newsletter-email" className="sr-only">
              Adresse e-mail
            </label>
            <input
              id="blog-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={settings.placeholder}
              className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-anthracite outline-none placeholder:text-muted"
            />
            <button type="submit" disabled={busy} className="btn btn-champagne min-h-11! shrink-0 rounded-full! px-5!">
              {settings.button_label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
