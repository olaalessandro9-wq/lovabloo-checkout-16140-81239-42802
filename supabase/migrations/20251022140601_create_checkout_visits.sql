-- Migração 2: Criar tabela checkout_visits para rastreamento de acessos

CREATE TABLE IF NOT EXISTS checkout_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id uuid NOT NULL REFERENCES checkouts(id) ON DELETE CASCADE,
  visited_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_checkout_visits_checkout_id ON checkout_visits(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_visits_visited_at ON checkout_visits(visited_at DESC);

-- Habilitar RLS
ALTER TABLE checkout_visits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Usuários podem ver visitas dos seus checkouts
CREATE POLICY "Users can view visits for their checkouts"
ON checkout_visits
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE c.id = checkout_visits.checkout_id
    AND p.user_id = auth.uid()
  )
);

-- Permitir inserção anônima (para rastrear visitas públicas)
CREATE POLICY "Allow anonymous insert for visit tracking"
ON checkout_visits
FOR INSERT
WITH CHECK (true);

-- Admins podem ver tudo
CREATE POLICY "Admins can manage all checkout visits"
ON checkout_visits
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Comentários
COMMENT ON TABLE checkout_visits IS 'Rastreamento de visitas aos checkouts';
COMMENT ON COLUMN checkout_visits.ip_address IS 'Endereço IP do visitante';
COMMENT ON COLUMN checkout_visits.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN checkout_visits.referrer IS 'URL de origem da visita';

