-- Migration: Create multi-offer system (offers, payment_links, checkout_links)
-- This implements the Cakto model where:
-- 1. Products can have multiple offers (price variations)
-- 2. Each offer generates a unique payment link
-- 3. Links must be associated with at least 1 checkout (no orphans)
-- 4. Checkouts can have multiple links

-- ============================================
-- 1. CREATE OFFERS TABLE
-- ============================================
-- Stores different price variations for a product
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Rise community R$ 37,90"
  price DECIMAL(10, 2) NOT NULL,
  is_default BOOLEAN DEFAULT false, -- Mark which offer is the default
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. CREATE PAYMENT_LINKS TABLE
-- ============================================
-- Auto-generated payment links for each offer
CREATE TABLE IF NOT EXISTS public.payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE, -- e.g., "rise-community-3790"
  url TEXT NOT NULL, -- Full URL to the checkout page
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Ensure one link per offer
  CONSTRAINT unique_link_per_offer UNIQUE (offer_id)
);

-- ============================================
-- 3. CREATE CHECKOUT_LINKS JUNCTION TABLE
-- ============================================
-- Many-to-many relationship between checkouts and payment links
CREATE TABLE IF NOT EXISTS public.checkout_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID NOT NULL REFERENCES public.checkouts(id) ON DELETE CASCADE,
  link_id UUID NOT NULL REFERENCES public.payment_links(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Prevent duplicate associations
  CONSTRAINT unique_checkout_link UNIQUE (checkout_id, link_id)
);

-- ============================================
-- 4. ENABLE RLS
-- ============================================
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. CREATE RLS POLICIES
-- ============================================
-- Offers policies
CREATE POLICY "Enable read access for all users" ON public.offers FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.offers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.offers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.offers FOR DELETE USING (true);

-- Payment links policies
CREATE POLICY "Enable read access for all users" ON public.payment_links FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.payment_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.payment_links FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.payment_links FOR DELETE USING (true);

-- Checkout links policies
CREATE POLICY "Enable read access for all users" ON public.checkout_links FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.checkout_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.checkout_links FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.checkout_links FOR DELETE USING (true);

-- ============================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON public.offers(product_id);
-- Create partial unique index to ensure only one default offer per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_default_offer_per_product 
  ON public.offers(product_id) 
  WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_payment_links_offer_id ON public.payment_links(offer_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_slug ON public.payment_links(slug);
CREATE INDEX IF NOT EXISTS idx_checkout_links_checkout_id ON public.checkout_links(checkout_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_link_id ON public.checkout_links(link_id);

-- ============================================
-- 7. CREATE TRIGGER FOR UPDATED_AT
-- ============================================
CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. CREATE FUNCTION TO GENERATE SLUG
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_link_slug(offer_name TEXT, offer_price DECIMAL)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Create base slug from offer name and price
  -- Example: "Rise community R$ 37,90" -> "rise-community-3790"
  base_slug := lower(regexp_replace(
    offer_name || '-' || replace(offer_price::TEXT, '.', ''),
    '[^a-zA-Z0-9]+',
    '-',
    'g'
  ));
  
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Ensure uniqueness
  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.payment_links WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. CREATE FUNCTION TO AUTO-GENERATE PAYMENT LINK
-- ============================================
CREATE OR REPLACE FUNCTION public.create_payment_link_for_offer()
RETURNS TRIGGER AS $$
DECLARE
  link_slug TEXT;
  link_url TEXT;
BEGIN
  -- Generate unique slug
  link_slug := public.generate_link_slug(NEW.name, NEW.price);
  
  -- Create full URL (will be updated with actual domain)
  link_url := 'https://risecheckout.lovable.app/c/' || link_slug;
  
  -- Insert payment link
  INSERT INTO public.payment_links (offer_id, slug, url)
  VALUES (NEW.id, link_slug, link_url);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. CREATE TRIGGER TO AUTO-GENERATE LINKS
-- ============================================
CREATE TRIGGER auto_create_payment_link
  AFTER INSERT ON public.offers
  FOR EACH ROW
  EXECUTE FUNCTION public.create_payment_link_for_offer();

-- ============================================
-- 11. CREATE FUNCTION TO PREVENT ORPHANED LINKS
-- ============================================
-- This function prevents deletion of the last checkout association
CREATE OR REPLACE FUNCTION public.prevent_orphaned_links()
RETURNS TRIGGER AS $$
DECLARE
  remaining_checkouts INTEGER;
BEGIN
  -- Count remaining checkout associations for this link
  SELECT COUNT(*) INTO remaining_checkouts
  FROM public.checkout_links
  WHERE link_id = OLD.link_id
  AND id != OLD.id;
  
  -- If this is the last association, prevent deletion
  IF remaining_checkouts = 0 THEN
    RAISE EXCEPTION 'Cannot remove link from last checkout. Links must be associated with at least one checkout.';
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. CREATE TRIGGER TO PREVENT ORPHANED LINKS
-- ============================================
CREATE TRIGGER prevent_orphaned_links_trigger
  BEFORE DELETE ON public.checkout_links
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_orphaned_links();

-- ============================================
-- 13. MIGRATE EXISTING PRODUCTS TO OFFERS
-- ============================================
-- Create default offer for each existing product
INSERT INTO public.offers (product_id, name, price, is_default)
SELECT 
  id,
  name || ' - Oferta Padrão',
  price,
  true
FROM public.products
WHERE NOT EXISTS (
  SELECT 1 FROM public.offers WHERE product_id = products.id
);

-- ============================================
-- 14. CREATE DEFAULT CHECKOUT ASSOCIATIONS
-- ============================================
-- Associate all payment links with their product's default checkout
INSERT INTO public.checkout_links (checkout_id, link_id)
SELECT DISTINCT
  c.id as checkout_id,
  pl.id as link_id
FROM public.checkouts c
INNER JOIN public.offers o ON o.product_id = c.product_id
INNER JOIN public.payment_links pl ON pl.offer_id = o.id
WHERE NOT EXISTS (
  SELECT 1 FROM public.checkout_links cl 
  WHERE cl.checkout_id = c.id AND cl.link_id = pl.id
);

