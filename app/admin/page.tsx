"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [mensajesReales, setMensajesReales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [acceso, setAcceso] = useState(false);

  useEffect(() => {
    const pass = prompt("Acceso Restringido. Ingrese Clave de Especialista:");
    if (pass === "ESPERANZA2026") {
      setAcceso(true);
      fetchMensajes();
    } else {
      window.location.href = "/dashboard";
    }
  }, []);

  const fetchMensajes = async () => {
    const { data, error } = await supabase
      .from('buzon_mensajes')
      .select('*')
      .order('fecha', { ascending: false });

    if (!error) setMensajesReales(data);
    setCargando(false);
  };

  if (!acceso) return <div className="bg-black min-h-screen" />;

  return (
    <main className="min-h-screen bg-[#020617] p-6 lg:p-10 text-slate-300">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white italic">
              Psyqus <span className="text-cyan-500">Clinical</span> Panel
            </h1>
            <p className="text-[10px] font-mono text-slate-500 mt-2 tracking-[0.4em]">MTRA. ESPERANZA P.</p>
          </div>
          <Link href="/dashboard" className="px-6 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-xs font-bold">SALIR</Link>
        </header>

        {/* MÉTRICAS (Estas pueden ser fijas por ahora) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Estrés Colectivo</p>
            <p className="text-4xl font-black text-green-400">38%</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Mensajes Reales</p>
            <p className="text-4xl font-black text-purple-400">{mensajesReales.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* MENSAJES REALES DE SUPABASE */}
          <section className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-[3rem] p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              Buzón de Paz (Datos Reales)
            </h2>
            
            <div className="space-y-4">
              {cargando ? (
                <p className="text-slate-500">Cargando base de datos...</p>
              ) : mensajesReales.length > 0 ? (
                mensajesReales.map((msg) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={msg.id} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex justify-between items-center">
                    <div>
                      <p className="text-sm text-slate-200 italic">"{msg.contenido}"</p>
                      <span className="text-[9px] font-mono text-slate-500 uppercase">{new Date(msg.fecha).toLocaleDateString()}</span>
                    </div>
                    <span className="text-[8px] font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400">RECIBIDO</span>
                  </motion.div>
                ))
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-800 rounded-3xl text-center">
                  <p className="text-slate-600 italic text-sm">No hay mensajes en la base de datos todavía.</p>
                </div>
              )}
            </div>
          </section>

          {/* LATERAL IA */}
          <aside className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-[3rem] border border-indigo-500/20">
             <h3 className="text-lg font-bold text-white mb-3 italic">Sugerencia IA</h3>
             <p className="text-xs text-slate-400 leading-relaxed italic">
               "Analizando tendencias reales... No hay suficientes datos para una predicción clínica todavía."
             </p>
          </aside>
        </div>
      </div>
    </main>
  );
}