ALTER TABLE public.pedido
  ADD COLUMN IF NOT EXISTS cancelado_em timestamptz,
  ADD COLUMN IF NOT EXISTS motivo_cancelamento text,
  ADD COLUMN IF NOT EXISTS cancelado_por uuid;

NOTIFY pgrst, 'reload schema';