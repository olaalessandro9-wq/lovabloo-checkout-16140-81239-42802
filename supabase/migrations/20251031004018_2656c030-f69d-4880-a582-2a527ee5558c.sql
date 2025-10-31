-- FASE 3: Corrigir RPC clone_checkout_deep_v5 (remover duplicação da coluna design)
-- FASE 5: Adicionar índices de performance

-- 1) Recriar clone_checkout_deep_v5 sem duplicação de 'design'
CREATE OR REPLACE FUNCTION public.clone_checkout_deep_v5(p_src uuid, p_dst uuid)
RETURNS void
LANGUAGE plpgsql
AS $function$
DECLARE
  v_cols_json   text;
  v_cols_style  text;
  v_sql         text;
  v_found_src   boolean;
BEGIN
  -- Verificar se checkout origem existe
  SELECT EXISTS (SELECT 1 FROM public.checkouts WHERE id = p_src) INTO v_found_src;
  IF NOT v_found_src THEN
    RAISE EXCEPTION 'checkout origem % não encontrado', p_src USING ERRCODE = 'P0001';
  END IF;

  -- Descobrir colunas JSON/JSONB existentes
  SELECT string_agg(quote_ident(column_name) || ' = COALESCE(d.' || quote_ident(column_name) || ', s.' || quote_ident(column_name) || ')', ', ')
  INTO v_cols_json
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'checkouts'
    AND data_type IN ('json', 'jsonb')
    AND column_name NOT IN ('id', 'product_id', 'created_at', 'updated_at', 'slug', 'visits_count', 'is_default');

  -- Descobrir colunas de estilo/cores
  SELECT string_agg(quote_ident(column_name) || ' = COALESCE(d.' || quote_ident(column_name) || ', s.' || quote_ident(column_name) || ')', ', ')
  INTO v_cols_style
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name   = 'checkouts'
    AND column_name IN ('primary_color','secondary_color','background_color','text_color','button_color','button_text_color','form_background_color','selected_payment_color','font','seller_name','name')
    AND column_name NOT IN ('id', 'product_id', 'created_at', 'updated_at', 'slug', 'visits_count', 'is_default');

  -- Construir SQL dinâmico
  v_sql := 'UPDATE public.checkouts d SET ' ||
    COALESCE(v_cols_json, '') ||
    CASE WHEN v_cols_json IS NOT NULL AND v_cols_style IS NOT NULL THEN ', ' ELSE '' END ||
    COALESCE(v_cols_style, '') ||
    ' FROM public.checkouts s WHERE s.id = $1 AND d.id = $2';

  -- Executar se houver colunas para copiar
  IF v_cols_json IS NOT NULL OR v_cols_style IS NOT NULL THEN
    EXECUTE v_sql USING p_src, p_dst;
  END IF;

  -- Clonar componentes se existirem
  IF EXISTS (SELECT 1 FROM public.checkout_components WHERE row_id = p_src) THEN
    INSERT INTO public.checkout_components (row_id, component_order, type, content)
    SELECT p_dst, component_order, type, content
    FROM public.checkout_components
    WHERE row_id = p_src
    ORDER BY component_order;
  END IF;

  RAISE LOG 'clone_checkout_deep_v5: copiado layout de % para %', p_src, p_dst;
END;
$function$;

-- 2) Adicionar índices de performance
CREATE INDEX IF NOT EXISTS idx_payment_links_offer_id ON public.payment_links(offer_id);
CREATE INDEX IF NOT EXISTS idx_checkout_links_checkout_id ON public.checkout_links(checkout_id);
CREATE INDEX IF NOT EXISTS idx_offers_product_id_default ON public.offers(product_id, is_default);

COMMENT ON INDEX idx_payment_links_offer_id IS 'Performance para buscar links por oferta';
COMMENT ON INDEX idx_checkout_links_checkout_id IS 'Performance para buscar links por checkout';
COMMENT ON INDEX idx_offers_product_id_default IS 'Performance para buscar oferta padrão do produto';