"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSurveyResults } from "../actions"; 

const preguntas = [
  { id: 1, texto: "¿Qué tan bien logras mantener la atención en una sola tarea?", modulo: "Atención" },
  { id: 2, texto: "¿Con qué facilidad te recuperas de un contratiempo emocional?", modulo: "Resiliencia" },
  { id: 3, texto: "¿Qué tan capaz te sientes de entender las emociones de los demás?", modulo: "Empatía" },
  { id: 4, texto: "¿Qué tanto influyes positivamente en las decisiones de tu equipo?", modulo: "Liderazgo" },
  { id: 5, texto: "¿Qué tan claro tienes tu objetivo principal del día?", modulo: "Enfoque" },
  { id: 6, texto: "¿Qué tan equilibrada sientes tu vida personal y laboral?", modulo: "Balance" },
];

export default function EncuestaPage() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const manejarRespuesta = async (valor: number) => {
    if (enviando) return;
    const nuevasRespuestas = [...respuestas, valor];
    
    if (paso < preguntas.length - 1) {
      setRespuestas(nuevasRespuestas);
      setPaso(paso + 1);
    } else {
      setEnviando(true);
      try {
        await saveSurveyResults(nuevasRespuestas);
        router.refresh(); 
        router.push("/dashboard");
      } catch (error) {
        console.error("Error:", error);
        alert("Error al sincronizar datos.");
        setEnviando(false);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Fondo de malla Cyberpunk */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full">
        {/* Indicador de Progreso Superior */}
        <div className="flex justify-center gap-3 mb-12">
          {preguntas.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 w-12 rounded-full transition-all duration-700 ${
                i <= paso ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]' : 'bg-slate-800'
              }`} 
            />
          ))}
        </div>

        <div className="bg-slate-900/40 border border-white/5 p-10 md:p-16 rounded-[3.5rem] backdrop-blur-3xl shadow-2xl relative">
          <header className="mb-10 text-center">
            <span className="text-cyan-500 font-black text-[10px] uppercase tracking-[0.5em] block mb-4">
              Neural Assessment System
            </span>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
              {preguntas[paso].modulo}
            </h1>
          </header>

          <p className="text-2xl text-center mb-12 font-medium leading-tight text-slate-200 min-h-[80px]">
            {preguntas[paso].texto}
          </p>

          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <button
                key={n}
                disabled={enviando}
                onClick={() => manejarRespuesta(n)}
                className="group relative h-16 rounded-2xl bg-slate-800/40 border border-white/5 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 font-black text-xl group-hover:text-cyan-400 transition-colors">
                  {n}
                </span>
                <div className="absolute inset-0 bg-cyan-500 opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="mt-12 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-1 h-1 bg-slate-700 rounded-full" /> Deficiente
            </span>
            <span className="text-cyan-900 font-mono">STEP_0{paso + 1}</span>
            <span className="flex items-center gap-2">
              Excelente <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
            </span>
          </div>
        </div>

        {enviando && (
          <div className="mt-8 text-center animate-pulse">
            <span className="text-cyan-500 font-black text-xs uppercase tracking-[0.3em]">
              Sincronizando con base de datos...
            </span>
          </div>
        )}
      </div>
    </main>
  );
}