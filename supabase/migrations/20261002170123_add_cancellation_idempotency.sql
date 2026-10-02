ALTER TABLE public.pedido
	ADD COLUMN IF NOT EXISTS stripe_refund_id text,
	ADD COLUMN IF NOT EXISTS stripe_refund_status text,
	ADD COLUMN IF NOT EXISTS stripe_refunded_at timestamptz,
	ADD COLUMN IF NOT EXISTS stripe_refund_error text,
	ADD COLUMN IF NOT EXISTS cancelamento_em_andamento boolean NOT NULL DEFAULT false,
	ADD COLUMN IF NOT EXISTS cancelamento_inicio_em timestamptz,
	ADD COLUMN IF NOT EXISTS cj_cancelamento_resultados jsonb NOT NULL DEFAULT '{}'::jsonb,
	ADD COLUMN IF NOT EXISTS cancelamento_email_tentado_em timestamptz,
	ADD COLUMN IF NOT EXISTS cancelamento_email_enviado_em timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS pedido_evento_order_cancelled_unique
	ON public.pedido_evento (pedido_id)
	WHERE tipo = 'ORDER_CANCELLED';

NOTIFY pgrst, 'reload schema';
