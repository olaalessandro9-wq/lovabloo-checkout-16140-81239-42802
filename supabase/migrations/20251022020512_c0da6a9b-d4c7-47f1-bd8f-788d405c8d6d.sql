-- Fix payment_links public discoverability issue
-- Currently, the table might allow some public access that shouldn't exist
-- We need to ensure ONLY authenticated users can see their own links

-- First, drop any potentially conflicting policies
DROP POLICY IF EXISTS "Deny all access to payment_links by default" ON public.payment_links;

-- Recreate with explicit authenticated-only access
CREATE POLICY "Block all unauthenticated access to payment_links"
ON public.payment_links
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Ensure only authenticated users can view their own payment links
-- This policy already exists but we're being explicit about TO authenticated
DROP POLICY IF EXISTS "Users can view their own payment links" ON public.payment_links;

CREATE POLICY "Authenticated users can view their own payment links"
ON public.payment_links
FOR SELECT
TO authenticated
USING (product_id IN (
  SELECT products.id 
  FROM products 
  WHERE products.user_id = auth.uid()
));