-- Enable RLS on tables without protection
ALTER TABLE public.checkout_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

-- Policies for checkout_links
CREATE POLICY "Users can view their own checkout_links"
ON public.checkout_links
FOR SELECT
USING (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own checkout_links"
ON public.checkout_links
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own checkout_links"
ON public.checkout_links
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all checkout_links"
ON public.checkout_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for offers
CREATE POLICY "Users can view their own offers"
ON public.offers
FOR SELECT
USING (
  product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own offers"
ON public.offers
FOR INSERT
WITH CHECK (
  product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own offers"
ON public.offers
FOR UPDATE
USING (
  product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own offers"
ON public.offers
FOR DELETE
USING (
  product_id IN (
    SELECT id FROM products WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all offers"
ON public.offers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for payment_links
-- Allow public read access for checkout pages
CREATE POLICY "Anyone can view active payment_links"
ON public.payment_links
FOR SELECT
USING (status = 'active');

CREATE POLICY "Users can insert their own payment_links"
ON public.payment_links
FOR INSERT
WITH CHECK (
  offer_id IN (
    SELECT o.id
    FROM offers o
    JOIN products p ON p.id = o.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own payment_links"
ON public.payment_links
FOR UPDATE
USING (
  offer_id IN (
    SELECT o.id
    FROM offers o
    JOIN products p ON p.id = o.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own payment_links"
ON public.payment_links
FOR DELETE
USING (
  offer_id IN (
    SELECT o.id
    FROM offers o
    JOIN products p ON p.id = o.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all payment_links"
ON public.payment_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for order_bumps
-- Allow public read for active order bumps (needed for checkout pages)
CREATE POLICY "Anyone can view active order_bumps"
ON public.order_bumps
FOR SELECT
USING (active = true);

CREATE POLICY "Users can insert their own order_bumps"
ON public.order_bumps
FOR INSERT
WITH CHECK (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own order_bumps"
ON public.order_bumps
FOR UPDATE
USING (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own order_bumps"
ON public.order_bumps
FOR DELETE
USING (
  checkout_id IN (
    SELECT c.id
    FROM checkouts c
    JOIN products p ON p.id = c.product_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all order_bumps"
ON public.order_bumps
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));