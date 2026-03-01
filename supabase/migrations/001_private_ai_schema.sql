-- ============================================================
-- PSYQUS PRIVATE AI — Schema Completo
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;  -- Activar en Dashboard > Extensions primero

-- ============================================================
-- 2. TABLA: anonymous_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT NOT NULL UNIQUE,
  source        TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'telegram')),
  telegram_id   TEXT,
  fingerprint   TEXT,
  org_id        UUID,  -- Referencia a tu tabla de organizaciones existente
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token   ON anonymous_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON anonymous_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_sessions_org     ON anonymous_sessions(org_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active  ON anonymous_sessions(is_active, expires_at);

-- ============================================================
-- 3. TABLA: session_messages (TTL 24h)
-- ============================================================
CREATE TABLE IF NOT EXISTS session_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES anonymous_sessions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content         TEXT NOT NULL,
  tokens_used     INTEGER DEFAULT 0,
  sentiment_score FLOAT CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
  risk_flag       TEXT NOT NULL DEFAULT 'none'
                  CHECK (risk_flag IN ('none', 'stress', 'burnout', 'harassment', 'crisis')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE INDEX IF NOT EXISTS idx_messages_session  ON session_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_expires  ON session_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_messages_risk     ON session_messages(risk_flag);
CREATE INDEX IF NOT EXISTS idx_messages_created  ON session_messages(created_at DESC);

-- ============================================================
-- 4. TABLA: org_sentiment_snapshots (datos agregados para admin)
-- NUNCA contiene datos individuales, solo promedios de grupos
-- ============================================================
CREATE TABLE IF NOT EXISTS org_sentiment_snapshots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL,
  snapshot_date     DATE NOT NULL DEFAULT CURRENT_DATE,
  total_sessions    INTEGER NOT NULL DEFAULT 0,
  avg_sentiment     FLOAT,
  risk_distribution JSONB DEFAULT '{"none":0,"stress":0,"burnout":0,"harassment":0,"crisis":0}'::jsonb,
  top_themes        JSONB DEFAULT '[]'::jsonb,
  crisis_count      INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_org_date ON org_sentiment_snapshots(org_id, snapshot_date DESC);

-- ============================================================
-- 5. TABLA: system_cleanup_log (auditoría interna, no de usuarios)
-- ============================================================
CREATE TABLE IF NOT EXISTS system_cleanup_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_sessions  INTEGER NOT NULL DEFAULT 0,
  deleted_messages  INTEGER NOT NULL DEFAULT 0,
  ran_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE anonymous_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_sentiment_snapshots ENABLE ROW LEVEL SECURITY;

-- Las sesiones solo son accesibles via service_role (server-side)
-- El anon key NO tiene acceso directo a estas tablas
CREATE POLICY "service_role_only_sessions" ON anonymous_sessions
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_only_messages" ON session_messages
  USING (auth.role() = 'service_role');

-- Los snapshots son accesibles por admins autenticados de la org
CREATE POLICY "org_admin_snapshots" ON org_sentiment_snapshots
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR (
      auth.role() = 'authenticated'
      AND org_id IN (
        SELECT org_id FROM user_organizations  -- Ajusta al nombre de tu tabla
        WHERE user_id = auth.uid() AND role IN ('admin', 'specialist')
      )
    )
  );

-- ============================================================
-- 7. FUNCIÓN: destroy_session (autodestrucción manual)
-- ============================================================
CREATE OR REPLACE FUNCTION destroy_session(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_msg_count  INTEGER;
BEGIN
  -- Obtener session id
  SELECT id INTO v_session_id
  FROM anonymous_sessions
  WHERE session_token = p_token;

  IF v_session_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;

  -- Contar mensajes que se borrarán
  SELECT COUNT(*) INTO v_msg_count
  FROM session_messages WHERE session_id = v_session_id;

  -- Borrar sesión (CASCADE borra todos sus mensajes)
  DELETE FROM anonymous_sessions WHERE id = v_session_id;

  RETURN jsonb_build_object(
    'success', true,
    'deleted_messages', v_msg_count
  );
END;
$$;

-- ============================================================
-- 8. FUNCIÓN: cleanup_expired_data (llamada por cron)
-- ============================================================
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_messages INTEGER;
  v_deleted_sessions INTEGER;
BEGIN
  -- Contar antes de borrar para el log
  SELECT COUNT(*) INTO v_deleted_messages
  FROM session_messages WHERE expires_at < NOW();

  SELECT COUNT(*) INTO v_deleted_sessions
  FROM anonymous_sessions WHERE expires_at < NOW();

  -- Borrar mensajes expirados (primero, por foreign key)
  DELETE FROM session_messages WHERE expires_at < NOW();

  -- Borrar sesiones expiradas
  DELETE FROM anonymous_sessions WHERE expires_at < NOW();

  -- Registrar en log
  INSERT INTO system_cleanup_log(deleted_sessions, deleted_messages)
  VALUES (v_deleted_sessions, v_deleted_messages);
END;
$$;

-- ============================================================
-- 9. CRON JOB — Limpieza cada hora
-- Requiere pg_cron activado en Supabase Extensions
-- ============================================================

-- Limpieza de datos cada hora
SELECT cron.schedule(
  'psyqus-cleanup-expired',
  '0 * * * *',
  'SELECT cleanup_expired_data()'
);

-- Generar snapshots cada día a las 22:00 UTC
-- (antes de la limpieza nocturna para no perder datos)
SELECT cron.schedule(
  'psyqus-generate-snapshots',
  '0 22 * * *',
  $$
    SELECT net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/generate-snapshot',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    )
  $$
);

-- ============================================================
-- 10. ÍNDICES EXTRA DE PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_messages_session_created
  ON session_messages(session_id, created_at ASC);

-- Índice parcial: solo mensajes activos (no expirados)
CREATE INDEX IF NOT EXISTS idx_messages_active
  ON session_messages(session_id)
  WHERE expires_at > NOW();
