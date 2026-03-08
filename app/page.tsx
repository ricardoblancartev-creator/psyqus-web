"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canStart = privacyAccepted && termsAccepted;

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 selection:bg-cyan-500 selection:text-black">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl w-full relative z-10 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 border border-cyan-500/30 rounded-full bg-cyan-500/5 mb-8"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
            Inteligencia Organizacional • NOM-035
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl md:text-8xl font-[1000] italic tracking-tighter uppercase mb-6 leading-none"
        >
          PSYQUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">INTELLIGENCE</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium italic"
        >
          Diagnóstico avanzado de riesgos psicosociales. 
          Transformamos el cumplimiento legal en ventaja competitiva.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[3rem] backdrop-blur-xl max-w-lg mx-auto shadow-2xl"
        >
          <div className="space-y-6 mb-10 text-left">
            <label className="flex items-start gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={privacyAccepted}
                onChange={() => setPrivacyAccepted(!privacyAccepted)}
                className="mt-1 w-5 h-5 accent-cyan-500 rounded border-slate-700 bg-slate-800"
              />
              <span className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight group-hover:text-white transition-colors">
                Acepto el <Link href="/privacidad" className="text-cyan-500 underline">Aviso de Privacidad</Link>.
              </span>
            </label>

            <label className="flex items-start gap-4 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="mt-1 w-5 h-5 accent-cyan-500 rounded border-slate-700 bg-slate-800"
              />
              <span className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase tracking-tight group-hover:text-white transition-colors">
                Acepto los <Link href="/terminos" className="text-cyan-500 underline">Términos y Condiciones</Link>.
              </span>
            </label>
          </div>

          <Link href={canStart ? "/encuesta" : "#"}>
            <button 
              disabled={!canStart}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 ${
                canStart 
                ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Comenzar Evaluación
            </button>
          </Link>
        </motion.div>
      </div>
    </main>
  );
}