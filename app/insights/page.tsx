"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] p-6 lg:p-20 text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        {/* BOTÓN VOLVER */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            VOLVER AL DASHBOARD
          </Link>
        </motion.div>

        {/* ARTÍCULO PRINCIPAL */}
        <motion.article 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 border border-slate-700 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-sm relative overflow-hidden"
        >
          {/* DECORACIÓN NEÓN */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -z-10"></div>
          
          <span className="bg-indigo-500/20 text-indigo-400 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em]">
            Investigación Exclusiva Psyqus
          </span>
          
          <h1 className="text-4xl md:text-6xl font-black mt-6 leading-tight text-white">
            La Neuroquímica de la <span className="text-cyan-400 italic">Asertividad</span>
          </h1>

          <div className="mt-12 space-y-8 text-slate-300 leading-relaxed text-lg">
            <p className="border-l-4 border-cyan-500 pl-6 italic text-xl text-slate-100">
              "En el entorno laboral moderno, las palabras no son solo información; son disparadores biológicos que definen la productividad."
            </p>

            <section className="mt-10">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <span className="text-red-500 text-3xl">●</span> 
                El Efecto Cortisol (Modo Supervivencia)
              </h2>
              <p>
                Cuando un líder o compañero usa un lenguaje pasivo-agresivo o autoritario, el cerebro del receptor activa la <strong>Amígdala</strong>. Esto dispara el cortisol, bloqueando la corteza prefrontal.
                <span className="block mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-mono text-sm">
                  DATO: Un cerebro bajo estrés reduce su capacidad creativa en un 60%.
                </span>
              </p>
            </section>

            <section className="p-8 bg-cyan-500/5 rounded-3xl border border-cyan-500/20">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-3">
                <span className="text-cyan-400 text-3xl">●</span> 
                El Efecto Oxitocina (Modo Colaboración)
              </h2>
              <p>
                La validación y la comunicación asertiva liberan oxitocina. Esta hormona neutraliza el cortisol, permitiendo que el equipo se sienta seguro para proponer ideas y admitir errores sin miedo.
                <span className="block mt-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 font-mono text-sm">
                  BENEFICIO: Aumento del 28% en la retención de talento.
                </span>
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
              <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-700 text-center group hover:border-indigo-500/50 transition-colors">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-2">Estado Mental Meta</p>
                <p className="text-3xl font-black text-white group-hover:text-indigo-400 transition-colors font-mono">FLOW STATE</p>
              </div>
              <div className="bg-slate-900/60 p-8 rounded-[2rem] border border-slate-700 text-center group hover:border-cyan-500/50 transition-colors">
                <p className="text-xs uppercase font-bold text-slate-500 tracking-widest mb-2">Reducción de Burnout</p>
                <p className="text-3xl font-black text-white group-hover:text-cyan-400 transition-colors font-mono">-42% ANUAL</p>
              </div>
            </div>
          </div>
        </motion.article>

        <footer className="mt-16 text-center text-slate-500 text-xs uppercase tracking-widest pb-10">
          Powered by Psyqus Intelligence Neural Engine © 2026
        </footer>
      </div>
    </main>
  );
}