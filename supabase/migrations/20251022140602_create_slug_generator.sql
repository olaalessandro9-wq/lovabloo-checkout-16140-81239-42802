-- Migração 3: Criar função para gerar slug único para checkouts

CREATE OR REPLACE FUNCTION generate_checkout_slug()
RETURNS text AS $$
DECLARE
  new_slug text;
  slug_exists boolean;
  attempts integer := 0;
  max_attempts integer := 100;
BEGIN
  LOOP
    -- Gerar slug aleatório: 7 caracteres alfanuméricos + underscore + 6 dígitos
    -- Formato: 397jozo_577062
    new_slug := lower(substring(md5(random()::text || clock_timestamp()::text) from 1 for 7)) || '_' || 
                lpad(floor(random() * 1000000)::text, 6, '0');
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM checkouts WHERE slug = new_slug) INTO slug_exists;
    
    -- Incrementar contador de tentativas
    attempts := attempts + 1;
    
    -- Sair se slug é único ou se atingiu máximo de tentativas
    EXIT WHEN NOT slug_exists OR attempts >= max_attempts;
  END LOOP;
  
  -- Se atingiu máximo de tentativas, lançar erro
  IF attempts >= max_attempts THEN
    RAISE EXCEPTION 'Não foi possível gerar slug único após % tentativas', max_attempts;
  END IF;
  
  RETURN new_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION generate_checkout_slug() IS 'Gera slug único para checkout no formato: 7chars_6digits (ex: 397jozo_577062)';

