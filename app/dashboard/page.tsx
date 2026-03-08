"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [accepted, setAccepted] = useState(false);

  return (
    <main className="min-h-screen bg-[#020617] text-white font-sans flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] backdrop-blur-xl">
        <h1 className="text-5xl font-black italic tracking-tighter mb-4">
          PSYQUS <span className="text-cyan-500">INTELLIGENCE</span>
        </h1>
        <p className="text-slate-400 mb-8 italic">Sistema Inteligente NOM-035 + Desarrollo Humano</p>

        <section className="space-y-6 mb-10">
          <div className="bg-black/40 p-6 rounded-2xl border border-slate-800 text-[11px] leading-relaxed text-slate-300">
            <h3 className="text-cyan-500 font-black uppercase mb-2">Uso de datos (NOM-035)</h3>
            <p>Psyqus recopila información sobre bienestar laboral con fines estadísticos. Los resultados son <strong>anónimos</strong> y se presentan de forma agregada para prevenir riesgos psicosociales. Los datos no se usarán para evaluar desempeño individual.</p>
          </div>

          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={accepted} 
                onChange={() => setAccepted(!accepted)}
                className="w-5 h-5 accent-cyan-500 rounded border-slate-700 bg-slate-800"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-white transition-all">
                He leído y acepto el <Link href="/privacidad" className="text-cyan-500 underline">Aviso de Privacidad</Link>
              </span>
            </label>
          </div>
        </section>

        <Link href={accepted ? "/encuesta" : "#"}>
          <button 
            disabled={!accepted}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
              accepted ? 'bg-cyan-500 text-black hover:scale-105' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Comenzar Diagnóstico
          </button>
        </Link>
      </div>
    </main>
  );
}