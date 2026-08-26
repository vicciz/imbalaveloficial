alter table public.pedido_notificacao
  add column if not exists processed_at timestamptz;

create index if not exists pedido_notificacao_unprocessed_idx
  on public.pedido_notificacao (processed_at)
  where processed_at is null;
