-- Migração 6: Criar função para incrementar contador de visitas

CREATE OR REPLACE FUNCTION increment_checkout_visits(checkout_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE checkouts 
  SET visits_count = visits_count + 1 
  WHERE id = checkout_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário
COMMENT ON FUNCTION increment_checkout_visits(uuid) IS 'Incrementa o contador de visitas de um checkout';

