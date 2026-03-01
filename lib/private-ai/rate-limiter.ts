// lib/private-ai/rate-limiter.ts
// Rate limiting usando Upstash Redis
// npm install @upstash/ratelimit @upstash/redis

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Inicializar Redis (vars en .env.local)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 20 mensajes por ventana de 10 minutos por sesión
export const chatRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '10 m'),
  analytics: true,
  prefix: 'psyqus:chat',
});

// 10 creaciones de sesión por hora por IP
export const sessionRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'psyqus:session',
});

export async function checkChatRateLimit(
  sessionToken: string
): Promise<{ allowed: boolean; remaining: number; reset: Date }> {
  const { success, remaining, reset } = await chatRatelimit.limit(sessionToken);
  return { allowed: success, remaining, reset: new Date(reset) };
}

export async function checkSessionRateLimit(
  ip: string
): Promise<{ allowed: boolean }> {
  const { success } = await sessionRatelimit.limit(ip);
  return { allowed: success };
}
