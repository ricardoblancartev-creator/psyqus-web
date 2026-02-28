"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [acceso, setAcceso] = useState(false);

  // Bloqueo de seguridad simple para el socio
  useEffect(() => {
    const pass = prompt("Acceso Restringido. Ingrese Clave de Especialista:");
    if (pass === "ESPERANZA2026") {
      setAcceso(true);
    } else {
      alert("Clave incorrecta. Redirigiendo...");
      window.location.href = "/dashboard";
    }
  }, []);

  if (!acceso) return <div className="bg-black min-h-screen" />;

  return (
    <main className="min-h-screen bg-[#020617] p-6 lg:p-10 text-slate-300 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER PRO */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              Psyqus <span className="text-cyan-500">Clinical</span> Panel
            </h1>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mt-2">
              Analítica Avanzada de Salud Mental | Mtra. Esperanza P.
            </p>
          </div>
          <Link href="/dashboard" className="px-6 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-xs font-bold hover:bg-red-500/20 transition-all">
            CERRAR SESIÓN
          </Link>
        </header>

        {/* MÉTRICAS DE IMPACTO */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Nivel de Estrés Colectivo", val: "38%", color: "text-green-400" },
            { label: "Riesgo de Burnout", val: "12%", color: "text-yellow-400" },
            { label: "Mensajes en Buzón", val: "5", color: "text-purple-400" },
            { label: "Participación Total", val: "92%", color: "text-cyan-400" }
          ].map((stat, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem]">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className={`text-4xl font-black ${stat.color}`}>{stat.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* COLUMNA DE MENSAJES */}
          <section className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-[3rem] p-8 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              Buzón de Paz (Entrada Directa)
            </h2>
            <div className="space-y-4">
              {[
                { m: "Siento que el equipo de ventas está muy presionado...", t: "Hace 1h", r: "Crítico" },
                { m: "Gracias por la esfera de calma, me sirvió mucho.", t: "Hace 4h", r: "Positivo" },
                { m: "Reporte de posible conflicto en área operativa.", t: "Ayer", r: "Alerta" }
              ].map((msg, i) => (
                <div key={i} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-cyan-500/40 transition-all">
                  <div>
                    <p className="text-sm text-slate-300 italic mb-1">"{msg.m}"</p>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">{msg.t}</span>
                  </div>
                  <span className={`text-[8px] font-bold px-3 py-1 rounded-full ${msg.r === 'Crítico' ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                    {msg.r}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* COLUMNA DE IA PREDICTIVA */}
          <aside className="space-y-6">
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8 rounded-[3rem] border border-indigo-500/20 shadow-2xl">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-2xl mb-6">🧠</div>
              <h3 className="text-lg font-bold text-white mb-3">Sugerencia IA</h3>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Se detecta una tendencia de fatiga los días jueves. Se recomienda a la Mtra. Esperanza lanzar una cápsula de 1 min de estiramiento mental el miércoles tarde."
              </p>
            </div>
            
            <button className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-[2rem] tracking-widest text-xs shadow-lg transition-all active:scale-95 uppercase">
              Generar Reporte PDF NOM-035
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}