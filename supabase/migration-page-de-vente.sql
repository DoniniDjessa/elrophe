-- Page de vente des produits (à exécuter une fois dans l'éditeur SQL de Supabase)
-- Ajoute la colonne « landing » et met à jour le passage de commande pour les variantes
-- (prix relus en base, variantes en rupture ou masquées refusées).
-- Sans effet sur les données existantes ; peut être relancé sans risque.

alter table public.elrophe_products add column if not exists landing jsonb;

create or replace function public.elrophe_place_order(payload jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  item jsonb;
  prod public.elrophe_products%rowtype;
  offer jsonb;
  qty int;
  units int;
  unit_price numeric;
  lines jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_free boolean := true;
  v_fee numeric := coalesce((payload->>'shipping_fee')::numeric, 0);
  v_threshold numeric := nullif(payload->>'free_shipping_threshold', '')::numeric;
  v_number text;
  v_id uuid;
begin
  if jsonb_typeof(payload->'items') is distinct from 'array' or jsonb_array_length(payload->'items') = 0 then
    raise exception 'EMPTY_CART';
  end if;
  if coalesce(trim(payload->>'customer_name'), '') = ''
     or coalesce(trim(payload->>'customer_phone'), '') = ''
     or coalesce(trim(payload->>'address'), '') = '' then
    raise exception 'MISSING_FIELDS';
  end if;

  for item in select * from jsonb_array_elements(payload->'items') loop
    qty := greatest(1, least(99, coalesce((item->>'quantity')::int, 1)));
    select * into prod from public.elrophe_products
      where id = (item->>'product_id')::uuid and is_active
      for update;
    if not found then raise exception 'PRODUCT_UNAVAILABLE'; end if;

    -- Offre de la page de vente : prix et unités relus dans le produit
    offer := null;
    if coalesce(item->>'offer_id', '') <> '' then
      select value into offer from jsonb_array_elements(coalesce(prod.landing->'offers', '[]'::jsonb))
        where value->>'id' = item->>'offer_id' limit 1;
      if offer is null or coalesce((offer->>'hidden')::boolean, false) then raise exception 'PRODUCT_UNAVAILABLE'; end if;
      if coalesce((offer->>'sold_out')::boolean, false) then
        raise exception 'OUT_OF_STOCK:%', prod.name || ' — ' || (offer->>'label');
      end if;
    end if;
    units := qty * greatest(1, coalesce((offer->>'units')::int, 1));
    unit_price := coalesce(nullif(offer->>'price', '')::numeric, prod.price);
    if offer is null or not coalesce((prod.landing->>'free_shipping')::boolean, false) then
      v_free := false;
    end if;

    if prod.stock is not null and prod.stock < units then
      raise exception 'OUT_OF_STOCK:%', prod.name;
    end if;
    if prod.stock is not null then
      update public.elrophe_products set stock = stock - units where id = prod.id;
    end if;
    v_subtotal := v_subtotal + unit_price * qty;
    lines := lines || jsonb_build_object(
      'product_id', prod.id, 'slug', prod.slug,
      'name', prod.name || coalesce(' — ' || (offer->>'label'), ''),
      'image_url', prod.image_url, 'price', unit_price, 'quantity', qty);
  end loop;

  v_shipping := case
    when v_free then 0
    when v_threshold is not null and v_threshold > 0 and v_subtotal >= v_threshold then 0
    else v_fee end;
  v_number := 'ELR-' || to_char(now() at time zone 'utc', 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));

  insert into public.elrophe_orders
    (order_number, customer_name, customer_phone, customer_email, address, city, notes,
     items, subtotal, shipping, total, payment_method)
  values
    (v_number, trim(payload->>'customer_name'), trim(payload->>'customer_phone'),
     nullif(trim(payload->>'customer_email'), ''), trim(payload->>'address'),
     nullif(trim(payload->>'city'), ''), nullif(trim(payload->>'notes'), ''),
     lines, v_subtotal, v_shipping, v_subtotal + v_shipping,
     coalesce(nullif(payload->>'payment_method', ''), 'cash_on_delivery'))
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'order_number', v_number, 'total', v_subtotal + v_shipping);
end $$;

revoke all on function public.elrophe_place_order(jsonb) from public, anon, authenticated;
grant execute on function public.elrophe_place_order(jsonb) to service_role;
