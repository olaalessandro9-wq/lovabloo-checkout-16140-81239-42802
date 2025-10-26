-- ============================================
-- SETUP CRON JOBS
-- ============================================
-- 
-- Este script configura os cron jobs para:
-- 1. Detectar checkouts abandonados (a cada 10 min)
-- 2. Reprocessar webhooks falhados (a cada 5 min)
--
-- IMPORTANTE: Substitua as URLs e secrets antes de executar!
-- ============================================

-- ============================================
-- 1. DETECTAR CHECKOUTS ABANDONADOS
-- ============================================
-- Executa a cada 10 minutos
-- Detecta sessões inativas > 30 min e marca como abandonadas

SELECT cron.schedule(
  'detect-abandoned-checkouts',
  '*/10 * * * *', -- A cada 10 minutos
  $$
  SELECT net.http_post(
    url := 'https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/detect-abandoned-checkouts',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET_HERE'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================
-- 2. REPROCESSAR WEBHOOKS FALHADOS
-- ============================================
-- Executa a cada 5 minutos
-- Reprocessa webhooks pendentes de retry com exponential backoff

SELECT cron.schedule(
  'retry-webhooks',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT net.http_post(
    url := 'https://wivbtmtgpsxupfjwwovf.supabase.co/functions/v1/retry-webhooks',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_CRON_SECRET_HERE'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================
-- VERIFICAR CRON JOBS CONFIGURADOS
-- ============================================
-- Execute este comando para ver os cron jobs ativos:
-- SELECT * FROM cron.job;

-- ============================================
-- REMOVER CRON JOBS (SE NECESSÁRIO)
-- ============================================
-- SELECT cron.unschedule('detect-abandoned-checkouts');
-- SELECT cron.unschedule('retry-webhooks');

-- ============================================
-- LOGS DOS CRON JOBS
-- ============================================
-- Para ver os logs de execução:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 100;

