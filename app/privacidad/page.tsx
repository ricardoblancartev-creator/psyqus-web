export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 md:p-20">
      <div className="max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 p-10 md:p-16 rounded-[3rem] backdrop-blur-xl shadow-2xl">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
          AVISO DE PRIVACIDAD INTEGRAL
        </h1>
        <div className="prose prose-invert max-w-none text-slate-400 space-y-6 text-sm leading-relaxed">
          <p className="border-b border-slate-800 pb-4 font-mono uppercase tracking-widest text-[10px] text-cyan-500">
            Responsable del tratamiento de datos: PSYQUS Intelligence
          </p>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Datos Recopilados</h2>
            <p>En cumplimiento con la Ley Federal de Protección de Datos Personales, PSYQUS recopila información psicométrica y organizacional con el único fin de dar cumplimiento a la NOM-035-STPS-2018.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Finalidad del Tratamiento</h2>
            <p>Los datos se utilizan para identificar factores de riesgo psicosocial y evaluar el entorno organizacional. Los resultados individuales son anonimizados para garantizar la integridad del colaborador.</p>
          </section>
          <section className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">Derechos ARCO</h2>
            <p>Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición de sus datos personales enviando una solicitud formal al oficial de privacidad de la plataforma.</p>
          </section>
        </div>
      </div>
    </div>
  );
}