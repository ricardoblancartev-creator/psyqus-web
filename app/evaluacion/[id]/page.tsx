'use client'
import { useState, use } from 'react' // Importamos 'use'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EncuestaNOM035({ params }: { params: Promise<{ id: string }> }) {
  // Desempaquetamos el ID al estilo Next.js 15
  const { id } = use(params); 
  const [enviado, setEnviado] = useState(false)

  const manejarEnvio = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    const { error } = await supabase
      .from('respuestas')
      .insert([{ 
        evaluacion_id: id, 
        p1: formData.get('p1'), 
        p2: formData.get('p2') 
      }])

    if (error) {
      alert("Error al enviar: " + error.message)
    } else {
      setEnviado(true)
    }
  }

  if (enviado) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center text-white">
      <div className="bg-slate-900/50 border border-emerald-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">¡Registro Exitoso!</h1>
        <p className="text-slate-400">Tu respuesta ha sido procesada de forma anónima para la NOM-035.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6">
      <div className="max-w-xl mx-auto py-10">
        <header className="mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            Evaluación NOM-035
          </h1>
          <p className="text-[10px] text-cyan-500 font-mono tracking-widest mt-2 uppercase">
            Centro de Trabajo: {id}
          </p>
        </header>

        <form onSubmit={manejarEnvio} className="space-y-8">
          {/* Pregunta 1 */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm transition-all hover:border-slate-700">
            <p className="mb-6 font-medium text-lg leading-snug">1. ¿Mi trabajo me exige mucho esfuerzo difícil de olvidar?</p>
            <div className="grid grid-cols-1 gap-3">
              {['Siempre', 'Casi siempre', 'Nunca'].map((opcion) => (
                <label key={opcion} className="flex items-center p-4 bg-slate-800/30 rounded-2xl border border-transparent hover:border-cyan-500/50 cursor-pointer transition-all group">
                  <input type="radio" name="p1" value={opcion} required className="w-4 h-4 accent-cyan-500" />
                  <span className="ml-4 text-slate-400 group-hover:text-white">{opcion}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pregunta 2 */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl backdrop-blur-sm transition-all hover:border-slate-700">
            <p className="mb-6 font-medium text-lg leading-snug">2. ¿Me preocupa sufrir un accidente en mi trabajo?</p>
            <div className="grid grid-cols-1 gap-3">
              {['Siempre', 'Casi siempre', 'Nunca'].map((opcion) => (
                <label key={opcion} className="flex items-center p-4 bg-slate-800/30 rounded-2xl border border-transparent hover:border-cyan-500/50 cursor-pointer transition-all group">
                  <input type="radio" name="p2" value={opcion} required className="w-4 h-4 accent-cyan-500" />
                  <span className="ml-4 text-slate-400 group-hover:text-white">{opcion}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-2xl font-bold shadow-[0_0_20px_rgba(8,145,178,0.2)] transition-all transform hover:scale-[1.02]">
            Enviar Evaluación Segura
          </button>
        </form>
      </div>
    </div>
  )
}