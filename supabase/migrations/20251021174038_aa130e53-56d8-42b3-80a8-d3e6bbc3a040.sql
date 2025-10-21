-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checkouts table
CREATE TABLE public.checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  primary_color TEXT DEFAULT 'hsl(0, 84%, 60%)',
  secondary_color TEXT DEFAULT 'hsl(216, 15%, 14%)',
  background_color TEXT DEFAULT 'hsl(216, 18%, 10%)',
  text_color TEXT DEFAULT 'hsl(210, 20%, 98%)',
  button_color TEXT DEFAULT 'hsl(0, 84%, 60%)',
  button_text_color TEXT DEFAULT 'hsl(0, 0%, 100%)',
  form_background_color TEXT DEFAULT 'hsl(216, 15%, 18%)',
  selected_payment_color TEXT DEFAULT 'hsl(142, 76%, 36%)',
  font TEXT DEFAULT 'Inter',
  seller_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checkout_rows table
CREATE TABLE public.checkout_rows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE NOT NULL,
  row_order INTEGER NOT NULL,
  layout TEXT NOT NULL CHECK (layout IN ('single', 'two-columns', 'two-columns-asymmetric', 'three-columns')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create checkout_components table
CREATE TABLE public.checkout_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  row_id UUID REFERENCES public.checkout_rows(id) ON DELETE CASCADE NOT NULL,
  component_order INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'image', 'advantage', 'seal', 'timer', 'testimonial')),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  uses_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order_bumps table
CREATE TABLE public.order_bumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_id UUID REFERENCES public.checkouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now - adjust based on your needs)
CREATE POLICY "Enable read access for all users" ON public.products FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.checkouts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.checkouts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.checkouts FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.checkout_rows FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.checkout_rows FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.checkout_rows FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.checkout_rows FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.checkout_components FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.checkout_components FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.checkout_components FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.checkout_components FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.coupons FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.coupons FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.coupons FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.order_bumps FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.order_bumps FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.order_bumps FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON public.order_bumps FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_checkouts_updated_at
  BEFORE UPDATE ON public.checkouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();