"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 text-center">
      {/* Glow Effect */}
      <div className="absolute w-64 h-64 bg-red-500/10 blur-[100px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10"
      >
        <h1 className="text-[12rem] font-[1000] leading-none tracking-tighter italic text-slate-900 border-text">
          404
        </h1>
        
        <div className="mt-[-4rem]">
          <h2 className="text-2xl font-black uppercase italic tracking-widest text-cyan-500 mb-4">
            Ruta No Encontrada
          </h2>
          <p className="text-slate-500 text-sm max-w-xs mx-auto mb-10 font-bold uppercase tracking-tight leading-relaxed">
            El módulo al que intentas acceder no existe en la arquitectura de <span className="text-white">Psyqus Intelligence</span>.
          </p>

          <Link href="/">
            <button className="px-10 py-4 bg-transparent border border-slate-700 hover:border-cyan-500 text-slate-400 hover:text-cyan-400 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl transition-all duration-300">
              Retornar a la Base
            </button>
          </Link>
        </div>
      </motion.div>

      <style jsx>{`
        .border-text {
          -webkit-text-stroke: 2px #1e293b;
          color: transparent;
        }
      `}</style>
    </main>
  );
}