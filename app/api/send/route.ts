import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import {
  obtenerProfesional,
  respuestaNoAutorizado,
  respuestaProhibido,
} from '@/lib/auth-servidor'

export async function GET() {
  // Ruta de diagnóstico: revela qué variables existen.
  const { userId, rol } = await obtenerProfesional()
  if (!userId) return respuestaNoAutorizado()
  if (rol !== 'admin') return respuestaProhibido()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ 
      error: 'Faltan variables de Supabase',
      url: !!supabaseUrl,
      key: !!supabaseKey 
    })
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Intenta conectar
  const { data, error } = await supabase
    .from('tu_tabla') // Cambia por el nombre real de tu tabla
    .select('count')
    .limit(1)
  
  return NextResponse.json({ 
    success: !error, 
    error: error?.message,
    data 
  })
}