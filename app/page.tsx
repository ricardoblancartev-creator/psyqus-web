import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Luces de fondo (Efecto Pro) */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 text-center mb-16">
        <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent mb-4">
          PSYQUS
        </h1>
        <p className="text-cyan-400 font-mono tracking-[0.3em] uppercase text-sm mb-8">
          Intelligence & Peace Management
        </p>
        <div className="h-1 w-24 bg-cyan-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl relative z-10">
        {[
          { title: 'Dashboard', desc: 'Radar de Bienestar y NOM-035', href: '/dashboard', icon: '📊' },
          { title: 'Encuesta', desc: 'Evaluación de Factores de Riesgo', href: '/encuesta', icon: '📝' },
          { title: 'Buzón de Paz', desc: 'Canal Seguro y Anónimo', href: '/buzon', icon: '✉️' },
          { title: 'Psyqus AI', desc: 'Consultoría Estratégica', href: '/ia', icon: '🤖' },
        ].map((item) => (
          <Link 
            key={item.title}
            href={item.href} 
            className="group p-8 bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl hover:border-cyan-500/50 transition-all duration-500 hover:scale-[1.02]"
          >
            <div className="text-4xl mb-4">{item.icon}</div>
            <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
              {item.title}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {item.desc}
            </p>
          </Link>
        ))}
      </div>

      <footer className="mt-20 text-slate-600 font-mono text-xs uppercase tracking-widest">
        Compliance NOM-035-STPS-2018 • Secure Data
      </footer>
    </main>
  );
}