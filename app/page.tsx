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
        
        {/* Logo de PSYQUS */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-1 shadow-[0_0_20px_rgba(8,145,178,0.3)]">
            <Image 
              src="/psyqus-logo.jpg" 
              alt="Logo PSYQUS"
              width={140} 
              height={140}
              className="rounded-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent uppercase">
          PSYQUS
        </h1>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
          Inteligencia Psicológica Organizacional. <br />
          Gestión avanzada de la NOM-035.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Iniciar Sesión (Google)
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="flex flex-col items-center gap-4">
              <Link href="/dashboard">
                <button className="px-10 py-4 bg-cyan-600 text-white font-bold rounded-2xl hover:bg-cyan-500 transition-all">
                  Ir al Dashboard
                </button>
              </Link>
              <UserButton />
            </div>
          </SignedIn>
        </div>
      </div>

      <footer className="absolute bottom-8 text-[10px] text-slate-600 tracking-[0.4em] uppercase">
        Intelligence & Peace Management © 2026
      </footer>
    </main>
  );
}