import type { OrderStatus } from '@/lib/types';

export const ORDER_STATUSES: { id: OrderStatus; label: string; badge: string }[] = [
  { id: 'pending', label: 'En attente', badge: 'pz-badge-warn' },
  { id: 'confirmed', label: 'Confirmée', badge: '' },
  { id: 'shipped', label: 'Expédiée', badge: '' },
  { id: 'delivered', label: 'Livrée', badge: 'pz-badge-up' },
  { id: 'cancelled', label: 'Annulée', badge: 'pz-badge-down' },
];

export const PAYMENT_LABELS: Record<string, string> = {
  cash_on_delivery: 'À la livraison',
  mobile_money: 'Mobile Money',
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUSES.find((x) => x.id === status) ?? ORDER_STATUSES[0];
  return <span className={`pz-badge ${s.badge}`}>{s.label}</span>;
}
