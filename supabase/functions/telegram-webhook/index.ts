// supabase/functions/telegram-webhook/index.ts
// Bot de Telegram — Interfaz anónima de entrada
// Deploy: supabase functions deploy telegram-webhook

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
const PSYQUS_APP_URL = Deno.env.get('PSYQUS_APP_URL')!;      // https://app.psyqus.com
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ── Hash para token anónimo ───────────────────────────────────
async function getTelegramSessionToken(telegramId: string): Promise<string> {
  const secret = Deno.env.get('SESSION_SECRET') || 'psyqus-secret';
  const seed = `tg_${telegramId}_${secret}`;
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(seed));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 40);
}

// ── Mensajes de Telegram API ──────────────────────────────────
async function sendMessage(
  chatId: string,
  text: string,
  parseMode = 'Markdown'
): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  });
}

async function sendTypingAction(chatId: string): Promise<void> {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, action: 'typing' }),
  });
}

// ── Mensajes predefinidos ─────────────────────────────────────
const WELCOME_MESSAGE = `
🔒 *Bienvenido/a a PSYQUS PRIVATE AI*

Soy ARIA, tu psicóloga organizacional virtual.
Este es un espacio completamente *privado y anónimo*.

✅ Nadie en tu empresa puede leer esto
✅ Tu conversación se elimina en 24 horas
✅ Tu identidad nunca es revelada

Puedes contarme cómo te sientes, qué situación enfrentas en el trabajo, o simplemente desahogarte.

*Comandos disponibles:*
/borrar — Elimina tu conversación ahora mismo
/privacidad — Cómo funciona la privacidad
/buzon — Información del Buzón de Paz

¿Cómo estás hoy?`;

const PRIVACY_MESSAGE = `
🔐 *Cómo protegemos tu privacidad:*

1. No guardamos tu nombre ni datos identificables
2. Solo usamos un código anónimo para mantener el hilo de la conversación
3. Todos los mensajes se eliminan automáticamente a las 24 horas
4. Tu empresa solo ve estadísticas grupales, nunca conversaciones individuales
5. Puedes borrar todo en cualquier momento con /borrar`;

const BUZON_MESSAGE = `
📮 *Buzón de Paz — Reporte Anónimo*

Si estás viviendo una situación de acoso laboral, maltrato, o ambiente hostil, el Buzón de Paz te permite reportarlo de forma completamente anónima.

Tu reporte llega directamente a los especialistas de RH sin revelar quién eres.

👉 Accede desde la app: ${PSYQUS_APP_URL}/buzon

O dile a ARIA que quieres reportar algo y te ayudará.`;

// ── Extrae org_id del comando /start ──────────────────────────
function extractOrgCode(text: string): string | null {
  const match = text.match(/^\/start\s+([A-Za-z0-9_-]+)$/);
  return match ? match[1] : null;
}

// ── Obtener org_id desde código ───────────────────────────────
async function resolveOrgId(orgCode: string): Promise<string | null> {
  const { data } = await supabase
    .from('organizations')
    .select('id')
    .eq('telegram_code', orgCode)
    .single();
  return data?.id || null;
}

// ── Crear/recuperar sesión via API ────────────────────────────
async function getOrCreateSession(
  sessionToken: string,
  orgId: string | null
): Promise<boolean> {
  try {
    const res = await fetch(`${PSYQUS_APP_URL}/api/private-ai/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'telegram',
        sessionToken,
        orgId,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Llamar a la IA ────────────────────────────────────────────
async function chatWithAria(
  message: string,
  sessionToken: string
): Promise<{ response: string; suggest_buzon: boolean; suggest_crisis_line: boolean }> {
  const res = await fetch(`${PSYQUS_APP_URL}/api/private-ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionToken }),
  });

  if (!res.ok) {
    return {
      response: 'Tuve un problema al procesar tu mensaje. Por favor intenta de nuevo en un momento.',
      suggest_buzon: false,
      suggest_crisis_line: false,
    };
  }

  return res.json();
}

