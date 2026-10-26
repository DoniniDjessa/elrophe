import { getSettings } from '@/lib/data';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { supabaseService } from '@/lib/supabase/server-admin';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const errors: Record<string, string> = {
  EMPTY_CART: 'Votre panier est vide.',
  MISSING_FIELDS: 'Merci de renseigner votre nom, votre téléphone et votre adresse.',
  PRODUCT_UNAVAILABLE: 'Un produit de votre panier n’est plus disponible. Mettez votre panier à jour.',
};

export async function POST(request: Request) {
  if (!rateLimit(`order:${clientIp(request)}`, 5, 10 * 60_000)) {
    return Response.json({ error: 'Trop de tentatives. Réessayez dans quelques minutes.' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Requête invalide' }, { status: 400 });
  }

  const uuid = /^[0-9a-f-]{36}$/i;
  const items = Array.isArray(body.items)
    ? body.items
        .filter((i): i is { product_id: string; quantity: number; offer_id?: unknown } => typeof i?.product_id === 'string' && uuid.test(i.product_id))
        .slice(0, 50)
        .map((i) => ({
          product_id: i.product_id,
          quantity: Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 1))),
          // Offre de la page de vente : son prix est relu en base
          offer_id: str(i.offer_id, 40),
        }))
    : [];
  if (items.length === 0) {
    return Response.json({ error: 'Votre panier est vide ou contient des produits de démonstration.' }, { status: 400 });
  }

  const phone = str(body.customer_phone, 30);
  if (phone.replace(/\D/g, '').length < 8) {
    return Response.json({ error: 'Numéro de téléphone invalide.' }, { status: 400 });
  }

  const { shop } = await getSettings();
  const method = body.payment_method === 'mobile_money' && shop.mobile_money ? 'mobile_money' : 'cash_on_delivery';

  const { data, error } = await supabaseService.rpc('elrophe_place_order', {
    payload: {
      customer_name: str(body.customer_name, 120),
      customer_phone: phone,
      customer_email: str(body.customer_email, 160),
      address: str(body.address, 300),
      city: str(body.city, 80),
      notes: str(body.notes, 600),
      payment_method: method,
      items,
      shipping_fee: shop.shipping_fee,
      free_shipping_threshold: shop.free_shipping_threshold,
    },
  });

  if (error) {
    const code = error.message.split(':')[0];
    const message = code === 'OUT_OF_STOCK' ? `Stock insuffisant pour « ${error.message.split(':').slice(1).join(':')} ».` : errors[code];
    console.error('[elrophe] commande refusée :', error.message);
    return Response.json({ error: message ?? 'La commande n’a pas pu être enregistrée. Réessayez ou contactez-nous.' }, { status: message ? 400 : 500 });
  }

  return Response.json(data);
}
