'use client' // Esto permite que el botón funcione

import { createClient } from '@supabase/supabase-js'

// Aquí el código usa las llaves que pusiste en el archivo .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function Register() {
  const handleSignUp = async (e: any) => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value

    // Esta es la orden que crea al usuario en Supabase
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) alert("Error: " + error.message)
    else alert("¡Éxito! Revisa tu correo para confirmar tu cuenta.")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 text-center">Crear Cuenta Psyqus</h1>
        
        <form onSubmit={handleSignUp} className="flex flex-col gap-4">
          <input 
            name="email" 
            type="email" 
            placeholder="Correo electrónico" 
            required 
            className="border p-2 rounded text-black w-64 border-gray-300" 
          />
          <input 
            name="password" 
            type="password" 
            placeholder="Contraseña" 
            required 
            className="border p-2 rounded text-black w-64 border-gray-300" 
          />
          
          {/* ESTE ES EL BOTÓN AZUL */}
          <button 
  type="submit" 
  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold"
>
  Registrarse
</button>
        </form>
        
        <p className="mt-4 text-sm text-gray-500 text-center">
          ¿Ya tienes cuenta? <span className="text-blue-500 cursor-pointer">Inicia sesión</span>
        </p>
      </div>
    </div>
  )
}
