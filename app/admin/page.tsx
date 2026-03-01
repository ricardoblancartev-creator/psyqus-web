"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toUpperCase() === "ESPERANZA 2026") {
      setIsAuthenticated(true);
    } else {
      alert("ACCESO DENEGADO: Credenciales de especialista inválidas.");
    }
  };

  // PANTALLA DE BLOQUEO (SEGURIDAD)
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-xl relative z-10"
        >
          <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cyan-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter">Acceso Restringido</h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-8 font-bold">Consola de Especialista Psyqus</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
              placeholder="CONTRASEÑA MESTRA"
            />
            <button type="submit" className="w-full bg-cyan-500 hover:bg-white text-black font-black py-4 rounded-xl transition-all uppercase text-xs tracking-[0.2em] shadow-[0_0_20px_rgba(34,211,238,0.3)]">
              Verificar Identidad
            </button>
          </form>
          <Link href="/dashboard" className="block mt-8 text-[9px] text-slate-600 hover:text-white transition-colors uppercase tracking-widest font-bold">
            ← Cancelar y salir
          </Link>
        </motion.div>
      </main>
    );
  }

  // PANEL DE ADMIN (UNA VEZ AUTENTICADO)
  return (
    <main className="min-h-screen bg-[#020617] text-slate-200 p-8 lg:p-16 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">
              Psyqus <span className="text-cyan-500">Clinical</span> Panel
            </h1>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">
              Gestión de Especialista: Mtra. Esperanza
            </p>
          </div>
          <Link href="/dashboard" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all">
            ← Dashboard Usuario
          </Link>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          <section className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] backdrop-blur-xl">
              <h2 className="text-2xl font-black text-white mb-4">Certificación NOM-035</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xl">
                Genera la evidencia documental requerida para auditorías. Este reporte incluye la firma autógrafa y cédula profesional de la especialista responsable.
              </p>
              <div className="flex items-center gap-6">
                <BotonExportarPDF />
                <span className="text-[9px] text-slate-600 uppercase font-mono tracking-tighter">Status: Documento Oficial Validado</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem]">
                <h4 className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Índice Global</h4>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">72%</span>
                  <span className="text-cyan-500 text-xs font-bold mb-1">Saludable</span>
                </div>
              </div>
              <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2rem]">
                <h4 className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] mb-4">Mensajes Buzón</h4>
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-black text-white">04</span>
                  <span className="text-purple-500 text-[8px] mb-1 font-bold uppercase">Pendientes</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem]">
              <h3 className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest mb-6">Herramientas</h3>
              <div className="space-y-4">
                <Link href="/buzon" className="block p-5 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all group">
                  <p className="text-white font-bold text-xs">Acceder al Buzón</p>
                  <p className="text-slate-500 text-[9px] mt-1">Revisar denuncias anónimas</p>
                </Link>
                <Link href="/dashboard/resultados" className="block p-5 bg-slate-800/40 rounded-2xl border border-slate-700 hover:border-cyan-500 transition-all group">
                  <p className="text-white font-bold text-xs">Resultados Raw</p>
                  <p className="text-slate-500 text-[9px] mt-1">Data pura de encuestas</p>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}