"use client";
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BuzonPage() {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const enviarIncidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.from('incidencias').insert([{ mensaje, created_at: new Date() }]);
    if (error) { alert("Error: " + error.message); } 
    else { setEnviado(true); setMensaje(""); }
    setEnviando(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white relative">
      <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
      <div className="max-w-md w-full bg-slate-900/40 border border-slate-800/60 p-10 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative z-10">
        <div className="mb-10">
            <h2 className="text-3xl font-black italic tracking-tighter">BUZÓN DE PAZ</h2>
            <div className="h-1 w-12 bg-cyan-500 mt-2"></div>
        </div>
        
        {enviado ? (
          <div className="text-center py-10 animate-in fade-in zoom-in">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-cyan-400 text-2xl">✓</span>
            </div>
            <p className="text-white font-bold text-xl mb-2">Mensaje Cifrado</p>
            <p className="text-slate-500 text-sm mb-8">Tu identidad ha sido protegida. Gracias por tu valor.</p>
            <Link href="/dashboard" className="inline-block w-full py-4 bg-slate-800 rounded-2xl text-xs font-bold hover:bg-slate-700 transition-all uppercase tracking-widest">Volver al Centro de Control</Link>
          </div>
        ) : (
          <form onSubmit={enviarIncidencia} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-mono text-cyan-500 uppercase tracking-[0.2em]">Canal de Reporte Seguro</label>
                <textarea 
                  value={mensaje} onChange={(e) => setMensaje(e.target.value)}
                  className="w-full h-40 bg-black/20 border border-slate-800 rounded-3xl p-5 text-sm outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700"
                  placeholder="Describe la situación... (anonimato garantizado)" required
                />
            </div>
            <button 
              disabled={enviando} type="submit" 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black py-5 rounded-2xl hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)] transition-all disabled:opacity-50 uppercase text-xs tracking-widest"
            >
              {enviando ? "ENCRIPTANDO..." : "ENVIAR INCIDENCIA"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}