'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const acceder = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage("Acceso denegado: " + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const recuperarPassword = async () => {
    if (!email) {
      setMessage("Ingresa tu correo primero.")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    })

    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Correo de recuperación enviado 📩 Revisa tu bandeja.")
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-900">
        
        <h1 className="text-3xl font-black text-blue-900 mb-2 italic">PSYQUS</h1>
        <p className="text-gray-500 mb-8 font-bold text-sm">
          ACCESO EXCLUSIVO PARA CONSULTORES
        </p>
        
        <form onSubmit={acceder} className="space-y-6">
          
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-black"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">
              Contraseña
            </label>
            <input 
              type="password" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-black"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-all uppercase tracking-widest">
            Entrar al Sistema
          </button>

          <button
            type="button"
            onClick={recuperarPassword}
            className="w-full text-blue-600 text-sm mt-2 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>

          {message && (
            <p className="text-center text-sm mt-4 text-gray-700">
              {message}
            </p>
          )}

        </form>
      </div>
    </div>
  )
}
