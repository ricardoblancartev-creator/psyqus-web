"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí conectarás con Clerk o Supabase Auth después
    alert("Simulación: Enviando enlace mágico a " + email);
    window.location.href = "/dashboard";
  };

  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[3.5rem] shadow-2xl backdrop-blur-md"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter">
            PSYQUS<span className="text-cyan-500">.</span>
          </h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">Portal de Comunicación Segura</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-4 mb-2 block">Correo Corporativo</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@empresa.com"
              className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-4 px-6 text-white focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all active:scale-95 uppercase text-sm tracking-widest">
            Entrar al Panel
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-[10px] uppercase font-bold mb-4">O accede con</p>
          <button className="flex items-center justify-center gap-3 w-full py-3 border border-slate-700 rounded-2xl text-slate-300 text-xs font-bold hover:bg-slate-800 transition-all">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="google" />
            Google Workspace
          </button>
        </div>

        <p className="mt-10 text-[9px] text-slate-600 text-center leading-relaxed">
          Al entrar, aceptas que tu comunicación con la <br/> 
          **Mtra. Esperanza P.** es confidencial y protegida.
        </p>
      </motion.div>
    </main>
  );
}