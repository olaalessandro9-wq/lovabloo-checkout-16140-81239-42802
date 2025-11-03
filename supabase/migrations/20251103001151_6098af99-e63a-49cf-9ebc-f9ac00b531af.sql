-- Tornar pushinpay_token opcional (nullable)
-- Isso permite usar apenas token_encrypted para segurança
ALTER TABLE payment_gateway_settings 
  ALTER COLUMN pushinpay_token DROP NOT NULL;

-- Forçar reload do schema cache do PostgREST
SELECT pg_notify('pgrst', 'reload schema');