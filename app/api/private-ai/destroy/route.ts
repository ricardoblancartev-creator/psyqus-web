// app/api/private-ai/destroy/route.ts
// Autodestrucción manual de conversación

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/private-ai/db';
import { isValidSessionToken } from '@/lib/private-ai/session-token';

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { sessionToken } = body;

    if (!sessionToken || !isValidSessionToken(sessionToken)) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    // Llamar a la función de BD (borra en cascade)
    const { data, error } = await supabaseAdmin.rpc('destroy_session', {
      p_token: sessionToken,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Conversación eliminada permanentemente.',
      deleted_messages: data?.deleted_messages || 0,
    });
  } catch (error) {
    console.error('[destroy] Error:', error);
    return NextResponse.json({ error: 'Error al eliminar sesión' }, { status: 500 });
  }
}
