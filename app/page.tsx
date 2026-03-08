"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPsyqus() {
  const [privacidad, setPrivacidad] = useState(false);
  const [terminos, setTerminos] = useState(false);

  // Variable para desbloquear el botón
  const formularioListo = privacidad && terminos;

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] backdrop-blur-xl">
        
        {/* Checkbox 1 */}
        <div className="flex items-center gap-4 mb-6 cursor-pointer" onClick={() => setPrivacidad(!privacidad)}>
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${privacidad ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
            {privacidad && <span className="text-black font-bold text-xs">✓</span>}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Acepto el <span className="text-cyan-500 underline">Aviso de Privacidad</span></p>
        </div>

        {/* Checkbox 2 */}
        <div className="flex items-center gap-4 mb-10 cursor-pointer" onClick={() => setTerminos(!terminos)}>
          <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${terminos ? 'bg-cyan-500 border-cyan-500' : 'border-slate-700'}`}>
            {terminos && <span className="text-black font-bold text-xs">✓</span>}
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Acepto los <span className="text-cyan-500 underline">Términos y Condiciones</span></p>
        </div>

        {/* El Botón */}
        <Link href={formularioListo ? "/encuesta" : "#"}>
          <button 
            disabled={!formularioListo}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] transition-all shadow-2xl 
              ${formularioListo 
                ? 'bg-white text-black hover:bg-cyan-500 cursor-pointer shadow-cyan-500/20' 
                : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
              }`}
          >
            {formularioListo ? "COMENZAR EVALUACIÓN" : "BLOQUEADO - REVISA LOS CHECKS"}
          </button>
        </Link>
      </div>
    </main>
  );
}