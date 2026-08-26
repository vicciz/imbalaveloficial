alter table public.pedido
  add column if not exists cj_internal_order_id text,
  add column if not exists cj_order_code text,
  add column if not exists cj_tracking_code text,
  add column if not exists cj_tracking_provider text,
  add column if not exists cj_tracking_url text,
  add column if not exists cj_status_updated_at timestamptz;
