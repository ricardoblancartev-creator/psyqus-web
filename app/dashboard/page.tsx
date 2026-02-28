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

        {/* --- SECCIÓN 1: ACCIONES RÁPIDAS (ENCUESTA Y BUZÓN) --- */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          
          {/* TARJETA ENCUESTA */}
          <Link href="/encuesta" className="group">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all cursor-pointer h-full relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-2xl flex items-center justify-center text-cyan-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-cyan-500 bg-cyan-500/10 px-2 py-1 rounded-md">NOM-035 READY</span>
              </div>
              <h3 className="text-xl font-bold mt-4 text-white">Encuesta de Riesgo</h3>
              <p className="text-slate-400 text-sm mt-1">Evalúa tu entorno laboral y genera tu reporte semanal.</p>
              <div className="mt-4 text-sm font-bold text-cyan-400 group-hover:translate-x-2 transition-transform">
                Comenzar evaluación →
              </div>
            </motion.div>
          </Link>

          {/* TARJETA BUZÓN */}
          <Link href="/buzon" className="group">
            <motion.div 
              whileHover={{ y: -5 }}
              className="p-6 bg-slate-800/40 border border-slate-700 rounded-3xl hover:border-purple-500/50 hover:bg-slate-800/60 transition-all cursor-pointer h-full relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                </div>
                <span className="text-[10px] font-bold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-md">ANÓNIMO</span>
              </div>
              <h3 className="text-xl font-bold mt-4 text-white">Buzón de Paz</h3>
              <p className="text-slate-400 text-sm mt-1">Reporta incidencias o comparte sugerencias de mejora.</p>
              <div className="mt-4 text-sm font-bold text-purple-400 group-hover:translate-x-2 transition-transform">
                Redactar mensaje →
              </div>
            </motion.div>
          </Link>

        </section>

        {/* --- SECCIÓN 2: EL RADAR --- */}
        <section className="mb-10">
          <RadarBienestar />
        </section>

        {/* --- SECCIÓN 3: NEUROCIENCIA Y PREDICCIÓN --- */}
        <section className="grid md:grid-cols-2 gap-6">
          
          {/* Tarjeta Artículo */}
          <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Neuro-Insight</span>
              <h4 className="text-2xl font-black mt-4 leading-tight">
                ¿Tu lenguaje libera Oxitocina o Cortisol?
              </h4>
              <p className="mt-4 text-indigo-100 text-sm leading-relaxed">
                Descubre cómo las palabras asertivas transforman la química cerebral del equipo, reduciendo el estrés en un 30%.
              </p>
              <button className="mt-6 text-sm font-bold border-b-2 border-white/30 pb-1 hover:border-white transition-all">
                LEER ANÁLISIS COMPLETO
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>
          </div>

          {/* Tarjeta Predicción */}
          <div className="border border-slate-800 bg-slate-900/50 backdrop-blur-sm rounded-3xl p-8 flex flex-col justify-center items-center text-center group border-dashed">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h4 className="text-white font-bold text-lg uppercase tracking-tighter">Predicción de Burnout</h4>
            <p className="text-slate-500 text-xs mt-2 uppercase">Procesando patrones de comportamiento...</p>
            <div className="mt-6 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "65%" }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-cyan-500 h-full"
              />
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}