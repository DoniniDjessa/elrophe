import { Star } from 'lucide-react';

export default function Stars({ rating, count, className = '' }: { rating: number; count?: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="flex" role="img" aria-label={`Note : ${rating.toFixed(1).replace('.', ',')} sur 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`h-3.5 w-3.5 ${i <= rounded ? 'fill-leaf text-leaf' : 'text-forest/25'}`} strokeWidth={1.5} aria-hidden="true" />
        ))}
      </span>
      {count !== undefined && count > 0 && <span className="text-xs text-ink-muted">({count})</span>}
    </div>
  );
}
