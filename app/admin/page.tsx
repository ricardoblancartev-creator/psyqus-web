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
    // EL TRUCO: .toUpperCase() ignora si escribes en minúsculas
    // .trim() quita espacios accidentales al final
    if (password.trim().toUpperCase() === "ESPERANZA2026") {
      setIsAuthenticated(true);
    } else {
      alert("ACCESO DENEGADO: Clave incorrecta. Intenta con ESPERANZA2026");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200">
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.main 
            key="login"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
            <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center backdrop-blur-xl relative z-10">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-cyan-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-white font-black italic text-2xl mb-2 uppercase tracking-tighter">Acceso Especialista</h2>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-8 font-bold">Unidad de Inteligencia Psyqus</p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <input 
                  type="text" // Cambiado a text temporalmente para que veas lo que escribes
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-slate-700 rounded-xl px-4 py-4 text-cyan-400 text-center font-bold focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                  placeholder="INTRODUCIR CLAVE"
                />
                <button type="submit" className="w-full bg-cyan-500 hover:bg-white text-black font-black py-4 rounded-xl transition-all uppercase text-xs tracking-[0.2em]">
                  DESBLOQUEAR SISTEMA
                </button>
              </form>
              <Link href="/dashboard" className="block mt-8 text-[9px] text-slate-600 hover:text-white transition-colors uppercase tracking-widest font-bold">
                ← Volver al inicio
              </Link>
            </div>
          </motion.main>
        ) : (
          <motion.main 
            key="admin"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="p-8 lg:p-16 relative overflow-hidden"
          >
            {/* ... EL RESTO DE TU CÓDIGO DEL PANEL ADMIN AQUÍ ... */}
            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
                  <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Psyqus Admin</h1>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.5em] mt-2">Bienvenida Mtra. Esperanza</p>
                  </div>
                  <BotonExportarPDF />
                </header>
                {/* Agrega aquí tus otras métricas si quieres */}
                <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[2.5rem]">
                    <h2 className="text-white text-2xl font-bold mb-4 text-center">Panel de Control Activo</h2>
                    <p className="text-slate-400 text-center">El sistema ha validado tu identidad correctamente.</p>
                </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}