'use client'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

export default function Home() {
  const { isSignedIn } = useAuth()
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Psyqus Web</h1>
      
      {!isSignedIn ? (
        <div className="text-center">
          <p className="mb-4">Por favor inicia sesión para continuar</p>
          <Link 
            href="/sign-in" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Iniciar Sesión
          </Link>
          <p className="mt-2">
            ¿No tienes cuenta?{' '}
            <Link href="/sign-up" className="text-blue-500 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4">¡Bienvenido a Psyqus Web!</p>
          <Link 
            href="/dashboard" 
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Ir al Dashboard
          </Link>
        </div>
      )}
    </main>
  )
}
