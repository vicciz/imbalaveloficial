alter table public.usuario
  add column if not exists documento_fiscal text;

alter table public.pedido
  add column if not exists documento_fiscal text;
