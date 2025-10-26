import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * Job agendado para detectar checkouts abandonados
 * 
 * Executa a cada 10-15 minutos via cron
 * Marca como abandonado se:
 * - status = 'active'
 * - order.status in ('initiated', 'pix_pending')
 * - last_seen_at < now() - 30 minutes
 */

Deno.serve(async (req: Request) => {
  try {
    // Validar chave secreta (para evitar execução não autorizada)
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Conectar ao Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('[Abandono] Iniciando detecção...');

    // 1) Buscar sessões abandonadas
    const abandonThresholdMinutes = 30;
    const abandonThreshold = new Date(Date.now() - abandonThresholdMinutes * 60 * 1000);

    const { data: abandonedSessions, error: selectError } = await supabase
      .from('checkout_sessions')
      .select(`
        id,
        order_id,
        orders!inner (
          id,
          vendor_id,
          status
        )
      `)
      .eq('status', 'active')
      .in('orders.status', ['initiated', 'pix_pending'])
      .lt('last_seen_at', abandonThreshold.toISOString());

    if (selectError) {
      throw selectError;
    }

    if (!abandonedSessions || abandonedSessions.length === 0) {
      console.log('[Abandono] Nenhuma sessão abandonada encontrada');
      return new Response(
        JSON.stringify({ message: 'ok', abandoned: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Abandono] Encontradas ${abandonedSessions.length} sessões abandonadas`);

    // 2) Processar cada sessão abandonada
    const results = [];
    
    for (const session of abandonedSessions) {
      const orderId = session.order_id;
      const order = (session as any).orders;
      
      try {
        // 2.1) Atualizar sessão
        await supabase
          .from('checkout_sessions')
          .update({ status: 'abandoned' })
          .eq('id', session.id);

        // 2.2) Atualizar pedido
        await supabase
          .from('orders')
          .update({
            status: 'abandoned',
            updated_at: new Date().toISOString(),
          })
          .eq('id', orderId);

        // 2.3) Registrar evento
        await supabase
          .from('order_events')
          .insert({
            order_id: orderId,
            vendor_id: order.vendor_id,
            type: 'CHECKOUT_ABANDONED',
            occurred_at: new Date().toISOString(),
            gateway_event_id: `abandoned-${orderId}-${Date.now()}`,
            data: {
              reason: 'inactivity',
              threshold_minutes: abandonThresholdMinutes,
            },
          });

        console.log(`[Abandono] Processado: order_id=${orderId}`);
        results.push({ orderId, status: 'ok' });

        // TODO: Publicar evento para n8n/webhooks (Fase 5 e 6)
        // await publishToN8n({ orderId, eventType: 'CHECKOUT_ABANDONED' });

      } catch (error) {
        console.error(`[Abandono] Erro ao processar order_id=${orderId}:`, error);
        results.push({ orderId, status: 'error', error: error.message });
      }
    }

    console.log(`[Abandono] Concluído: ${results.length} sessões processadas`);

    return new Response(
      JSON.stringify({
        message: 'ok',
        abandoned: results.length,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Abandono] Erro geral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

