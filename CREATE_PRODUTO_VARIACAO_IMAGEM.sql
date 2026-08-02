create table if not exists public.produto_variacao_imagem (
  id bigserial primary key,
  id_variacao bigint not null references public.produto_variacao(id) on delete cascade,
  id_imagem bigint not null references public.produto_imagem(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (id_variacao, id_imagem)
);

create index if not exists idx_produto_variacao_imagem_variacao
  on public.produto_variacao_imagem (id_variacao);

create index if not exists idx_produto_variacao_imagem_imagem
  on public.produto_variacao_imagem (id_imagem);
