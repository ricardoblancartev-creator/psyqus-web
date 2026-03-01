// lib/private-ai/session-token.ts
// Generación de tokens anónimos sin almacenar datos identificables

import { createHash, randomBytes } from 'crypto';

/**
 * Genera un token de sesión anónimo.
 * Para web: combinación de datos no-identificables + entropía aleatoria
 * Para Telegram: hash del telegram_id (siempre el mismo para el mismo usuario)
 */
export function generateWebSessionToken(
  userAgent: string = '',
  acceptLanguage: string = ''
): string {
  // Añadir entropía aleatoria para que no sea reversible
  const entropy = randomBytes(16).toString('hex');
  const seed = `${userAgent}_${acceptLanguage}_${entropy}`;
  return createHash('sha256').update(seed).digest('hex').slice(0, 40);
}

export function generateTelegramSessionToken(telegramId: string): string {
  // Para Telegram usamos hash determinístico del ID
  // Así el mismo usuario siempre tiene el mismo token y mantiene su historial 24h
  const seed = `tg_${telegramId}_${process.env.SESSION_SECRET || 'psyqus-secret'}`;
  return createHash('sha256').update(seed).digest('hex').slice(0, 40);
}

export function hashTelegramId(telegramId: string): string {
  return generateTelegramSessionToken(telegramId);
}

/**
 * Valida que un token tenga el formato correcto
 */
export function isValidSessionToken(token: string): boolean {
  return /^[a-f0-9]{40}$/.test(token);
}
