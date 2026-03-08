"use client";
import React from 'react';
import Link from 'next/link';

export default function Gracias() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white text-center">
      <div className="max-w-md w-full bg-slate-900/40 border border-slate-800 p-12 rounded-[3rem] backdrop-blur-xl">
        <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/30">
          <span className="text-cyan-500 text-4xl">✓</span>
        </div>
        <h1 className="text-3xl font-black uppercase italic mb-4 tracking-tighter">
          Diagnóstico <span className="text-cyan-500">Completado</span>
        </h1>
        <p className="text-slate-400 text-sm mb-10 leading-relaxed italic">
          Tus respuestas han sido procesadas de forma anónima bajo los estándares de la NOM-035. Tu bienestar es el activo más valioso de la organización.
        </p>
        
        <div className="space-y-4">
          <Link href="/dashboard">
            <button className="w-full bg-white text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:scale-105 transition-all">
              Ver mi Radar de Bienestar
            </button>
          </Link>
          <Link href="/metodologia">
            <button className="w-full bg-transparent border border-slate-700 text-slate-400 font-bold py-4 rounded-2xl text-xs uppercase tracking-widest hover:text-white">
              Sustento Teórico
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
}