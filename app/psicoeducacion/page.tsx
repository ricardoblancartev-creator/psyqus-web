"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CURSOS = [
  {
    id: 1,
    categoria: "Ambiente",
    titulo: "Optimización de Espacios",
    descripcion: "Cómo configurar tu entorno físico para reducir la fatiga mental y mejorar el enfoque.",
    tiempo: "5 min",
    color: "from-cyan-500 to-blue-500"
  },
  {
    id: 2,
    categoria: "Emociones",
    titulo: "Reset en 60 Segundos",
    descripcion: "Técnicas de respiración táctica utilizadas por equipos de alto rendimiento para bajar el cortisol.",
    tiempo: "3 min",
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: 3,
    categoria: "Liderazgo",
    titulo: "Comunicación Asertiva",
    descripcion: "Guía rápida para expresar necesidades sin generar conflictos en el equipo de trabajo.",
    tiempo: "8 min",
    color: "from-emerald-500 to-teal-500"
  },
  {
    id: 4,
    categoria: "Desarrollo",
    titulo: "Deep Work & Flow",
    descripcion: "Métodos para entrar en estado de flujo y eliminar las micro-interrupciones digitales.",
    tiempo: "6 min",
    color: "from-orange-500 to-red-500"
  }
];

export default function Psicoeducacion() {
  const [filtro, setFiltro] = useState("Todos");

  const categorias = ["Todos", "Ambiente", "Emociones", "Liderazgo", "Desarrollo"];

  const cursosFiltrados = filtro === "Todos" 
    ? CURSOS 
    : CURSOS.filter(c => c.categoria === filtro);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 lg:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <Link href="/dashboard" className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block hover:opacity-70 transition-all">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-5xl font-[1000] italic uppercase tracking-tighter italic">
            Módulos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Crecimiento</span>
          </h1>
          <p className="text-slate-500 text-sm mt-4 max-w-xl font-medium italic">
            Contenido estratégico diseñado para mitigar los factores de riesgo detectados en tu diagnóstico.
          </p>
        </header>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-10">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                filtro === cat 
                ? 'bg-cyan-500 text-black' 
                : 'bg-slate-900 border border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Tarjetas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {cursosFiltrados.map((curso) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={curso.id}
              className="group relative bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] overflow-hidden hover:border-cyan-500/50 transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${curso.color} opacity-5 blur-3xl group-hover:opacity-20 transition-all`} />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest italic">{curso.categoria}</span>
                  <span className="text-[10px] font-bold text-slate-600 uppercase">{curso.tiempo} lectura</span>
                </div>
                
                <h3 className="text-2xl font-black italic uppercase mb-4 group-hover:text-cyan-400 transition-colors tracking-tighter">
                  {curso.titulo}
                </h3>
                
                <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
                  {curso.descripcion}
                </p>

                <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white group-hover:gap-4 transition-all">
                  Comenzar Módulo <span className="text-cyan-500">→</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to action final */}
        <footer className="mt-20 p-12 bg-gradient-to-r from-slate-900 to-black border border-slate-800 rounded-[3rem] text-center">
          <h4 className="text-xl font-black uppercase italic mb-4 italic">¿Necesitas apoyo especializado?</h4>
          <p className="text-slate-500 text-sm mb-8 max-w-md mx-auto italic">
            Si sientes que el estrés está afectando tu salud, contacta a nuestra línea de apoyo confidencial.
          </p>
          <button className="bg-white text-black px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-cyan-500 transition-all">
            Contactar Especialista
          </button>
        </footer>
      </div>
    </main>
  );
}