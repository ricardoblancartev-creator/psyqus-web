// middleware.ts
// Seguridad a nivel de Edge — aplica a todas las rutas /api/private-ai

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Solo aplicar a rutas de Private AI
  if (!pathname.startsWith('/api/private-ai')) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // ── Headers de seguridad ──────────────────────────────────
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // ── CORS — solo orígenes permitidos ──────────────────────
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'https://psyqus.com',
    'https://app.psyqus.com',
  ].filter(Boolean);

  // Requests de Telegram webhook no tienen origin
  const isTelegramWebhook = pathname === '/api/private-ai/telegram-webhook';

  if (origin && !isTelegramWebhook && !allowedOrigins.includes(origin)) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // ── Preflight OPTIONS ─────────────────────────────────────
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  // ── Validar Content-Type en POST/DELETE ───────────────────
  if (['POST', 'DELETE'].includes(request.method)) {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type debe ser application/json' },
        { status: 415 }
      );
    }
  }

  return response;
}

export const config = {
  matcher: ['/api/private-ai/:path*'],
};
