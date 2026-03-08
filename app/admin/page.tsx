"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
// Importaciones con Casing Correcto para Vercel
import BotonExportarPDF from '../dashboard/components/reportepdf';
import RadarBienestar from '../dashboard/components/radarbienestar';
import { motion, AnimatePresence } from 'framer-motion';

interface Prospecto {
  empresa: string;
  nombre: string;
  email: string;
  created_at: string;
}

interface Incidencia {
  tipo: 'SISTEMA' | 'USUARIO';
  mensaje: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [radarScores, setRadarScores] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [status, setStatus] = useState("Conectando...");

  const fetchProspectos = async () => {
    const { data } = await supabase.from('prospectos').select('*').order('created_at', { ascending: false });
    if (data) setProspectos(data as Prospecto[]);
  };

  const fetchIncidencias = async () => {
    const { data } = await supabase.from('incidencias').select('*').order('created_at', { ascending: false });
    if (data) setIncidencias(data as Incidencia[]);
  };

  const fetchRadarStats = async () => {
    const { data, error } = await supabase
      .from('resultados_encuesta')
      .select('modulo_1_score, modulo_2_score, modulo_3_score, modulo_4_score, modulo_5_score, modulo_6_score');
    
    if (data && data.length > 0) {
      const n = data.length;
      const averages = [
        data.reduce((acc, curr) => acc + (curr.modulo_1_score || 0), 0) / n,
        data.reduce((acc, curr) => acc + (curr.modulo_2_score || 0), 0) / n,
        data.reduce((acc, curr) => acc + (curr.modulo_3_score || 0), 0) / n,
        data.reduce((acc, curr) => acc + (curr.modulo_4_score || 0), 0) / n,
        data.reduce((acc, curr) => acc + (curr.modulo_5_score || 0), 0) / n,
        data.reduce((acc, curr) => acc + (curr.modulo_6_score || 0), 0) / n,
      ];
      setRadarScores(averages.map(v => Number(v.toFixed(2))));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProspectos();
      fetchIncidencias();
      fetchRadarStats();
      setStatus("Sincronizado");
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl">
          <h2 className="text-2xl font-black italic mb-6 text-cyan-500 uppercase tracking-tighter">Psyqus Intelligence</h2>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none mb-4"
            placeholder="CLAVE MAESTRA"
          />
          <button 
            onClick={() => { if(password.toUpperCase() === "ESPERANZA2026") setIsAuthenticated(true) }}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest"
          >Entrar al Panel</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              PSYQUS <span className="text-cyan-500">ADMIN</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Dashboard Maestro | {status}</p>
          </div>
          <div className="flex gap-4">
            <BotonExportarPDF datos={{ usuario_id: "GLOBAL" }} scores={radarScores} />
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase hover:bg-red-500 transition-all">Salir</button>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <h3 className="text-xl font-black text-white italic mb-6 uppercase">Pipeline de Ventas</h3>
              <div className="overflow-x-auto text-[10px] font-bold uppercase">
                <table className="w-full text-left">
                  <thead className="text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="py-4">Empresa</th>
                      <th className="py-4">Contacto</th>
                      <th className="py-4 text-cyan-500">Email</th>
                      <th className="py-4 text-right">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospectos.map((p, i) => (
                      <tr key={i} className="border-b border-slate-800/50 hover:bg-cyan-500/5 text-slate-300">
                        <td className="py-4 text-white italic">{p.empresa}</td>
                        <td className="py-4">{p.nombre}</td>
                        <td className="py-4 text-cyan-400 lowercase italic">{p.email}</td>
                        <td className="py-4 text-right text-slate-600">{new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-black text-white italic mb-8 uppercase text-center">Salud Organizacional Global</h3>
              <div className="max-w-md mx-auto bg-black/20 rounded-full p-6 border border-slate-800">
                <RadarBienestar scores={radarScores} />
              </div>
            </div>
          </div>

          <aside className="space-y-8">
            <section className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-white uppercase tracking-widest italic">Incidentes</h3>
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-[8px] rounded-full font-bold">{incidencias.length}</span>
              </div>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {incidencias.map((item, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${item.tipo === 'SISTEMA' ? 'bg-red-500/10 border-red-500/30' : 'bg-black/40 border-slate-800'}`}>
                    <div className="flex justify-between text-[8px] font-black mb-2 tracking-widest">
                      <span className={item.tipo === 'SISTEMA' ? 'text-red-400' : 'text-cyan-500'}>{item.tipo}</span>
                      <span className="text-slate-600">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-xs italic">"{item.mensaje}"</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}