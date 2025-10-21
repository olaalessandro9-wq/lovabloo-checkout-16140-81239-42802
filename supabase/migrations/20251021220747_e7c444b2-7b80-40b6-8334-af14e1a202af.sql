-- Add explicit policies to block anonymous access to all business-critical tables

-- Block anonymous access to products table
CREATE POLICY "Deny anonymous access to products"
ON public.products
FOR ALL
TO anon
USING (false);

-- Block anonymous access to coupons table
CREATE POLICY "Deny anonymous access to coupons"
ON public.coupons
FOR ALL
TO anon
USING (false);

-- Block anonymous access to checkouts table
CREATE POLICY "Deny anonymous access to checkouts"
ON public.checkouts
FOR ALL
TO anon
USING (false);

-- Block anonymous access to checkout_components table
CREATE POLICY "Deny anonymous access to checkout_components"
ON public.checkout_components
FOR ALL
TO anon
USING (false);

-- Block anonymous access to checkout_rows table
CREATE POLICY "Deny anonymous access to checkout_rows"
ON public.checkout_rows
FOR ALL
TO anon
USING (false);

-- Block anonymous access to order_bumps table
CREATE POLICY "Deny anonymous access to order_bumps"
ON public.order_bumps
FOR ALL
TO anon
USING (false);

-- Block anonymous access to upsells table
CREATE POLICY "Deny anonymous access to upsells"
ON public.upsells
FOR ALL
TO anon
USING (false);

-- Block anonymous access to downsells table
CREATE POLICY "Deny anonymous access to downsells"
ON public.downsells
FOR ALL
TO anon
USING (false);

-- Block anonymous access to coupon_products table
CREATE POLICY "Deny anonymous access to coupon_products"
ON public.coupon_products
FOR ALL
TO anon
USING (false);

-- Block anonymous access to payment_links table
CREATE POLICY "Deny anonymous access to payment_links"
ON public.payment_links
FOR ALL
TO anon
USING (false);