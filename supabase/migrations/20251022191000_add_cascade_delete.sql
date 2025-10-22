-- Migration: Adicionar ON DELETE CASCADE para permitir exclusão em cascata
-- Data: 2025-10-22
-- Descrição: Remove trigger problemático e adiciona CASCADE nas foreign keys

-- 1. Remover trigger que está bloqueando
DROP TRIGGER IF EXISTS prevent_orphaned_links_trigger ON checkout_links;
DROP FUNCTION IF EXISTS prevent_orphaned_links();

-- 2. Remover constraints antigas
ALTER TABLE checkout_links DROP CONSTRAINT IF EXISTS checkout_links_checkout_id_fkey;
ALTER TABLE checkout_links DROP CONSTRAINT IF EXISTS checkout_links_link_id_fkey;

-- 3. Adicionar constraints com ON DELETE CASCADE
ALTER TABLE checkout_links
  ADD CONSTRAINT checkout_links_checkout_id_fkey
  FOREIGN KEY (checkout_id) REFERENCES checkouts(id) ON DELETE CASCADE;

ALTER TABLE checkout_links
  ADD CONSTRAINT checkout_links_link_id_fkey
  FOREIGN KEY (link_id) REFERENCES payment_links(id) ON DELETE CASCADE;

-- 4. Fazer o mesmo para payment_links
ALTER TABLE payment_links DROP CONSTRAINT IF EXISTS payment_links_offer_id_fkey;

ALTER TABLE payment_links
  ADD CONSTRAINT payment_links_offer_id_fkey
  FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE;

-- 5. Fazer o mesmo para offers
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_product_id_fkey;

ALTER TABLE offers
  ADD CONSTRAINT offers_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- 6. Fazer o mesmo para checkouts
ALTER TABLE checkouts DROP CONSTRAINT IF EXISTS checkouts_product_id_fkey;

ALTER TABLE checkouts
  ADD CONSTRAINT checkouts_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

COMMENT ON TABLE checkout_links IS 'Associações entre checkouts e links com CASCADE delete';

