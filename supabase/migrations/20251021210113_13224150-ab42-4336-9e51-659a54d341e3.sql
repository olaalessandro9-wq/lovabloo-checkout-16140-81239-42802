-- Add input validation constraints to products table
ALTER TABLE public.products
ADD CONSTRAINT products_price_positive CHECK (price > 0),
ADD CONSTRAINT products_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
ADD CONSTRAINT products_description_length CHECK (description IS NULL OR char_length(description) <= 500);

-- Add input validation constraints to coupons table
ALTER TABLE public.coupons
ADD CONSTRAINT coupons_discount_type_valid CHECK (discount_type IN ('percentage', 'fixed')),
ADD CONSTRAINT coupons_discount_value_valid CHECK (discount_value >= 0 AND discount_value <= 100),
ADD CONSTRAINT coupons_code_length CHECK (char_length(code) BETWEEN 1 AND 50),
ADD CONSTRAINT coupons_code_format CHECK (code ~ '^[A-Z0-9-]+$');