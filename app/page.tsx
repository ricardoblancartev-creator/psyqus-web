import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Luces Neon de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />

      <div className="z-10 text-center max-w-2xl">
        
        {/* Contenedor del Logo con borde degradado */}
        <div className="flex justify-center mb-8">
          <div className="rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 p-1 shadow-[0_0_30px_rgba(8,145,178,0.3)] transform hover:scale-105 transition-transform duration-500">
            <Image 
              src="/psyqus-logo.jpg" 
              alt="Logo PSYQUS"
              width={160} 
              height={160}
              className="rounded-full object-cover bg-[#020617]"
              priority
            />
          </div>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent uppercase">
          PSYQUS
        </h1>
        
        <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed max-w-lg mx-auto font-light">
          Intelligence & Peace Management. <br />
          <span className="text-cyan-500/80 font-mono text-sm tracking-widest uppercase italic">Gestión Avanzada NOM-035</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-12 py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-95">
                INICIAR SESIÓN
              </button>
            </SignInButton>
            <Link href="/register" className="text-slate-500 hover:text-cyan-400 transition-colors text-sm font-medium tracking-wide">
              ¿No tienes cuenta? Regístrate
            </Link>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center gap-6">
              <Link href="/dashboard">
                <button className="px-12 py-4 bg-cyan-600 text-white font-extrabold rounded-2xl hover:bg-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.3)]">
                  IR AL DASHBOARD
                </button>
              </Link>
              <div className="scale-125 border-2 border-slate-800 rounded-full p-1 bg-slate-900 shadow-xl">
                <UserButton />
              </div>
            </div>
          </SignedIn>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] text-slate-700 tracking-[0.5em] uppercase font-mono">
        Intelligence & Peace Management © 2026
      </footer>
    </main>
  );
}