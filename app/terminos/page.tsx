export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 md:p-20">
      <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 p-10 md:p-16 rounded-[3rem] backdrop-blur-xl shadow-2xl">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent italic">
          TÉRMINOS Y CONDICIONES DE USO
        </h1>
        <div className="prose prose-invert max-w-none text-slate-400 space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Propiedad Intelectual</h2>
            <p>El sistema PSYQUS, incluyendo su algoritmo de radar y metodologías de evaluación, es propiedad intelectual de Ricardo Blancarte. Queda prohibida la reproducción total o parcial sin autorización expresa.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">Uso del Servicio</h2>
            <p>El usuario se compromete a proporcionar información veraz durante las evaluaciones de la NOM-035 para asegurar la precisión de los diagnósticos organizacionales.</p>
          </section>
          <div className="mt-12 pt-8 border-t border-slate-800 text-[10px] uppercase font-mono tracking-widest text-center">
            Última actualización: 15 Marzo 2026 • México
          </div>
        </div>
      </div>
    </div>
  );
}