// ── Borrar sesión ─────────────────────────────────────────────
async function destroySession(sessionToken: string): Promise<void> {
  await fetch(`${PSYQUS_APP_URL}/api/private-ai/destroy`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionToken }),
  });
}

// ── Store de org_id por usuario (en Supabase para persistencia) ──
async function getStoredOrgId(telegramId: string): Promise<string | null> {
  const { data } = await supabase
    .from('telegram_org_mapping') // Tabla simple: telegram_hash, org_id
    .select('org_id')
    .eq('telegram_hash', await getTelegramSessionToken(telegramId))
    .single();
  return data?.org_id || null;
}

async function storeOrgId(telegramId: string, orgId: string): Promise<void> {
  const hash = await getTelegramSessionToken(telegramId);
  await supabase.from('telegram_org_mapping').upsert({
    telegram_hash: hash,
    org_id: orgId,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'telegram_hash' });
}

// ── Handler principal ─────────────────────────────────────────
serve(async (req) => {
  // Verificar secret del webhook
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const update = await req.json();
    const message = update.message || update.edited_message;

    if (!message?.text) return new Response('OK');

    const chatId = String(message.chat.id);
    const text = String(message.text).trim();

    // Obtener token de sesión anónimo
    const sessionToken = await getTelegramSessionToken(chatId);

    // ── Comandos ──────────────────────────────────────────
    if (text.startsWith('/start')) {
      const orgCode = extractOrgCode(text);
      let orgId: string | null = null;

      if (orgCode) {
        orgId = await resolveOrgId(orgCode);
        if (orgId) await storeOrgId(chatId, orgId);
      }

      await getOrCreateSession(sessionToken, orgId);
      await sendMessage(chatId, WELCOME_MESSAGE);
      return new Response('OK');
    }

    if (text === '/borrar' || text === '/delete') {
      await destroySession(sessionToken);
      await sendMessage(chatId, '🗑️ *Conversación eliminada*\n\nTodos tus mensajes han sido borrados permanentemente.\n\nEscribe cualquier cosa para comenzar una nueva conversación.');
      return new Response('OK');
    }

    if (text === '/privacidad' || text === '/privacy') {
      await sendMessage(chatId, PRIVACY_MESSAGE);
      return new Response('OK');
    }

    if (text === '/buzon' || text === '/inbox') {
      await sendMessage(chatId, BUZON_MESSAGE);
      return new Response('OK');
    }

    // ── Mensaje normal — enviar a ARIA ────────────────────
    // Límite de longitud
    if (text.length > 2000) {
      await sendMessage(chatId, '⚠️ Tu mensaje es muy largo. Por favor escribe menos de 2000 caracteres.');
      return new Response('OK');
    }

    // Indicador "escribiendo..."
    await sendTypingAction(chatId);

    // Recuperar org_id guardado
    const orgId = await getStoredOrgId(chatId);
    await getOrCreateSession(sessionToken, orgId);

    // Llamar a ARIA
    const { response, suggest_buzon, suggest_crisis_line } = await chatWithAria(text, sessionToken);

    let replyText = response;

    // Añadir sugerencia de Buzón de Paz
    if (suggest_buzon) {
      replyText += '\n\n📮 *Buzón de Paz disponible*\nPuedes reportar esta situación de forma anónima. Usa /buzon para saber cómo.';
    }

    // Añadir línea de crisis
    if (suggest_crisis_line) {
      replyText += '\n\n📞 *Apoyo inmediato:* SAPTEL 55 5259-8121 (24/7, gratuito)';
    }

    await sendMessage(chatId, replyText);
    return new Response('OK');

  } catch (error) {
    console.error('Telegram webhook error:', error);
    return new Response('OK'); // Siempre 200 a Telegram para evitar reintentos
  }
});
