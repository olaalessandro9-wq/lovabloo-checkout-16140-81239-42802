-- Drop all existing "Deny anonymous access" PERMISSIVE policies
DROP POLICY IF EXISTS "Deny anonymous access to affiliates" ON public.affiliates;
DROP POLICY IF EXISTS "Deny anonymous access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Deny anonymous access to products" ON public.products;
DROP POLICY IF EXISTS "Deny anonymous access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Deny anonymous access to checkouts" ON public.checkouts;
DROP POLICY IF EXISTS "Deny anonymous access to checkout_components" ON public.checkout_components;
DROP POLICY IF EXISTS "Deny anonymous access to checkout_rows" ON public.checkout_rows;
DROP POLICY IF EXISTS "Deny anonymous access to order_bumps" ON public.order_bumps;
DROP POLICY IF EXISTS "Deny anonymous access to upsells" ON public.upsells;
DROP POLICY IF EXISTS "Deny anonymous access to downsells" ON public.downsells;
DROP POLICY IF EXISTS "Deny anonymous access to coupon_products" ON public.coupon_products;
DROP POLICY IF EXISTS "Deny anonymous access to payment_links" ON public.payment_links;
DROP POLICY IF EXISTS "Deny anonymous access to user_roles" ON public.user_roles;

-- Create RESTRICTIVE policies that deny all access by default for affiliates
CREATE POLICY "Deny all access to affiliates by default" 
ON public.affiliates 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for profiles
CREATE POLICY "Deny all access to profiles by default" 
ON public.profiles 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for products
CREATE POLICY "Deny all access to products by default" 
ON public.products 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for coupons
CREATE POLICY "Deny all access to coupons by default" 
ON public.coupons 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for checkouts
CREATE POLICY "Deny all access to checkouts by default" 
ON public.checkouts 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for checkout_components
CREATE POLICY "Deny all access to checkout_components by default" 
ON public.checkout_components 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for checkout_rows
CREATE POLICY "Deny all access to checkout_rows by default" 
ON public.checkout_rows 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for order_bumps
CREATE POLICY "Deny all access to order_bumps by default" 
ON public.order_bumps 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for upsells
CREATE POLICY "Deny all access to upsells by default" 
ON public.upsells 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for downsells
CREATE POLICY "Deny all access to downsells by default" 
ON public.downsells 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for coupon_products
CREATE POLICY "Deny all access to coupon_products by default" 
ON public.coupon_products 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for payment_links
CREATE POLICY "Deny all access to payment_links by default" 
ON public.payment_links 
AS RESTRICTIVE
FOR ALL 
USING (false);

-- Create RESTRICTIVE policies that deny all access by default for user_roles
CREATE POLICY "Deny all access to user_roles by default" 
ON public.user_roles 
AS RESTRICTIVE
FOR ALL 
USING (false);