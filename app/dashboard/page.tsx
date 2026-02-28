import RadarBienestar from './components/RadarBienestar';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] p-6 lg:p-12 text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* ENCABEZADO */}
        <header className="mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            PSYQUS INTELLIGENCE
          </h1>
          <p className="text-slate-400 mt-2">Monitoreo de Salud Mental Organizacional</p>
        </header>

        {/* --- EL PASO 2: EL RADAR --- */}
        <section className="mb-8">
          <RadarBienestar />
        </section>

        {/* --- EL PASO 3: ARTÍCULO Y PREDICCIÓN (DEBAJO DEL RADAR) --- */}
        <section className="grid md:grid-cols-2 gap-6">
          
          {/* Tarjeta del Artículo Neurociencia */}
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Neuro-Insights
              </span>
              <h4 className="text-2xl font-black mt-4 leading-tight">
                ¿Tu lenguaje libera Oxitocina o Cortisol?
              </h4>
              <p className="mt-4 text-indigo-100 text-sm leading-relaxed">
                El 70% de los conflictos laborales nacen del tono, no del mensaje. 
                Descubre cómo la asertividad reprograma el clima laboral.
              </p>
              <div className="mt-6 flex items-center gap-2 font-bold text-sm">
                Leer artículo completo <span className="group-hover:translate-x-2 transition-transform">→</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Tarjeta de Predicción de Crisis */}
          <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-center items-center text-center group">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 transition-colors">
              <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h4 className="text-white font-bold text-lg">Predicción de Burnout</h4>
            <p className="text-slate-400 text-sm mt-2 max-w-[200px]">
              Algoritmo activado: Detectando patrones de estrés antes del colapso.
            </p>
            <div className="mt-4 text-xs font-mono text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded">
              STATUS: SCANNING...
            </div>
          </div>

        </section>

        {/* Aquí abajo puedes seguir con tus tablas de reportes o el buzón */}
      </div>
    </main>
  );
}