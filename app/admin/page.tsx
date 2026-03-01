"use client";
import React from 'react';
import Link from 'next/link';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-8 lg:p-16 relative overflow-hidden">
      {/* Glow de fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* HEADER PRO */}
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white">
              PSYQUS <span className="text-cyan-500">CLINICAL</span> PANEL
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">
              Consola de Inteligencia Organizacional
            </p>
          </div>
          <Link href="/dashboard" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
            ← Dashboard Usuario
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* CONTROL DE REPORTES (EL DINERO) */}
          <section className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-4">Certificación NOM-035</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xl">
                Genera la evidencia documental requerida para auditorías de la STPS. Este reporte consolida el índice de resiliencia, factores de riesgo y clima organizacional del periodo actual.
              </p>
              
              <div className="flex items-center gap-6">
                <BotonExportarPDF />
                <span className="text-[9px] text-slate-600 uppercase font-mono tracking-tighter">
                  Última sincronización: Hace 4 minutos
                </span>
              </div>
            </div>

            {/* MÉTRICAS DE IMPACTO */}
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem]">
                <h4 className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Alerta de Riesgo</h4>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">0.4</span>
                  <span className="text-green-500 text-xs font-bold mb-1">Bajo</span>
                </div>
              </div>
              <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem]">
                <h4 className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">ROI Proyectado</h4>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-cyan-400">12%</span>
                  <span className="text-slate-500 text-[8px] mb-1">Ahorro Rotación</span>
                </div>
              </div>
            </div>
          </section>

          {/* ACCIONES DE CONTROL */}
          <aside className="space-y-6">
            <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-[2rem]">
              <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-6">Gestión de Crisis</h3>
              <div className="space-y-4">
                <Link href="/buzon" className="block p-4 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all">
                  <p className="text-white font-bold text-xs">Buzón de Incidencias</p>
                  <p className="text-slate-500 text-[9px] mt-1">4 mensajes nuevos sin leer</p>
                </Link>
                <div className="block p-4 bg-slate-800/20 rounded-2xl border border-slate-700 opacity-50">
                  <p className="text-slate-400 font-bold text-xs">Configurar Alertas</p>
                  <p className="text-slate-500 text-[9px] mt-1">Módulo Premium</p>
                </div>
              </div>
            </div>

            <div className="p-6 border border-slate-800 rounded-[2rem] text-center">
                <p className="text-[10px] text-slate-600 uppercase mb-4">Estado del Servidor</p>
                <div className="flex justify-center gap-1">
                    {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="w-1.5 h-6 bg-cyan-500/20 rounded-full overflow-hidden">
                            <motion.div 
                                animate={{ height: ["20%", "80%", "20%"] }} 
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                                className="bg-cyan-500 w-full"
                            />
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