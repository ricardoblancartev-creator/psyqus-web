import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Luces de fondo (Efecto Neon) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="z-10 text-center max-w-4xl">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent">
          PSYQUS
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Inteligencia Psicológica Organizacional de nueva generación. 
          Gestión de la NOM-035 con IA y Buzón de Paz blindado.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-cyan-400 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Comenzar ahora (Google)
              </button>
            </SignInButton>
          </SignedOut>
          
          <SignedIn>
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-cyan-600 text-white font-bold rounded-full hover:bg-cyan-500 transition-all transform hover:scale-105">
                Ir al Dashboard
              </button>
            </Link>
            <div className="flex items-center ml-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>

          <Link href="/encuesta">
            <button className="px-8 py-4 bg-slate-900 border border-slate-800 text-white font-bold rounded-full hover:bg-slate-800 transition-all">
              Ver Encuesta
            </button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] text-slate-600 tracking-[0.3em] uppercase">
        Intelligence & Peace Management © 2026
      </footer>
    </main>
  );
}