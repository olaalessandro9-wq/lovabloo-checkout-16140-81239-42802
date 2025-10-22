-- Fix remaining anonymous access gaps on profiles and affiliates tables
-- These policies were missing FOR ALL coverage for anonymous users

-- Block ALL anonymous operations on profiles (not just SELECT)
CREATE POLICY "Deny all anonymous operations on profiles"
ON public.profiles
FOR ALL
TO anon
USING (false);

-- Block ALL anonymous operations on affiliates (not just SELECT)  
CREATE POLICY "Deny all anonymous operations on affiliates"
ON public.affiliates
FOR ALL
TO anon
USING (false);