-- Migration: Adicionar status aos payment_links
-- Data: 2025-10-22
-- Descrição: Adiciona campo de status (ativo/desativado) aos links de pagamento

-- Adicionar coluna status
ALTER TABLE payment_links
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- Atualizar links existentes para ativo
UPDATE payment_links SET status = 'active' WHERE status IS NULL;

-- Comentário
COMMENT ON COLUMN payment_links.status IS 'Status do link: active (ativo) ou inactive (desativado)';

