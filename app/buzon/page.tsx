"use client";
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

    // AQUÍ ESTÁ EL TRUCO: Asegúrate que el nombre de la columna sea 'mensaje'
    const { error } = await supabase
      .from('incidencias')
      .insert([{ mensaje: mensaje, created_at: new Date() }]);

    if (error) {
      console.error("Error de Supabase:", error);
      alert("Error al enviar: " + error.message);
    } else {
      setEnviado(true);
      setMensaje("");
    }
    setEnviando(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
      <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-xl">
        <h2 className="text-2xl font-black italic mb-6">BUZÓN DE PAZ</h2>
        
        {enviado ? (
          <div className="text-center space-y-4">
            <p className="text-cyan-400 font-bold">¡Mensaje enviado de forma anónima!</p>
            <button onClick={() => setEnviado(false)} className="text-xs text-slate-500 underline">Enviar otro</button>
            <Link href="/dashboard" className="block text-xs bg-slate-800 py-3 rounded-xl">Volver</Link>
          </div>
        ) : (
          <form onSubmit={enviarIncidencia} className="space-y-4">
            <textarea 
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full h-32 bg-black/40 border border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-cyan-500 transition-all"
              placeholder="Escribe tu reporte o sugerencia aquí..."
              required
            />
            <button 
              disabled={enviando}
              type="submit" 
              className="w-full bg-cyan-500 text-black font-black py-4 rounded-2xl hover:scale-105 transition-all disabled:opacity-50"
            >
              {enviando ? "ENVIANDO..." : "ENVIAR REPORTE ANÓNIMO"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}