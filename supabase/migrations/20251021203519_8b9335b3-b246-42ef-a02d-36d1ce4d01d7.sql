-- Add explicit denial policies for anonymous users to prevent public data exposure

-- Deny anonymous access to profiles (contains PII: names, phones, CPF/CNPJ)
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Deny anonymous access to coupons
CREATE POLICY "Deny anonymous access to coupons"
ON public.coupons
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to coupon_products
CREATE POLICY "Deny anonymous access to coupon_products"
ON public.coupon_products
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to checkouts
CREATE POLICY "Deny anonymous access to checkouts"
ON public.checkouts
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to checkout_rows
CREATE POLICY "Deny anonymous access to checkout_rows"
ON public.checkout_rows
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to checkout_components
CREATE POLICY "Deny anonymous access to checkout_components"
ON public.checkout_components
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to order_bumps
CREATE POLICY "Deny anonymous access to order_bumps"
ON public.order_bumps
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to upsells
CREATE POLICY "Deny anonymous access to upsells"
ON public.upsells
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to downsells
CREATE POLICY "Deny anonymous access to downsells"
ON public.downsells
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to payment_links
CREATE POLICY "Deny anonymous access to payment_links"
ON public.payment_links
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to affiliates
CREATE POLICY "Deny anonymous access to affiliates"
ON public.affiliates
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to products
CREATE POLICY "Deny anonymous access to products"
ON public.products
FOR ALL
TO anon
USING (false);

-- Deny anonymous access to user_roles
CREATE POLICY "Deny anonymous access to user_roles"
ON public.user_roles
FOR ALL
TO anon
USING (false);