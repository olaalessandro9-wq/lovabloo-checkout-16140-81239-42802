-- Add explicit policy to block anonymous access to profiles table
CREATE POLICY "Deny anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Add INSERT policy for users to create their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Add explicit policy to block anonymous access to affiliates table
CREATE POLICY "Deny anonymous access to affiliates"
ON public.affiliates
FOR SELECT
TO anon
USING (false);