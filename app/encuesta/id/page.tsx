'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter, useParams } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EncuestaPage() {
  const { id } = useParams()
  const router = useRouter()

  const [empresa, setEmpresa] = useState<any>(null)
  const [error, setError] = useState('')
  const [r1, setR1] = useState('')
  const [r2, setR2] = useState('')
  const [r3, setR3] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const fetchEmpresa = async () => {
      const { data, error } = await supabase
        .from('centros_trabajo')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('Centro de trabajo no válido.')
      } else {
        setEmpresa(data)
      }
    }

    fetchEmpresa()
  }, [id])

  const enviarEncuesta = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.from('respuestas_encuesta').insert({
      centro_id: id,
      respuesta_1: Number(r1),
      respuesta_2: Number(r2),
      respuesta_3: Number(r3),
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      router.push('/gracias')
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <h1 className="text-xl font-bold text-red-600">{error}</h1>
        </div>
      </div>
    )
  }

  if (!empresa) return null

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg">

        <h1 className="text-2xl font-bold mb-2">
          Encuesta NOM-035
        </h1>

        <p className="text-gray-500 mb-8">
          Centro de trabajo: <strong>{empresa.nombre_empresa}</strong>
        </p>

        <form onSubmit={enviarEncuesta} className="space-y-6">

          <div>
            <label className="block mb-2 font-semibold">
              1. ¿Tiene claridad en sus funciones?
            </label>
            <select
              required
              className="w-full p-3 border-2 border-gray-100 rounded-xl"
              value={r1}
              onChange={(e) => setR1(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="1">Nunca</option>
              <option value="2">Casi nunca</option>
              <option value="3">A veces</option>
              <option value="4">Casi siempre</option>
              <option value="5">Siempre</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              2. ¿Su carga de trabajo es adecuada?
            </label>
            <select
              required
              className="w-full p-3 border-2 border-gray-100 rounded-xl"
              value={r2}
              onChange={(e) => setR2(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="1">Nunca</option>
              <option value="2">Casi nunca</option>
              <option value="3">A veces</option>
              <option value="4">Casi siempre</option>
              <option value="5">Siempre</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold">
              3. ¿Recibe apoyo de su supervisor?
            </label>
            <select
              required
              className="w-full p-3 border-2 border-gray-100 rounded-xl"
              value={r3}
              onChange={(e) => setR3(e.target.value)}
            >
              <option value="">Seleccione</option>
              <option value="1">Nunca</option>
              <option value="2">Casi nunca</option>
              <option value="3">A veces</option>
              <option value="4">Casi siempre</option>
              <option value="5">Siempre</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-blue-800 transition-all"
          >
            {loading ? 'Enviando...' : 'Enviar Respuestas'}
          </button>

        </form>

      </div>
    </div>
  )
}
