import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-5xl font-extrabold text-cyan-400 mb-4 tracking-tighter">PSYQUS</h1>
      <p className="text-slate-400 max-w-md mb-10 text-lg">Sistema de Gestión de Paz y Bienestar Organizacional</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link href="/dashboard" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all">
          <h2 className="text-xl font-bold text-white mb-2">📊 Dashboard</h2>
          <p className="text-sm text-slate-400">Ver radar y métricas</p>
        </Link>
        <Link href="/buzon" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all">
          <h2 className="text-xl font-bold text-white mb-2">✉️ Buzón de Paz</h2>
          <p className="text-sm text-slate-400">Gestionar mensajes</p>
        </Link>
        <Link href="/encuesta" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all">
          <h2 className="text-xl font-bold text-white mb-2">📝 Encuesta</h2>
          <p className="text-sm text-slate-400">Realizar evaluación</p>
        </Link>
        <Link href="/ia" className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-cyan-500/50 transition-all">
          <h2 className="text-xl font-bold text-white mb-2">🤖 Psyqus AI</h2>
          <p className="text-sm text-slate-400">Consultoría inteligente</p>
        </Link>
      </div>
    </main>
  );
}