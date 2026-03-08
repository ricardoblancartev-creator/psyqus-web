"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BotonExportarPDF from '../dashboard/components/ReportePDF';
import RadarBienestar from '../dashboard/components/RadarBienestar';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [prospectos, setProspectos] = useState<any[]>([]);
  const [radarScores, setRadarScores] = useState<number[]>([3.5, 2.0, 1.5, 0.5, 3.8, 4.0]);
  const [status, setStatus] = useState("Sincronizando...");

  // 1. CARGAR INCIDENCIAS (BUZÓN)
  const fetchIncidencias = async () => {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setIncidencias(data);
  };

  // 2. CARGAR PROSPECTOS (VENTAS)
  const fetchProspectos = async () => {
    const { data, error } = await supabase
      .from('prospectos')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setProspectos(data);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchIncidencias();
      fetchProspectos();
      setStatus("Sistemas en línea");
    }
  }, [isAuthenticated]);

  // PANTALLA DE LOGIN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-xl shadow-2xl">
          <h2 className="text-2xl font-black italic mb-6 tracking-tighter text-cyan-500 uppercase">Psyqus Intelligence</h2>
          <p className="text-[9px] text-slate-500 font-bold mb-6 tracking-[0.3em]">RESTRICCION DE ACCESO NIVEL 1</p>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password.toUpperCase() === "ESPERANZA2026" && setIsAuthenticated(true)}
            className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none mb-4"
            placeholder="CLAVE MAESTRA"
          />
          <button 
            onClick={() => { if(password.toUpperCase() === "ESPERANZA2026") setIsAuthenticated(true) }}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest"
          >Desbloquear Panel</button>
        </motion.div>
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
              Psyqus <span className="text-cyan-500 underline decoration-indigo-500">Intelligence</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">
              Control Maestro | {status}
            </p>
          </div>
          <div className="flex gap-4">
            <BotonExportarPDF datos={{ usuario_id: "GLOBAL", nivel: "Bajo" }} />
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white transition-all">Cerrar Sesión</button>
          </div>
        </header>

        {/* METRICAS SUPERIORES */}
        <div className="grid lg:grid-cols-4 gap-6 mb-10">
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Estatus NOM-035</p>
            <span className="text-4xl font-black text-green-400">OPTIMO</span>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Prospectos (Leads)</p>
            <span className="text-4xl font-black text-white">{prospectos.length}</span>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Incidencias</p>
            <span className="text-4xl font-black text-purple-400">{incidencias.length}</span>
          </div>
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl text-center">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Riesgo Burnout</p>
            <span className="text-4xl font-black text-orange-500">12.4%</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* PIPELINE DE VENTAS */}
            <section className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-inner">
              <h3 className="text-xl font-black text-white uppercase italic mb-6 tracking-tighter">Pipeline de Ventas (Prospectos)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] uppercase font-bold tracking-widest">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-2">Empresa</th>
                      <th className="py-4 px-2">Nombre</th>
                      <th className="py-4 px-2 text-cyan-500">Email</th>
                      <th className="py-4 px-2">Tamaño</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-300">
                    {prospectos.length > 0 ? prospectos.map((p, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-white/5 transition-all">
                        <td className="py-4 px-2 text-white italic">{p.empresa}</td>
                        <td className="py-4 px-2">{p.nombre}</td>
                        <td className="py-4 px-2 text-cyan-400 lowercase">{p.email}</td>
                        <td className="py-4 px-2">{p.empleados}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={4} className="py-10 text-center text-slate-600 italic">No hay prospectos registrados aún.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* BUZÓN DE INCIDENCIAS */}
            <section className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Buzón de Incidencias</h3>
                <button onClick={fetchIncidencias} className="text-[9px] bg-slate-800 px-3 py-1 rounded text-cyan-500 font-black">REFRESCAR ↻</button>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {incidencias.map((item, i) => (
                  <div key={i} className="p-5 bg-black/40 border border-slate-800 rounded-2xl">
                    <div className="flex justify-between text-[8px] font-bold mb-2 uppercase tracking-widest text-cyan-500 italic">
                      <span>Reporte Confidencial</span>
                      <span className="text-slate-600 font-mono">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm italic font-light">"{item.mensaje}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-8">
            {/* RADAR DE LA NOM-035 */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 text-center">
              <h3 className="text-xs font-black text-white mb-8 uppercase tracking-widest italic">Análisis Psicosocial</h3>
              <div className="max-w-[250px] mx-auto bg-black/30 rounded-full p-4 border border-slate-800 shadow-2xl">
                <RadarBienestar scores={radarScores} />
              </div>
            </div>

            {/* MAPA DE CALOR DEPARTAMENTAL */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-black text-white mb-8 uppercase tracking-widest italic text-center">Heatmap Operativo</h3>
              <div className="space-y-6">
                {[
                  { area: "Operaciones", val: 15, color: "bg-green-400" },
                  { area: "Ventas", val: 82, color: "bg-red-500" },
                  { area: "Recursos Humanos", val: 25, color: "bg-cyan-400" },
                  { area: "Dirección", val: 40, color: "bg-yellow-400" }
                ].map((area, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[9px] mb-2 uppercase font-black tracking-widest">
                      <span className="text-slate-500">{area.area}</span>
                      <span className="text-white">{area.val}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
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