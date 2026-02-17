'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Conectamos con tu base de datos
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EncuestaNOM035({ params }: { params: { id: string } }) {
  const [enviado, setEnviado] = useState(false)

  const manejarEnvio = async (e: any) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    
    // Aquí mandamos los datos a la tabla 'respuestas'
    const { error } = await supabase
      .from('respuestas')
      .insert([{ 
        evaluacion_id: params.id, 
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
    <div className="p-8 text-center text-black">
      <h1 className="text-2xl font-bold text-green-600">¡Gracias!</h1>
      <p>Tu respuesta ha sido registrada de forma anónima para la NOM-035.</p>
    </div>
  )

  return (
    <div className="p-6 max-w-lg mx-auto bg-gray-50 min-h-screen text-black">
      <h1 className="text-xl font-bold mb-4 border-b pb-2">Evaluación NOM-035</h1>
      <p className="text-xs mb-6 text-gray-500 font-mono">ID Centro: {params.id}</p>

      <form onSubmit={manejarEnvio} className="space-y-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="mb-3 font-medium">1. ¿Mi trabajo me exige mucho esfuerzo difícil de olvidar?</p>
          <div className="flex flex-col gap-2">
            <label><input type="radio" name="p1" value="Siempre" required /> Siempre</label>
            <label><input type="radio" name="p1" value="Casi siempre" /> Casi siempre</label>
            <label><input type="radio" name="p1" value="Nunca" /> Nunca</label>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="mb-3 font-medium">2. ¿Me preocupa sufrir un accidente en mi trabajo?</p>
          <div className="flex flex-col gap-2">
            <label><input type="radio" name="p2" value="Siempre" required /> Siempre</label>
            <label><input type="radio" name="p2" value="Casi siempre" /> Casi siempre</label>
            <label><input type="radio" name="p2" value="Nunca" /> Nunca</label>
          </div>
        </div>

        <button className="w-full bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg">
          Enviar Evaluación
        </button>
      </form>
    </div>
  )
}
