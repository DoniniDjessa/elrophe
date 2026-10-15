import { Ban, Droplet, FlaskConical, Leaf, Rabbit, ShieldCheck, Sparkles, Sprout, type LucideIcon } from 'lucide-react';
import type { Badge } from '@/lib/types';
import type { SVGProps } from 'react';

export const badgeIcons: Record<Badge['icon'], LucideIcon> = {
  leaf: Leaf,
  flask: FlaskConical,
  ban: Ban,
  rabbit: Rabbit,
  sprout: Sprout,
  shield: ShieldCheck,
  droplet: Droplet,
  sparkles: Sparkles,
};

/** Fleur/feuille stylisée du logo */
export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <path d="M16 28c0-7 0-12 0-17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 13c-1.5-4.5.2-8.4 4.8-10.2 1.2 4.6-.6 8.6-4.8 10.2Z" fill="currentColor" />
      <path d="M16 18c-4.2.4-7.8-1.7-9.2-6.2 4.6-.9 8.3 1.4 9.2 6.2Z" fill="currentColor" opacity=".75" />
      <path d="M16 21.5c3.9-1.5 7.9-.4 10 3.6-4.2 1.7-8.3.2-10-3.6Z" fill="currentColor" opacity=".55" />
    </svg>
  );
}

/* Icônes de réseaux sociaux (lucide ne fournit plus les marques) */
type IconProps = SVGProps<SVGSVGElement>;
export const InstagramIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
export const FacebookIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z" />
  </svg>
);
export const TiktokIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M16.6 3c.3 2.2 1.6 3.7 3.9 3.9v2.6c-1.4.1-2.6-.3-3.9-1.1v5.9c0 3.6-2.7 5.9-5.8 5.7-3.4-.2-5.6-3.4-4.6-6.7.7-2.3 3-3.9 5.6-3.6v2.8c-.4-.1-.8-.2-1.2-.1-1.4.1-2.3 1.4-2 2.8.3 1.2 1.5 1.9 2.7 1.6 1-.2 1.7-1.1 1.7-2.2V3h3.6Z" />
  </svg>
);
export const YoutubeIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.3 5 12 5 12 5s-6.3 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.7 19 12 19 12 19s6.3 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);
export const WhatsappIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12 2.2A9.8 9.8 0 0 0 3.6 17l-1.4 4.8 5-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8.9c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.6.3 2.7 2.7 0 0 0-.9 2c0 1.2.9 2.3 1 2.5.1.2 1.7 2.7 4.2 3.7 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.1.2-.6.2-1 .1-1.1l-.5-.4Z" />
  </svg>
);
