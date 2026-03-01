"use client";
import React from 'react';
import Link from 'next/link';
import RadarBienestar from './components/RadarBienestar';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#0f172a] p-6 lg:p-12 text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* --- ENCABEZADO FUTURISTA --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
              PSYQUS INTELLIGENCE
            </h1>
            <p className="text-slate-400 mt-2 uppercase tracking-[0.2em] text-xs font-bold">
              Unidad de Monitoreo Psicosocial
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-xs flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
              SISTEMA ACTIVO
            </div>
          </div>
        </header>

        {/* --- SECCIÓN DE ESTADO Y GAMIFICACIÓN --- */}
        <section className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 uppercase text-[8px] font-bold text-slate-500 tracking-widest">Live Status</div>
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                <motion.circle 
                  initial={{ strokeDasharray: "0 251" }}
                  animate={{ strokeDasharray: "180 251" }}
                  cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                />
              </svg>
              <span className="absolute text-2xl font-black text-white">72%</span>
            </div>
            <h3 className="mt-4 font-bold text-slate-200">Índice de Resiliencia</h3>
            <p className="text-[10px] text-cyan-500 font-mono tracking-tighter uppercase">Nivel: Óptimo-Alerta</p>
          </div>

          <Link href="/entrenamiento" className="group md:col-span-2">
            <div className="p-6 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-3xl hover:border-purple-400 transition-all h-full flex items-center gap-6 cursor-pointer">
              <div className="w-20 h-20 bg-purple-500/20 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                🎮
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Zona de Neuro-Training</h3>
                <p className="text-slate-400 text-sm">Ejercicios interactivos para "resetear" tu cerebro en 3 minutos.</p>
                <div className="mt-3 flex gap-2">
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">Lógica</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded border border-indigo-500/30">Calma</span>
                  <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-1 rounded border border-pink-500/30">+50 EXP</span>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* --- SECCIÓN 1: ACCIONES RÁPIDAS --- */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <Link href="/encuesta" className="group">
            <motion.div whileHover={{ y: -5 }} className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl hover:border-cyan-500/50 transition-all cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
                <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">NOM-035</span>
              </div>
              <h3 className="text-xl font-bold mt-4 text-white">Encuesta de Riesgo</h3>
              <p className="text-slate-400 text-sm mt-1">Evalúa tu entorno laboral y genera tu reporte semanal.</p>
              <div className="mt-4 text-sm font-bold text-cyan-400 group-hover:translate-x-2 transition-transform">Comenzar evaluación →</div>
            </motion.div>
          </Link>

          <Link href="/buzon" className="group">
            <motion.div whileHover={{ y: -5 }} className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl hover:border-purple-500/50 transition-all cursor-pointer h-full">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md">ANÓNIMO</span>
              </div>
              <h3 className="text-xl font-bold mt-4 text-white">Buzón de Paz</h3>
              <p className="text-slate-400 text-sm mt-1">Reporta incidencias o comparte sugerencias de mejora.</p>
              <div className="mt-4 text-sm font-bold text-purple-400 group-hover:translate-x-2 transition-transform">Redactar mensaje →</div>
            </motion.div>
          </Link>
        </section>

        <section className="mb-10">
          <RadarBienestar />
        </section>

        {/* --- SECCIÓN 3: NEUROCIENCIA --- */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Neuro-Insight</span>
              <h4 className="text-2xl font-black mt-4 leading-tight">¿Tu lenguaje libera Oxitocina o Cortisol?</h4>
              <p className="mt-4 text-indigo-100 text-sm leading-relaxed">Descubre cómo las palabras asertivas transforman la química cerebral del equipo.</p>
              
              {/* LINK CORREGIDO AQUÍ */}
              <Link 
                href="/articulos/comunicacion" 
                className="mt-6 inline-block text-sm font-bold border-b-2 border-white/30 pb-1 hover:border-white transition-all text-white uppercase tracking-widest"
              >
                LEER ANÁLISIS COMPLETO
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          </div>

          <div className="border border-slate-800 bg-slate-900/50 rounded-3xl p-8 flex flex-col justify-center items-center text-center group border-dashed">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h4 className="text-white font-bold text-lg uppercase tracking-tighter">Predicción de Burnout</h4>
            <div className="mt-6 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 2, repeat: Infinity }} className="bg-cyan-500 h-full" />
            </div>
          </div>
        </section>

      </div>
      <footer className="mt-20 border-t border-slate-800 pt-10 pb-10 flex justify-between items-center text-[9px] text-slate-600 uppercase tracking-[0.4em]">
        <p>Psyqus Engine v1.0.4 - 2026</p>
        <Link href="/admin" className="text-slate-700 hover:text-cyan-500 font-bold tracking-widest transition-colors">Acceso Especialista</Link>
      </footer>
    </main>
  );
}