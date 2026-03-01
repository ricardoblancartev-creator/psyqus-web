"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ENCABEZADO */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">
              Psyqus <span className="text-cyan-500">Intelligence</span> Control
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
              Especialista: Mtra. Esperanza | Cédula: Profesional
            </p>
          </div>
          <div className="flex gap-4">
            <BotonExportarPDF />
            <button onClick={() => setIsAuthenticated(false)} className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase">Salir</button>
          </div>
        </header>

        {/* CUADRICULA DE INFORMACIÓN */}
        <div className="grid lg:grid-cols-4 gap-6 mb-10">
          
          {/* NIVEL DE RIESGO */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Nivel de Riesgo Global</p>
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black text-green-400">0.4</span>
              <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-green-400 w-[15%]" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 uppercase">Estatus: <span className="text-green-400 font-bold">Bajo (Óptimo)</span></p>
          </div>

          {/* PARTICIPACIÓN */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Participación Real</p>
            <span className="text-5xl font-black text-white">94%</span>
            <p className="text-[10px] text-cyan-500 mt-4 uppercase font-bold">142 de 150 empleados</p>
          </div>

          {/* FACTOR BURN-OUT */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mb-4">Factor de Agotamiento</p>
            <span className="text-5xl font-black text-orange-500">12%</span>
            <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold">Variación mensual: -2.1%</p>
          </div>

          {/* MENSAJES PENDIENTES */}
          <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-3xl">
            <p className="text-purple-400 text-[9px] font-bold uppercase tracking-widest mb-4">Buzón de Incidencias</p>
            <span className="text-5xl font-black text-white">03</span>
            <p className="text-[10px] text-purple-400 mt-4 uppercase font-bold">Nuevos reportes anónimos</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* SECCIÓN DE COMENTARIOS REALES (BUZÓN) */}
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tighter italic">Últimos Mensajes del Buzón</h3>
              <div className="space-y-4">
                {[
                  { msg: "Siento que la carga de trabajo en el área de ventas ha subido demasiado este mes.", cat: "Carga de Trabajo", color: "text-orange-400" },
                  { msg: "Me gustaría que hubiera más capacitaciones sobre manejo de estrés.", cat: "Sugerencia", color: "text-cyan-400" },
                  { msg: "Excelente iniciativa el dashboard, me ayuda a relajarme 5 min.", cat: "Feedback Positivo", color: "text-green-400" }
                ].map((item, i) => (
                  <div key={i} className="p-5 bg-black/40 border border-slate-800 rounded-2xl hover:border-slate-600 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${item.color}`}>{item.cat}</span>
                      <span className="text-[8px] text-slate-600">HACE 2 DÍAS</span>
                    </div>
                    <p className="text-slate-300 text-sm italic font-light">"{item.msg}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* NIVELES POR DEPARTAMENTO */}
          <aside className="space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
              <h3 className="text-xs font-bold text-white mb-6 uppercase tracking-widest">Niveles por Área</h3>
              <div className="space-y-6">
                {[
                  { area: "Operaciones", val: 85, color: "bg-green-400" },
                  { area: "Recursos Humanos", val: 92, color: "bg-cyan-400" },
                  { area: "Finanzas", val: 65, color: "bg-orange-400" },
                  { area: "Sistemas", val: 78, color: "bg-indigo-400" }
                ].map((area, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-2 uppercase font-bold">
                      <span className="text-slate-400">{area.area}</span>
                      <span className="text-white">{area.val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${area.val}%` }} transition={{ duration: 1 }} className={`h-full ${area.color}`} />
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