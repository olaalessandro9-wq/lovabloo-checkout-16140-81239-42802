-- Add customization fields to order_bumps table
ALTER TABLE order_bumps 
  ADD COLUMN IF NOT EXISTS discount_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discount_price DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS call_to_action TEXT DEFAULT 'SIM, EU ACEITO ESSA OFERTA ESPECIAL!',
  ADD COLUMN IF NOT EXISTS custom_title TEXT,
  ADD COLUMN IF NOT EXISTS custom_description TEXT,
  ADD COLUMN IF NOT EXISTS show_image BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN order_bumps.discount_enabled IS 'Se o desconto está ativado';
COMMENT ON COLUMN order_bumps.discount_price IS 'Preço com desconto (se discount_enabled = true)';
COMMENT ON COLUMN order_bumps.call_to_action IS 'Texto do call to action (ex: SIM, EU ACEITO...)';
COMMENT ON COLUMN order_bumps.custom_title IS 'Título personalizado (se null, usa nome do produto)';
COMMENT ON COLUMN order_bumps.custom_description IS 'Descrição personalizada';
COMMENT ON COLUMN order_bumps.show_image IS 'Se deve exibir a imagem do produto';
