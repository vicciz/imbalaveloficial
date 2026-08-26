alter table public.pedido
  add column if not exists stripe_refund_id text,
  add column if not exists stripe_refund_status text,
  add column if not exists stripe_refunded_at timestamptz,
  add column if not exists stripe_refund_error text;
