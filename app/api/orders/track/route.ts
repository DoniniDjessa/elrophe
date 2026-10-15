import { clientIp, rateLimit } from '@/lib/rate-limit';
import { supabaseService } from '@/lib/supabase/server-admin';

const digits = (v: string) => v.replace(/\D/g, '').slice(-8);

export async function POST(request: Request) {
  if (!rateLimit(`track:${clientIp(request)}`, 10, 10 * 60_000)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez plus tard.' }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const number = typeof body.order_number === 'string' ? body.order_number.trim().toUpperCase() : '';
  const phone = typeof body.phone === 'string' ? body.phone : '';
  if (!number || !phone) return Response.json({ error: 'Numéro de commande et téléphone requis.' }, { status: 400 });

  const { data } = await supabaseService
    .from('elrophe_orders')
    .select('order_number, status, items, subtotal, shipping, total, created_at, payment_method, customer_phone')
    .eq('order_number', number)
    .maybeSingle();

  // Le téléphone doit correspondre (8 derniers chiffres) : on ne révèle rien sinon
  if (!data || digits(data.customer_phone) !== digits(phone)) {
    return Response.json({ error: 'Aucune commande ne correspond à ces informations.' }, { status: 404 });
  }
  const { customer_phone: _omit, ...order } = data;
  void _omit;
  return Response.json({ order: { ...order, subtotal: Number(order.subtotal), shipping: Number(order.shipping), total: Number(order.total) } });
}
