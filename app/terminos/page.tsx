"use client";
import React from 'react';

export default function MarcoLegal() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-8 lg:p-20 font-sans">
      <div className="max-w-4xl mx-auto border border-slate-800 bg-slate-900/20 p-12 rounded-[3rem]">
        <h1 className="text-3xl font-black italic uppercase text-white mb-8 italic">Fundamento Jurídico <span className="text-cyan-500">NOM-035</span></h1>
        
        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h3 className="text-cyan-500 font-black uppercase text-[10px] tracking-widest mb-2">Numeral 7.1</h3>
            <p>Psyqus Intelligence cumple con la identificación y análisis de los factores de riesgo psicosocial, incluyendo condiciones del ambiente de trabajo y cargas de trabajo.</p>
          </section>

          <section>
            <h3 className="text-cyan-500 font-black uppercase text-[10px] tracking-widest mb-2">Numeral 8.1 y 8.2</h3>
            <p>Nuestra plataforma establece medidas de prevención y acciones de control basadas en los resultados, cumpliendo con la obligación del patrón de promover un entorno organizacional favorable.</p>
          </section>

          <div className="p-6 bg-cyan-500/5 border-l-2 border-cyan-500 italic">
            "La libertad es la capacidad de elegir nuestras propias cadenas, pero el bienestar es la capacidad de elegir nuestro propio crecimiento." — <span className="text-white font-bold text-[10px]">ENFOQUE PSYQUS</span>
          </div>
        </div>
      </div>
    </main>
  );
}