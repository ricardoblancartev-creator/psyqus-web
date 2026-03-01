// app/api/private-ai/analytics/route.ts
// Analytics para el dashboard admin (datos SOLO agregados, nunca individuales)

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOrgSnapshots } from '@/lib/private-ai/db';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Verificar autenticación del admin
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener orgId del admin autenticado
    const { data: profile } = await supabase
      .from('profiles') // Ajusta al nombre de tu tabla
      .select('org_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.org_id) {
      return NextResponse.json({ error: 'Sin organización asignada' }, { status: 403 });
    }

    if (!['admin', 'specialist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Sin permisos' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const snapshots = await getOrgSnapshots(profile.org_id, days);

    if (snapshots.length === 0) {
      return NextResponse.json({
        snapshots: [],
        aggregated: null,
        message: 'No hay datos suficientes aún.',
      });
    }

    // Calcular métricas agregadas del período
    const totalSessions = snapshots.reduce((a, s) => a + s.total_sessions, 0);
    const avgSentiment =
      snapshots.reduce((a, s) => a + (s.avg_sentiment || 0) * s.total_sessions, 0) /
      totalSessions;

    // Calcular tendencia comparando primera mitad vs segunda mitad
    const mid = Math.floor(snapshots.length / 2);
    const firstHalf = snapshots.slice(0, mid);
    const secondHalf = snapshots.slice(mid);
    const firstAvg = firstHalf.reduce((a, s) => a + (s.avg_sentiment || 0), 0) / (firstHalf.length || 1);
    const secondAvg = secondHalf.reduce((a, s) => a + (s.avg_sentiment || 0), 0) / (secondHalf.length || 1);

    let riskTrend: 'improving' | 'stable' | 'worsening' = 'stable';
    if (secondAvg - firstAvg > 0.1) riskTrend = 'improving';
    if (firstAvg - secondAvg > 0.1) riskTrend = 'worsening';

    // Distribución total de riesgos
    const totalDist = snapshots.reduce(
      (acc, s) => {
        const d = s.risk_distribution || {};
        Object.keys(d).forEach((k) => {
          acc[k] = (acc[k] || 0) + (d[k] || 0);
        });
        return acc;
      },
      {} as Record<string, number>
    );

    // Encontrar área de mayor riesgo
    const riskEntries = Object.entries(totalDist).filter(([k]) => k !== 'none');
    const topRiskEntry = riskEntries.sort(([, a], [, b]) => (b as number) - (a as number))[0];
    const topRiskArea = topRiskEntry ? topRiskEntry[0] : 'ninguno';

    const crisisTotal = snapshots.reduce((a, s) => a + (s.crisis_count || 0), 0);

    // IMPORTANTE: Ocultar datos si hay menos de 5 sesiones totales (anonimato)
    if (totalSessions < 5) {
      return NextResponse.json({
        snapshots: [],
        aggregated: null,
        message: 'Datos no disponibles. Se necesitan al menos 5 conversaciones para mostrar métricas.',
        privacy_note: true,
      });
    }

    return NextResponse.json({
      snapshots, // Para gráficas de tendencia
      aggregated: {
        avgSentiment: parseFloat(avgSentiment.toFixed(3)),
        totalSessions,
        riskTrend,
        topRiskArea,
        crisisTotal,
        riskDistribution: totalDist,
        period: `${days} días`,
      },
    });
  } catch (error) {
    console.error('[analytics] Error:', error);
    return NextResponse.json({ error: 'Error al obtener métricas' }, { status: 500 });
  }
}
