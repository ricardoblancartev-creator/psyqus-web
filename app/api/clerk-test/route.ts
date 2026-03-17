import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    // Verificar variables de entorno
    const envStatus = {
      hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
      publishableKeyPrefix: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...',
      nodeEnv: process.env.NODE_ENV,
    }

    // Intentar usar auth
    let authResult
    try {
      const { userId } = auth()
      authResult = { success: true, userId: userId || null }
    } catch (authError) {
      authResult = { 
        success: false, 
        error: authError instanceof Error ? authError.message : 'Error desconocido'
      }
    }

    return NextResponse.json({
      env: envStatus,
      auth: authResult,
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}