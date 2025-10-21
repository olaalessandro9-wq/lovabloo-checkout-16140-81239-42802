-- Adicionar política para admins verem todos os produtos
CREATE POLICY "Admins can view all products" 
ON public.products 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar política para admins editarem todos os produtos
CREATE POLICY "Admins can update all products" 
ON public.products 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar política para admins deletarem todos os produtos
CREATE POLICY "Admins can delete all products" 
ON public.products 
FOR DELETE 
USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar política para admins verem todos os perfis
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));