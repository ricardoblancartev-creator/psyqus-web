"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase'; // Asegúrate que la ruta sea correcta
import { motion } from 'framer-motion';

export default function BuzonPage() {
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const { error } = await supabase
      .from('buzon_mensajes')
      .insert([{ contenido: mensaje }]);

    if (!error) {
      setExito(true);
      setMensaje("");
    } else {
      alert("Error al enviar: " + error.message);
    }
    setEnviando(false);
  };

  if (exito) return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
      <div className="text-center p-10 bg-slate-800 rounded-[3rem] border border-green-500/30">
        <div className="text-6xl mb-4">🕊️</div>
        <h2 className="text-2xl font-black text-white uppercase italic">Mensaje Enviado</h2>
        <p className="text-slate-400 mt-2">Tu voz ha sido escuchada de forma anónima.</p>
        <button onClick={() => setExito(false)} className="mt-8 text-cyan-400 font-bold uppercase text-xs">Enviar otro</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0f172a] p-6 flex items-center justify-center">
      <form onSubmit={enviarMensaje} className="max-w-lg w-full bg-slate-800/50 p-10 rounded-[3rem] border border-slate-700">
        <h1 className="text-3xl font-black text-white mb-6 uppercase italic text-shadow-neon">Buzón de Paz</h1>
        <textarea 
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          required
          placeholder="Escribe aquí tu reporte o sugerencia... (Es 100% anónimo)"
          className="w-full h-48 bg-slate-900 border border-slate-700 rounded-3xl p-6 text-white outline-none focus:border-cyan-500 transition-all mb-6"
        />
        <button 
          disabled={enviando}
          className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-3xl shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all disabled:opacity-50"
        >
          {enviando ? "ENVIANDO..." : "ENVIAR AL ESPECIALISTA"}
        </button>
      </form>
    </main>
  );
}