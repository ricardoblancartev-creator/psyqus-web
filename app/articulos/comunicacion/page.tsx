"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ArticuloComunicacion() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 p-6 lg:p-20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/dashboard" className="text-cyan-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-12 hover:text-white transition-colors">
          ← Volver al Dashboard
        </Link>

        <header className="mb-12">
          <span className="text-cyan-500 font-mono text-[10px] uppercase tracking-[0.3em]">Neuro-Insight #042</span>
          <h1 className="text-5xl font-black text-white mt-4 italic tracking-tighter leading-none">
            LA QUÍMICA DE LA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
              ASERTIVIDAD
            </span>
          </h1>
          <div className="h-1 w-20 bg-cyan-500 mt-6" />
        </header>

        <article className="space-y-8 text-lg leading-relaxed font-light">
          <p className="text-white font-medium italic">"Tus palabras son llaves químicas para el cerebro de tu equipo."</p>
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Cortisol vs Oxitocina</h2>
            <p>La comunicación agresiva activa la amígdala, liberando <strong>cortisol</strong>. Esto apaga el pensamiento creativo. Por el contrario, la asertividad libera <strong>oxitocina</strong>, facilitando la colaboración y bajando el estrés un 30%.</p>
          </section>
          <div className="p-8 bg-slate-900/50 border-l-4 border-cyan-500 rounded-r-3xl my-10 italic text-sm">
            Hack: Cambia el "Tú hiciste mal esto" por "Siento que podemos mejorar esto".
          </div>
          <p>Implementar este cambio reduce la fricción operativa y mejora el clima laboral de inmediato.</p>
        </article>

        <footer className="mt-20 pt-10 border-t border-slate-800 text-center opacity-40">
            <p className="text-[8px] uppercase tracking-[0.4em]">Fin del Análisis - Psyqus Intelligence 2026</p>
        </footer>
      </div>
    </main>
  );
}