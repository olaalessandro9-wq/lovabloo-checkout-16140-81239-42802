-- Migração 8: Remover política restritiva que bloqueia todos os acessos

-- Remove a política RESTRICTIVE que estava bloqueando TODOS os acessos
-- Essa política tinha qual: false, o que negava tudo
DROP POLICY IF EXISTS "Deny all access to checkouts by default" ON checkouts;

-- Comentário
COMMENT ON TABLE checkouts IS 'Tabela de checkouts com RLS configurado. Usuários podem ver/editar apenas seus próprios checkouts através de product_id.';

