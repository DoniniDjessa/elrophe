const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function formatPrice(value: number, currency = 'FCFA'): string {
  return `${numberFormat.format(Math.round(value))}\u202f${currency}`;
}

export function formatDate(value: string, withTime = false): string {
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
