import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      <h1 className="text-6xl font-black text-cyan-400 mb-4 tracking-tighter">PSYQUS</h1>
      <p className="text-slate-400 max-w-md mb-12 text-lg font-light">Sistema de Gestión de Paz y Bienestar Organizacional</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl relative z-10">
        <Link href="/dashboard" className="group p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400">📊 Dashboard</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest">Radar y Métricas</p>
        </Link>

        <Link href="/encuesta" className="group p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400">📝 Encuesta</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest">Realizar Evaluación</p>
        </Link>

        <Link href="/buzon" className="group p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400">✉️ Buzón</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest">Mensajes de Paz</p>
        </Link>

        <Link href="/admin" className="group p-8 bg-slate-900/50 border border-slate-800 rounded-3xl hover:border-cyan-500/50 transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400">🤖 Admin</h2>
          <p className="text-sm text-slate-500 uppercase tracking-widest">Panel de Control</p>
        </Link>
      </div>
    </main>
  );
}