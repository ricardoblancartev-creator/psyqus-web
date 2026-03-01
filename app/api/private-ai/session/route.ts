// app/api/private-ai/session/route.ts
// Crear o recuperar sesión anónima

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getOrCreateSession } from '@/lib/private-ai/db';
import { checkSessionRateLimit } from '@/lib/private-ai/rate-limiter';
import {
  generateWebSessionToken,
  generateTelegramSessionToken,
  isValidSessionToken,
} from '@/lib/private-ai/session-token';
import type { SessionCreateRequest, SessionCreateResponse } from '@/types/private-ai';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body: SessionCreateRequest = await req.json();
    const { source = 'web', orgId, telegramId } = body;

    const headersList = headers();

    // Rate limit por IP para prevenir spam de creación de sesiones
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const { allowed } = await checkSessionRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Demasiadas sesiones creadas. Intenta más tarde.' },
        { status: 429 }
      );
    }

    // Generar token según fuente
    let sessionToken: string;

    if (source === 'telegram' && telegramId) {
      sessionToken = generateTelegramSessionToken(telegramId);
    } else {
      // Para web, si viene un token existente en el body lo reutilizamos
      const existingToken = body as any;
      if (existingToken.sessionToken && isValidSessionToken(existingToken.sessionToken)) {
        sessionToken = existingToken.sessionToken;
      } else {
        const userAgent = headersList.get('user-agent') || '';
        const acceptLanguage = headersList.get('accept-language') || '';
        sessionToken = generateWebSessionToken(userAgent, acceptLanguage);
      }
    }

    // Crear o recuperar sesión en DB
    const session = await getOrCreateSession(
      sessionToken,
      orgId,
      source,
      telegramId
    );

    const response: SessionCreateResponse = {
      sessionToken: session.session_token,
      expiresAt: session.expires_at,
    };

    return NextResponse.json(response, {
      headers: {
        // No cachear respuestas de sesión
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[session] Error:', error);
    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 500 }
    );
  }
}
