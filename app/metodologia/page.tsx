export default function Metodologia() {
  const pilares = [
    { titulo: "NOM-035-STPS", desc: "Cumplimiento legal para la identificación y prevención de factores de riesgo psicosocial." },
    { titulo: "Modelo Deci & Ryan", desc: "Teoría de la autodeterminación para medir la motivación intrínseca y autonomía laboral." },
    { titulo: "Inteligencia Emocional", desc: "Basado en el marco de Daniel Goleman para evaluar empatía y liderazgo efectivo." }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-10 max-w-5xl mx-auto">
      <header className="mb-16">
        <h1 className="text-white text-5xl font-black uppercase italic tracking-tighter mb-4">
          Sustento <span className="text-cyan-500">Científico</span>
        </h1>
        <p className="text-lg italic">Psyqus no es una encuesta; es un sistema de inteligencia organizacional.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-20">
        {pilares.map((p, i) => (
          <div key={i} className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-cyan-500 font-black uppercase text-xs mb-4 tracking-widest">{p.titulo}</h3>
            <p className="text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>

      <section className="bg-cyan-500/10 border border-cyan-500/30 p-10 rounded-[3rem]">
        <h2 className="text-white font-black uppercase italic mb-6">¿Por qué Psyqus?</h2>
        <p className="text-sm leading-loose">
          A diferencia de los métodos tradicionales que solo generan reportes estáticos, Psyqus utiliza algoritmos para correlacionar el bienestar psicológico con la productividad operativa. Nuestro enfoque permite a las empresas reducir el <strong>burnout</strong> y mejorar el <strong>clima organizacional</strong> mediante datos accionables por departamento.
        </p>
      </section>
    </main>
  );
}