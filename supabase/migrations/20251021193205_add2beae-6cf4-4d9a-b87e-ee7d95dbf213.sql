-- Criar tabela de payment links
CREATE TABLE public.payment_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  price numeric NOT NULL,
  url text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payment links"
  ON public.payment_links FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own payment links"
  ON public.payment_links FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own payment links"
  ON public.payment_links FOR UPDATE
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own payment links"
  ON public.payment_links FOR DELETE
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all payment links"
  ON public.payment_links FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Criar tabela de affiliates
CREATE TABLE public.affiliates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  commission_percentage numeric NOT NULL,
  code text NOT NULL UNIQUE,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own affiliates"
  ON public.affiliates FOR SELECT
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert their own affiliates"
  ON public.affiliates FOR INSERT
  WITH CHECK (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own affiliates"
  ON public.affiliates FOR UPDATE
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own affiliates"
  ON public.affiliates FOR DELETE
  USING (product_id IN (SELECT id FROM public.products WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage all affiliates"
  ON public.affiliates FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Criar tabela de upsells
CREATE TABLE public.upsells (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id uuid REFERENCES public.checkouts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.upsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for upsells"
  ON public.upsells FOR ALL
  USING (true)
  WITH CHECK (true);

-- Criar tabela de downsells
CREATE TABLE public.downsells (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checkout_id uuid REFERENCES public.checkouts(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.downsells ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for downsells"
  ON public.downsells FOR ALL
  USING (true)
  WITH CHECK (true);

-- Adicionar relação entre cupons e produtos
CREATE TABLE public.coupon_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id uuid REFERENCES public.coupons(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  UNIQUE(coupon_id, product_id)
);

ALTER TABLE public.coupon_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for coupon_products"
  ON public.coupon_products FOR ALL
  USING (true)
  WITH CHECK (true);

-- Adicionar coluna link_id ao checkouts para relacionar com payment_links
ALTER TABLE public.checkouts ADD COLUMN IF NOT EXISTS link_id uuid REFERENCES public.payment_links(id) ON DELETE SET NULL;

-- Triggers para updated_at
CREATE TRIGGER update_payment_links_updated_at
  BEFORE UPDATE ON public.payment_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();