alter table public.pedido
  add column if not exists stripe_session_id text,
  add column if not exists cj_status text,
  add column if not exists cj_order_id text,
  add column if not exists cj_order_ids jsonb,
  add column if not exists cj_error text,
  add column if not exists cj_sent_at timestamptz,
  add column if not exists frete_detalhes jsonb;

create unique index if not exists pedido_stripe_session_id_uidx
  on public.pedido (stripe_session_id)
  where stripe_session_id is not null;

create index if not exists pedido_cj_status_idx
  on public.pedido (cj_status);
