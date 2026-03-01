'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
import Link from 'next/link';

// Pon esto en el header o navbar de tu Landing Page
export const AccesoRapido = () => {
  return (
    <Link href="/login" className="relative group overflow-hidden px-8 py-3 rounded-full bg-transparent border border-cyan-500/30 text-white font-black uppercase text-xs tracking-widest transition-all hover:border-cyan-400">
      <span className="relative z-10">Entrar a Psyqus</span>
      {/* Efecto de resplandor neón al pasar el mouse */}
      <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity blur-lg" />
    </Link>
  );
};
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const acceder = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Acceso denegado: " + error.message)
    else router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-900">
        <h1 className="text-3xl font-black text-blue-900 mb-2 italic">PSYQUS</h1>
        <p className="text-gray-500 mb-8 font-bold text-sm">ACCESO EXCLUSIVO PARA CONSULTORES</p>
        
        <form onSubmit={acceder} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-blue-500 outline-none transition-all text-black"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase mb-2">Contraseña</label>
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
        </form>
      </div>
    </div>
  )
}