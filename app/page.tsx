import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-6xl font-black text-white italic mb-4 tracking-tighter">
        PSYQUS<span className="text-cyan-500">.</span>
      </h1>
      <p className="text-slate-400 mb-8 max-w-sm uppercase text-[10px] tracking-[0.5em] font-bold">
        Monitor de Salud Psicosocial Inteligente
      </p>
      
      <Link 
        href="/login" 
        className="px-10 py-4 bg-cyan-500 hover:bg-white text-black font-black rounded-full transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] uppercase text-xs tracking-widest"
      >
        Entrar al Sistema
      </Link>
    </main>
  );
}