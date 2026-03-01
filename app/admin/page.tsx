"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase'; // Asegúrate que tu cliente de supabase esté en esta ruta

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FUNCIÓN PARA JALAR DATA REAL
  const fetchRealData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && data) {
      setIncidencias(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRealData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toUpperCase() === "ESPERANZA2026") {
      setIsAuthenticated(true);
    } else {
      alert("ACCESO DENEGADO");
      setPassword("");
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-xl">
          <h2 className="text-white font-black italic text-2xl mb-6 uppercase tracking-tighter">Acceso Especialista</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none"
              placeholder="CONTRASEÑA"
            />
            <button type="submit" className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-xs">Entrar al Sistema</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 lg:p-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Psyqus <span className="text-cyan-500">Intelligence</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
              Especialista: Mtra. Esperanza | Data Real Activa
            </p>
          </div>
          <div className="flex gap-4">
            <BotonExportarPDF />
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase">Salir</button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* SECCIÓN DE COMENTARIOS REALES */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Buzón Real (Supabase)</h3>
                <button onClick={fetchRealData} className="text-[10px] text-cyan-500 hover:text-white uppercase font-bold">Refrescar ↻</button>
              </div>
              
              <div className="space-y-4">
                {loading ? (
                  <p className="text-slate-500 animate-pulse text-sm">Sincronizando con base de datos...</p>
                ) : incidencias.length > 0 ? (
                  incidencias.map((item, i) => (
                    <div key={i} className="p-5 bg-black/40 border border-slate-800 rounded-2xl">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-400">Mensaje Recibido</span>
                        <span className="text-[8px] text-slate-600">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-300 text-sm italic font-light">"{item.mensaje}"</p>
                      {item.area && <span className="text-[9px] text-slate-500 block mt-2">Área: {item.area}</span>}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-600 text-sm">No hay mensajes nuevos en la base de datos.</p>
                )}
              </div>
            </div>
          </section>

          {/* MÉTRICAS (AQUÍ PODRÍAS HACER OTRO FETCH PARA LOS NIVELES) */}
          <aside className="space-y-6">
            <div className="p-8 bg-slate-900/50 border border-slate-800 rounded-[2.5rem]">
              <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest text-center">Resumen Organizacional</h3>
              <div className="text-center">
                 <span className="text-6xl font-black text-white">{incidencias.length}</span>
                 <p className="text-[10px] text-slate-500 uppercase mt-2">Reportes en buzón</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}