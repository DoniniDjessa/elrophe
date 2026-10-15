import { Star } from 'lucide-react';

/** `onDark` : variante pour les fonds vert forêt (étoiles citron vert) */
export default function Stars({ rating, count, className = '', onDark = false }: { rating: number; count?: number; className?: string; onDark?: boolean }) {
  const rounded = Math.round(rating);
  const on = onDark ? 'fill-lime text-lime' : 'fill-leaf text-leaf';
  const off = onDark ? 'text-white/30' : 'text-forest/25';
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="flex" role="img" aria-label={`Note : ${rating.toFixed(1).replace('.', ',')} sur 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i <= rounded ? on : off}`} strokeWidth={1.5} aria-hidden="true" />
        ))}
      </span>
      {count !== undefined && count > 0 && <span className={`text-xs ${onDark ? 'text-white/70' : 'text-ink-muted'}`}>({count})</span>}
    </div>
  );
}
