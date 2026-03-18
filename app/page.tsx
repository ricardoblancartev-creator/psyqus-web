"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import Image from 'next/image';

// Componente para manejar la lógica de sesión sin errores de servidor
function AuthContent() {
  const { userId, isLoaded } = useAuth();

  // Mientras carga la sesión, mostramos un espacio reservado elegante
  if (!isLoaded) return <div className="h-14 w-40 bg-slate-800/50 animate-pulse rounded-2xl" />;

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
      {!userId ? (
        <div className="flex flex-col gap-6 items-center">
          <SignInButton mode="modal">
            <button className="px-12 py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all duration-300 active:scale-95 text-lg uppercase tracking-widest">
              INICIAR SESIÓN
            </button>
          </SignInButton>
          <Link href="/register" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm font-bold uppercase tracking-tighter">
            ¿No tienes cuenta? Regístrate aquí
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-8">
          <Link href="/dashboard">
            <button className="px-12 py-4 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 hover:shadow-[0_0_30px_rgba(8,145,178,0.4)] transition-all duration-300 active:scale-95 text-lg uppercase tracking-widest">
              IR AL DASHBOARD
            </button>
          </Link>
          <div className="scale-150 border-4 border-slate-800 rounded-full p-1 bg-slate-900 shadow-2xl">
            <UserButton />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      
      {/* Luces Neon Ambientales */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />

      <div className="z-10 text-center max-w-3xl w-full">
        
        {/* LOGO DE PSYQUS - CORREGIDO */}
        <div className="flex justify-center mb-10">
          <div className="rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-1.5 shadow-[0_0_40px_rgba(8,145,178,0.4)] transform hover:scale-110 transition-transform duration-700 ease-in-out">
            <Image 
              src="/psyqus-logo.jpg" 
              alt="Logo PSYQUS"
              width={180} 
              height={180}
              className="rounded-full object-cover bg-[#020617]"
              priority
              unoptimized // <--- Esto asegura que el logo cargue en Vercel sin problemas
            />
          </div>
        </div>

        {/* TEXTO PRINCIPAL */}
        <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent uppercase italic">
          PSYQUS
        </h1>
        
        <p className="text-slate-400 text-xl md:text-2xl mb-14 leading-tight max-w-xl mx-auto font-light tracking-wide">
          Intelligence & Peace Management. <br />
          <span className="text-cyan-400/90 font-mono text-xs md:text-sm tracking-[0.3em] uppercase block mt-2 font-bold">
            Especialistas en la NOM-035
          </span>
        </p>

        {/* CONTENIDO DE AUTENTICACIÓN */}
        <AuthContent />
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-10 text-[10px] text-slate-700 tracking-[0.6em] uppercase font-mono font-bold">
        Intelligence & Peace Management © 2026
      </footer>
    </main>
  );
}