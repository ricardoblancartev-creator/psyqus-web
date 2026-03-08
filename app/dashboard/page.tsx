"use client";
import React, { useState } from 'react';
import Link from 'next/link';
// ... (tus otros imports)

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* NAVBAR */}
      <nav className="p-8 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-black italic tracking-tighter">
          PSYQUS <span className="text-cyan-500 font-light">INTELLIGENCE</span>
        </div>
        {/* El botón de Admin ahora es discreto y está hasta abajo o aquí oculto */}
      </nav>

      {/* HERO SECTION */}
      <header className="text-center pt-20 pb-32">
        <h1 className="text-7xl font-black mb-6 italic tracking-tighter">
          BIENESTAR QUE <span className="text-cyan-500">VENDE.</span>
        </h1>
        <div className="flex justify-center gap-4">
          <Link href="/encuesta">
            <button className="bg-cyan-500 text-black px-10 py-4 rounded-2xl font-black uppercase text-xs">
              Iniciar Diagnóstico
            </button>
          </Link>
          <button onClick={() => setModalOpen(true)} className="border border-slate-700 px-10 py-4 rounded-2xl font-black uppercase text-xs">
            Agendar Demo
          </button>
        </div>
      </header>

      {/* FOOTER CON AVISO DE PRIVACIDAD */}
      <footer className="py-10 border-t border-slate-900 text-center text-[10px] text-slate-500 uppercase tracking-widest">
        <p>Psyqus © 2026</p>
        <div className="mt-4 flex justify-center gap-6">
          <Link href="/privacidad" className="hover:text-white underline">Aviso de Privacidad</Link>
          <Link href="/terminos" className="hover:text-white underline">Términos y Condiciones</Link>
          {/* Link oculto para ti al admin */}
          <Link href="/admin" className="opacity-10 hover:opacity-100 italic">Master Access</Link>
        </div>
      </footer>
    </div>
  );
}