CREATE TABLE IF NOT EXISTS public.cotacao_cambio_cache (
  currency_pair text PRIMARY KEY CHECK (currency_pair = 'USD/BRL'),
  rate numeric(12, 6) NOT NULL CHECK (rate > 0),
  bid numeric(12, 6),
  ask numeric(12, 6),
  quote_timestamp bigint,
  source text NOT NULL CHECK (source IN ('awesomeapi', 'fallback')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cotacao_cambio_cache ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.cotacao_cambio_cache FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.cotacao_cambio_cache TO service_role;

NOTIFY pgrst, 'reload schema';
