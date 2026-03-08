"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PaginaGracias() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Animación de fondo: Ondas de Inteligencia */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full"
        />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-20 h-20 bg-cyan-500 text-black rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_-10px_rgba(6,182,212,0.5)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </motion.div>

        <h1 className="text-4xl font-[1000] italic uppercase tracking-tighter mb-4 italic">
          ANÁLISIS <span className="text-cyan-500">COMPLETADO</span>
        </h1>
        
        <p className="text-slate-400 text-sm font-medium italic mb-10 leading-relaxed">
          Tus respuestas han sido procesadas bajo los estándares de la NOM-035 y el enfoque de autorrealización de Psyqus. Tus datos están seguros y cifrados.
        </p>

        <div className="flex flex-col gap-4">
          <Link href="/dashboard">
            <button className="w-full bg-white text-black font-[1000] uppercase text-[10px] tracking-[0.3em] py-5 rounded-2xl hover:bg-cyan-500 transition-all">
              Ver Mi Radar de Bienestar
            </button>
          </Link>
          
          <Link href="/psicoeducacion">
            <button className="w-full bg-transparent border border-slate-800 text-slate-500 font-bold uppercase text-[9px] tracking-widest py-4 rounded-2xl hover:text-white hover:border-slate-600 transition-all">
              Explorar Módulos de Crecimiento
            </button>
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-10 text-[8px] text-slate-700 font-black uppercase tracking-[0.5em] italic">
        Psyqus Intelligence • Secure Protocol 2026
      </footer>
    </main>
  );
}