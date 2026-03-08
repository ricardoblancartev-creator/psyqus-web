"use client";
import React from 'react';
import Link from 'next/link';

export default function TerminosYCondiciones() {
  return (
    <main className="min-h-screen bg-[#020617] p-10 text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-4xl mx-auto bg-slate-900/30 border border-slate-800 p-12 rounded-[3rem] backdrop-blur-xl">
        <h1 className="text-white text-4xl font-black mb-8 uppercase italic tracking-tighter">
          Términos y <span className="text-indigo-500">Condiciones</span>
        </h1>
        
        <div className="space-y-8 text-sm leading-relaxed text-justify">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Vigencia a partir de: Marzo 2026</p>

          <section>
            <h2 className="text-white font-black uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              1. Aceptación de los Términos
            </h2>
            <p>Al acceder y utilizar la plataforma <strong>Psyqus Intelligence</strong>, el usuario y la empresa contratante aceptan cumplir con los presentes términos. Este sistema es una herramienta de diagnóstico organizacional basada en la NOM-035-STPS-2018.</p>
          </section>

          <section className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-white font-black uppercase mb-3">2. Alcance del Servicio (Deslinde Clínico)</h2>
            <p>Psyqus Intelligence es un software de análisis de factores de riesgo psicosocial. <strong>No constituye un servicio de diagnóstico clínico, psiquiátrico ni terapéutico.</strong> Los resultados son indicadores preventivos. En caso de crisis personal o ideación suicida, el usuario debe acudir a servicios de emergencia especializados.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              3. Propiedad Intelectual
            </h2>
            <p>La metodología de los 6 módulos de evaluación, el diseño del Radar de Bienestar y los algoritmos de análisis son propiedad exclusiva de <strong>Ricardo Blancarte / Psyqus Intelligence</strong>. Queda prohibida la reproducción total o parcial fuera de la plataforma.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              4. Uso de la Información Empresarial
            </h2>
            <p>La empresa se compromete a no utilizar los resultados de Psyqus para represalias laborales, despidos o cualquier forma de discriminación. El uso indebido de la información estadística para afectar a un individuo invalida la licencia de uso.</p>
          </section>

          <section>
            <h2 className="text-white font-black uppercase mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              5. Limitación de Responsabilidad
            </h2>
            <p>Psyqus no se hace responsable por la implementación incorrecta de los planes de mejora por parte de la empresa, ni por interpretaciones erróneas de los reportes grupales proporcionados.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
          <Link href="/" className="text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all">
            ← Volver al inicio
          </Link>
          <div className="text-[9px] text-slate-600 font-mono">
            ID_LEGAL: PSY-2026-MX
          </div>
        </div>
      </div>
    </main>
  );
}