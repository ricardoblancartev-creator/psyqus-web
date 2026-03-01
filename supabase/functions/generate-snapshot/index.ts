// supabase/functions/generate-snapshot/index.ts
// Agrega métricas diarias por organización ANTES de que el cron borre los mensajes
// Deploy: supabase functions deploy generate-snapshot

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Verificar que viene del cron (Authorization header)
  const auth = req.headers.get('Authorization');
  if (auth !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  let processedOrgs = 0;
  let skippedOrgs = 0;

  try {
    // Obtener todas las organizaciones que tienen sesiones activas hoy
    const { data: activeOrgs } = await supabase
      .from('anonymous_sessions')
      .select('org_id')
      .gte('created_at', yesterday)
      .not('org_id', 'is', null);

    // Deduplicar org_ids
    const uniqueOrgIds = [...new Set((activeOrgs || []).map((s: any) => s.org_id))];

    for (const orgId of uniqueOrgIds) {
      // Obtener todos los mensajes del día para esta org
      // Solo mensajes de usuarios (no respuestas del bot)
      const { data: msgs } = await supabase
        .from('session_messages')
        .select('sentiment_score, risk_flag, session_id')
        .eq('role', 'user')
        .gte('created_at', yesterday)
        .filter(
          'session_id',
          'in',
          `(SELECT id FROM anonymous_sessions WHERE org_id = '${orgId}' AND created_at >= '${yesterday}')`
        );

      if (!msgs || msgs.length < 5) {
        // Mínimo 5 mensajes para garantizar anonimato
        skippedOrgs++;
        continue;
      }

      // Calcular métricas agregadas
      const totalMessages = msgs.length;
      const uniqueSessions = new Set(msgs.map((m: any) => m.session_id)).size;

      const avgSentiment =
        msgs.reduce((acc: number, m: any) => acc + (m.sentiment_score || 0), 0) / totalMessages;

      const riskDist = msgs.reduce(
        (acc: Record<string, number>, m: any) => {
          const flag = m.risk_flag || 'none';
          acc[flag] = (acc[flag] || 0) + 1;
          return acc;
        },
        { none: 0, stress: 0, burnout: 0, harassment: 0, crisis: 0 }
      );

      const crisisCount = riskDist.crisis || 0;

      // Guardar o actualizar snapshot del día
      const { error } = await supabase.from('org_sentiment_snapshots').upsert(
        {
          org_id: orgId,
          snapshot_date: today,
          total_sessions: uniqueSessions,
          avg_sentiment: parseFloat(avgSentiment.toFixed(4)),
          risk_distribution: riskDist,
          crisis_count: crisisCount,
          created_at: new Date().toISOString(),
        },
        { onConflict: 'org_id,snapshot_date' }
      );

      if (!error) processedOrgs++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed_orgs: processedOrgs,
        skipped_orgs: skippedOrgs,
        date: today,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Snapshot generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
