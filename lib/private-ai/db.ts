// lib/private-ai/db.ts
// Helpers de base de datos para el módulo Private AI
// Usa service_role para bypass de RLS (solo server-side)

import { createClient } from '@supabase/supabase-js';
import type {
  AnonymousSession,
  SessionMessage,
  RiskDistribution,
} from '@/types/private-ai';

// Client con service_role — NUNCA exponer al cliente
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: { persistSession: false },
  }
);

// ─── SESIONES ─────────────────────────────────────────────────

export async function getOrCreateSession(
  sessionToken: string,
  orgId?: string,
  source: 'web' | 'telegram' = 'web',
  telegramId?: string
): Promise<AnonymousSession> {
  // Buscar sesión existente y activa
  const { data: existing } = await supabaseAdmin
    .from('anonymous_sessions')
    .select('*')
    .eq('session_token', sessionToken)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (existing) {
    // Actualizar last_seen_at
    await supabaseAdmin
      .from('anonymous_sessions')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', existing.id);
    return existing as AnonymousSession;
  }

  // Crear nueva sesión
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabaseAdmin
    .from('anonymous_sessions')
    .insert({
      session_token: sessionToken,
      source,
      org_id: orgId || null,
      telegram_id: telegramId || null,
      expires_at: expiresAt,
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data as AnonymousSession;
}

// ─── MENSAJES ─────────────────────────────────────────────────

export async function getSessionHistory(
  sessionId: string,
  limit = 10
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const { data, error } = await supabaseAdmin
    .from('session_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) return [];
  return (data || []) as Array<{ role: 'user' | 'assistant'; content: string }>;
}

export async function saveMessages(
  sessionId: string,
  userContent: string,
  assistantContent: string,
  sentimentScore: number,
  riskFlag: string,
  tokensUsed: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabaseAdmin.from('session_messages').insert([
    {
      session_id: sessionId,
      role: 'user',
      content: userContent,
      expires_at: expiresAt,
    },
    {
      session_id: sessionId,
      role: 'assistant',
      content: assistantContent,
      sentiment_score: sentimentScore,
      risk_flag: riskFlag.toLowerCase().replace('risk_', ''),
      tokens_used: tokensUsed,
      expires_at: expiresAt,
    },
  ]);

  if (error) throw new Error(`Failed to save messages: ${error.message}`);
}

// ─── SNAPSHOTS AGREGADOS ──────────────────────────────────────

export async function updateOrgSnapshot(
  orgId: string,
  sentiment: number,
  riskFlag: string
): Promise<void> {
  if (!orgId) return;

  const today = new Date().toISOString().split('T')[0];

  // Obtener snapshot actual del día
  const { data: existing } = await supabaseAdmin
    .from('org_sentiment_snapshots')
    .select('*')
    .eq('org_id', orgId)
    .eq('snapshot_date', today)
    .single();

  if (existing) {
    const currentDist = (existing.risk_distribution || {}) as RiskDistribution;
    const normalizedFlag = riskFlag.toLowerCase().replace('risk_', '') as keyof RiskDistribution;
    currentDist[normalizedFlag] = (currentDist[normalizedFlag] || 0) + 1;

    // Calcular nuevo promedio de sentimiento
    const newTotal = existing.total_sessions + 1;
    const newAvg =
      ((existing.avg_sentiment || 0) * existing.total_sessions + sentiment) / newTotal;

    await supabaseAdmin
      .from('org_sentiment_snapshots')
      .update({
        total_sessions: newTotal,
        avg_sentiment: newAvg,
        risk_distribution: currentDist,
        crisis_count:
          riskFlag === 'RISK_CRISIS'
            ? existing.crisis_count + 1
            : existing.crisis_count,
      })
      .eq('id', existing.id);
  } else {
    const dist: RiskDistribution = {
      none: 0,
      stress: 0,
      burnout: 0,
      harassment: 0,
      crisis: 0,
    };
    const normalizedFlag = riskFlag.toLowerCase().replace('risk_', '') as keyof RiskDistribution;
    dist[normalizedFlag] = 1;

    await supabaseAdmin.from('org_sentiment_snapshots').insert({
      org_id: orgId,
      snapshot_date: today,
      total_sessions: 1,
      avg_sentiment: sentiment,
      risk_distribution: dist,
      crisis_count: riskFlag === 'RISK_CRISIS' ? 1 : 0,
    });
  }
}

export async function getOrgSnapshots(
  orgId: string,
  days = 30
): Promise<any[]> {
  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabaseAdmin
    .from('org_sentiment_snapshots')
    .select('*')
    .eq('org_id', orgId)
    .gte('snapshot_date', fromDate)
    .order('snapshot_date', { ascending: true });

  if (error) return [];
  return data || [];
}

export { supabaseAdmin };
