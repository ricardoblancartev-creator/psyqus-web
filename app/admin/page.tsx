"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [status, setStatus] = useState("Sincronizado");

  // CARGAR DATA REAL
  const fetchRealData = async () => {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setIncidencias(data);
      setStatus("¡Conectado! Data actualizada");
    } else {
      setStatus("Error al leer base de datos");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchRealData();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-black italic mb-6 tracking-tighter">PSYQUS ADMIN ACCESS</h2>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none mb-4"
            placeholder="CLAVE MAESTRA"
          />
          <button 
            onClick={() => { if(password.toUpperCase() === "ESPERANZA2026") setIsAuthenticated(true) }}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >Desbloquear Panel</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 lg:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Psyqus <span className="text-cyan-500">Intelligence</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">
              Especialista: Mtra. Esperanza | {status}
            </p>
          </div>
          <div className="flex gap-4">
            <BotonExportarPDF />
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all">Salir</button>
          </div>
        </header>

        {/* MÉTRICAS SUPERIORES */}
        <div className="grid lg:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Riesgo Global</p>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-green-400">0.4</span>
              <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-[15%]" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-tighter">Estatus: <span className="text-green-400">Óptimo</span></p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Participación</p>
            <span className="text-5xl font-black text-white">94%</span>
            <p className="text-[10px] text-cyan-500 mt-4 uppercase font-bold tracking-tighter">142 de 150 empleados</p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Reportes Reales</p>
            <span className="text-5xl font-black text-purple-400">{incidencias.length}</span>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-tighter animate-pulse text-purple-400">Sincronizado con Supabase</p>
          </div>

          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Burnout</p>
            <span className="text-5xl font-black text-orange-500 text-shadow-glow">12%</span>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-tighter">Variación: -2.1%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* BUZÓN REAL */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter italic">Últimos Mensajes del Buzón</h3>
                <button onClick={fetchRealData} className="text-[10px] bg-slate-800 px-3 py-1 rounded text-cyan-500 hover:text-white transition-all uppercase font-bold">Refrescar ↻</button>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {incidencias.length > 0 ? incidencias.map((item, i) => (
                  <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-5 bg-black/40 border border-slate-800 rounded-2xl hover:border-slate-500 transition-all shadow-inner">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-cyan-400">Mensaje Recibido</span>
                      <span className="text-[8px] text-slate-600 font-mono">{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm italic font-light leading-relaxed">"{item.mensaje}"</p>
                  </motion.div>
                )) : (
                  <div className="text-center py-20">
                    <p className="text-slate-600 italic text-sm">Esperando el primer reporte de la empresa...</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* NIVELES POR ÁREA (DATOS DE REFERENCIA) */}
          <aside className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest text-center">Clima por Departamentos</h3>
              <div className="space-y-6">
                {[
                  { area: "Operaciones", val: 85, color: "bg-green-400" },
                  { area: "RRHH", val: 92, color: "bg-cyan-400" },
                  { area: "Finanzas", val: 65, color: "bg-orange-400" },
                  { area: "Sistemas", val: 78, color: "bg-indigo-400" }
                ].map((area, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-2 uppercase font-bold tracking-tighter">
                      <span className="text-slate-400">{area.area}</span>
                      <span className="text-white">{area.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${area.val}%` }} transition={{ duration: 1.5 }} className={`h-full ${area.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}