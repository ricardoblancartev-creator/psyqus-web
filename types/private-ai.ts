// types/private-ai.ts
// Tipos compartidos en todo el módulo PSYQUS PRIVATE AI

export type MessageRole = 'user' | 'assistant';

export type RiskLevel =
  | 'RISK_NONE'
  | 'RISK_STRESS'
  | 'RISK_BURNOUT'
  | 'RISK_HARASSMENT'
  | 'RISK_CRISIS';

export type SessionSource = 'web' | 'telegram';

// ─── DB Types ───────────────────────────────────────────────

export interface AnonymousSession {
  id: string;
  session_token: string;
  source: SessionSource;
  telegram_id?: string | null;
  fingerprint?: string | null;
  org_id?: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  tokens_used: number;
  sentiment_score: number | null;
  risk_flag: string;
  created_at: string;
  expires_at: string;
}

export interface OrgSentimentSnapshot {
  id: string;
  org_id: string;
  snapshot_date: string;
  total_sessions: number;
  avg_sentiment: number | null;
  risk_distribution: RiskDistribution;
  top_themes: string[];
  crisis_count: number;
  created_at: string;
}

export interface RiskDistribution {
  none: number;
  stress: number;
  burnout: number;
  harassment: number;
  crisis: number;
}

// ─── API Types ───────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  sessionToken: string;
}

export interface ChatResponse {
  response: string;
  suggest_buzon: boolean;
  suggest_crisis_line: boolean;
  risk_level?: RiskLevel;
}

export interface AIRawResponse {
  response: string;
  risk_level: RiskLevel;
  sentiment: number;
  suggest_buzon: boolean;
  suggest_crisis_line: boolean;
}

export interface SessionCreateRequest {
  source?: SessionSource;
  orgId?: string;
  telegramId?: string;
}

export interface SessionCreateResponse {
  sessionToken: string;
  expiresAt: string;
}

export interface DestroyResponse {
  success: boolean;
  deleted_messages?: number;
  error?: string;
}

// ─── UI Types ────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  suggest_buzon?: boolean;
  suggest_crisis_line?: boolean;
}

export interface PrivateChatState {
  messages: ChatMessage[];
  sessionToken: string | null;
  isLoading: boolean;
  isDestroyed: boolean;
  expiresAt: Date | null;
  error: string | null;
}

// ─── Analytics Types ─────────────────────────────────────────

export interface OrgAnalytics {
  period: '7d' | '30d' | '90d';
  snapshots: OrgSentimentSnapshot[];
  aggregated: {
    avgSentiment: number;
    totalSessions: number;
    riskTrend: 'improving' | 'stable' | 'worsening';
    topRiskArea: string;
    crisisTotal: number;
  };
}
