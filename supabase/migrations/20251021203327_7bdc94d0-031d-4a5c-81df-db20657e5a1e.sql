-- Fix RLS policies for all tables to prevent public data exposure

-- 1. Fix profiles table - Already has good policies, just ensure they're the only ones
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.profiles;

-- 2. Fix coupons table - Only allow access through product ownership
DROP POLICY IF EXISTS "Enable read access for all users" ON public.coupons;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.coupons;
DROP POLICY IF EXISTS "Enable update for all users" ON public.coupons;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.coupons;

CREATE POLICY "Users can view coupons for their products"
ON public.coupons
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.coupon_products cp
    JOIN public.products p ON p.id = cp.product_id
    WHERE cp.coupon_id = coupons.id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert coupons for their products"
ON public.coupons
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.coupon_products cp
    JOIN public.products p ON p.id = cp.product_id
    WHERE cp.coupon_id = coupons.id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update coupons for their products"
ON public.coupons
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.coupon_products cp
    JOIN public.products p ON p.id = cp.product_id
    WHERE cp.coupon_id = coupons.id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete coupons for their products"
ON public.coupons
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.coupon_products cp
    JOIN public.products p ON p.id = cp.product_id
    WHERE cp.coupon_id = coupons.id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all coupons"
ON public.coupons
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. Fix coupon_products table
DROP POLICY IF EXISTS "Enable all access for coupon_products" ON public.coupon_products;

CREATE POLICY "Users can view coupon_products for their products"
ON public.coupon_products
FOR SELECT
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert coupon_products for their products"
ON public.coupon_products
FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update coupon_products for their products"
ON public.coupon_products
FOR UPDATE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete coupon_products for their products"
ON public.coupon_products
FOR DELETE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all coupon_products"
ON public.coupon_products
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. Fix checkouts table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.checkouts;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.checkouts;
DROP POLICY IF EXISTS "Enable update for all users" ON public.checkouts;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.checkouts;

CREATE POLICY "Users can view their own checkouts"
ON public.checkouts
FOR SELECT
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own checkouts"
ON public.checkouts
FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own checkouts"
ON public.checkouts
FOR UPDATE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own checkouts"
ON public.checkouts
FOR DELETE
USING (
  product_id IN (
    SELECT id FROM public.products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all checkouts"
ON public.checkouts
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Fix checkout_rows table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.checkout_rows;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.checkout_rows;
DROP POLICY IF EXISTS "Enable update for all users" ON public.checkout_rows;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.checkout_rows;

CREATE POLICY "Users can view their own checkout_rows"
ON public.checkout_rows
FOR SELECT
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own checkout_rows"
ON public.checkout_rows
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own checkout_rows"
ON public.checkout_rows
FOR UPDATE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own checkout_rows"
ON public.checkout_rows
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all checkout_rows"
ON public.checkout_rows
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. Fix checkout_components table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.checkout_components;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.checkout_components;
DROP POLICY IF EXISTS "Enable update for all users" ON public.checkout_components;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.checkout_components;

CREATE POLICY "Users can view their own checkout_components"
ON public.checkout_components
FOR SELECT
USING (
  row_id IN (
    SELECT cr.id FROM public.checkout_rows cr
    JOIN public.checkouts c ON c.id = cr.checkout_id
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own checkout_components"
ON public.checkout_components
FOR INSERT
WITH CHECK (
  row_id IN (
    SELECT cr.id FROM public.checkout_rows cr
    JOIN public.checkouts c ON c.id = cr.checkout_id
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own checkout_components"
ON public.checkout_components
FOR UPDATE
USING (
  row_id IN (
    SELECT cr.id FROM public.checkout_rows cr
    JOIN public.checkouts c ON c.id = cr.checkout_id
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own checkout_components"
ON public.checkout_components
FOR DELETE
USING (
  row_id IN (
    SELECT cr.id FROM public.checkout_rows cr
    JOIN public.checkouts c ON c.id = cr.checkout_id
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all checkout_components"
ON public.checkout_components
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. Fix order_bumps table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.order_bumps;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.order_bumps;
DROP POLICY IF EXISTS "Enable update for all users" ON public.order_bumps;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.order_bumps;

CREATE POLICY "Users can view their own order_bumps"
ON public.order_bumps
FOR SELECT
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order_bumps"
ON public.order_bumps
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own order_bumps"
ON public.order_bumps
FOR UPDATE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own order_bumps"
ON public.order_bumps
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all order_bumps"
ON public.order_bumps
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. Fix upsells table
DROP POLICY IF EXISTS "Enable all access for upsells" ON public.upsells;

CREATE POLICY "Users can view their own upsells"
ON public.upsells
FOR SELECT
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own upsells"
ON public.upsells
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own upsells"
ON public.upsells
FOR UPDATE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own upsells"
ON public.upsells
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all upsells"
ON public.upsells
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. Fix downsells table
DROP POLICY IF EXISTS "Enable all access for downsells" ON public.downsells;

CREATE POLICY "Users can view their own downsells"
ON public.downsells
FOR SELECT
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own downsells"
ON public.downsells
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own downsells"
ON public.downsells
FOR UPDATE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own downsells"
ON public.downsells
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id FROM public.checkouts c
    JOIN public.products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all downsells"
ON public.downsells
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));