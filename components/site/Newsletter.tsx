'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import type { SectionsSettings } from '@/lib/types';
import { LogoMark } from './Icons';
import Reveal from './Reveal';

export default function Newsletter({ data }: { data: SectionsSettings['newsletter'] }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Inscription impossible');
      setState('done');
      setMessage(data.success_message);
      setEmail('');
    } catch (err) {
      setState('error');
      setMessage(err instanceof Error ? err.message : 'Inscription impossible');
    }
  };

  return (
    <section aria-labelledby="newsletter-title" className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
      <Reveal className="relative overflow-hidden rounded-[2rem] bg-forest px-6 py-14 text-center text-white shadow-[var(--shadow-soft)] sm:px-12 lg:py-20">
        <LogoMark aria-hidden="true" className="absolute -top-10 -left-10 h-56 w-56 text-white/[0.04]" />
        <LogoMark aria-hidden="true" className="absolute -right-14 -bottom-16 h-72 w-72 rotate-12 text-white/[0.05]" />
        <div className="relative mx-auto max-w-2xl">
          {data.eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.3em] text-white/70 uppercase">
              {data.eyebrow} {data.eyebrow_accent && <span className="text-lime">{data.eyebrow_accent}</span>}
            </p>
          )}
          <h2 id="newsletter-title" className="heading-lg mt-4 text-[clamp(1.9rem,4.4vw,3.1rem)] text-white!">
            {data.title} {data.script && <span className="script ml-1 inline-block text-[1.35em] text-lime!">{data.script}</span>}
          </h2>
          {data.text && <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/75">{data.text}</p>}

          <form onSubmit={submit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">
              Adresse e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              autoComplete="email"
              placeholder="Votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-[15px] text-white placeholder:text-white/60 focus:bg-white/15 focus:outline-2 focus:outline-offset-2 focus:outline-lime"
            />
            <button
              type="submit"
              disabled={state === 'loading'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-cream px-6 py-3.5 text-sm font-semibold text-forest transition-colors hover:bg-white focus-visible:outline-lime disabled:opacity-60"
            >
              {state === 'done' ? <Check className="h-4 w-4" /> : null}
              {data.button_label}
              {state !== 'done' && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
            </button>
          </form>
          <p role="status" aria-live="polite" className={`mt-4 min-h-5 text-sm ${state === 'error' ? 'text-[#ffd2c2]' : 'text-lime'}`}>
            {message}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
