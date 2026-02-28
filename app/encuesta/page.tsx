"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BANCO_PREGUNTAS, OBTENER_DIAGNOSTICO, FIRMA_MTRA } from '@/app/encuesta/constants';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // Conexión a DB
import { useUser } from '@clerk/nextjs';   // Conexión a Usuario

export default function EncuestaPage() {
  const { user } = useUser();
  const [step, setStep] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const manejarRespuesta = (valor: number) => {
    const nuevasRespuestas = [...respuestas, valor];
    if (step < BANCO_PREGUNTAS.length - 1) {
      setRespuestas(nuevasRespuestas);
      setStep(step + 1);
    } else {
      setRespuestas(nuevasRespuestas);
      setFinalizado(true);
    }
  };

  const calcularPromedio = () => {
    const suma = respuestas.reduce((a, b) => a + b, 0);
    const maximoPosible = BANCO_PREGUNTAS.length * 5;
    return Math.round((suma / maximoPosible) * 100);
  };

  // EFECTO PARA GUARDAR EN SUPABASE AUTOMÁTICAMENTE
  useEffect(() => {
    const guardarDatos = async () => {
      if (finalizado && !guardado) {
        const score = calcularPromedio();
        const { error } = await supabase
          .from('resultados_encuestas')
          .insert([{ 
            usuario_id: user?.id || 'anonimo', 
            respuestas: respuestas,
            puntaje_total: score 
          }]);
        
        if (!error) setGuardado(true);
      }
    };
    guardarDatos();
  }, [finalizado]);

  if (finalizado) {
    const score = calcularPromedio();
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 text-white">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl p-10 rounded-[3rem] border border-cyan-500/30 text-center shadow-2xl"
        >
          <div className="mb-6">
            <span className="text-cyan-400 text-xs font-mono uppercase tracking-[0.3em]">
              {guardado ? "Análisis Guardado" : "Procesando..."}
            </span>
            <h2 className="text-5xl font-black mt-2 leading-none">{score}%</h2>
            <p className="text-slate-500 text-xs uppercase mt-1 font-bold">Índice de Bienestar</p>
          </div>

          <div className="h-2 w-full bg-slate-900 rounded-full mb-8 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${score}%` }} 
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.5)]" 
            />
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl mb-8 border border-slate-700/50 text-left">
            <p className="text-slate-300 italic text-sm leading-relaxed">
              "{OBTENER_DIAGNOSTICO(score)}"
            </p>
          </div>
          
          <div className="border-t border-slate-700/50 pt-6 text-left">
            <p className="font-black text-white text-sm uppercase">{FIRMA_MTRA.nombre}</p>
            <p className="text-[9px] text-slate-500 tracking-[0.2em] font-bold">{FIRMA_MTRA.cedula}</p>
          </div>
          
          <Link 
            href="/dashboard" 
            className="inline-block mt-10 w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-2xl transition-all shadow-lg active:scale-95"
          >
            VOLVER AL PANEL
          </Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f172a] p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.1),transparent)] pointer-events-none" />
      
      <div className="w-full max-w-xl relative z-10">
        <header className="mb-12">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em]">Evaluación Semanal</p>
              <h3 className="text-white font-bold text-xl tracking-tighter">Psyqus Intelligence</h3>
            </div>
            <p className="text-slate-500 text-xs font-mono">{step + 1} / {BANCO_PREGUNTAS.length}</p>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${((step + 1) / BANCO_PREGUNTAS.length) * 100}%` }} 
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
            />
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            <div className="mb-10">
              <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Módulo: {BANCO_PREGUNTAS[step].categoria}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-[1.1] mt-6 tracking-tighter">
                {BANCO_PREGUNTAS[step].texto}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { t: "Nunca", v: 1 },
                { t: "Casi nunca", v: 2 },
                { t: "A veces", v: 3 },
                { t: "Frecuentemente", v: 4 },
                { t: "Siempre", v: 5 }
              ].map((opcion, index) => (
                <motion.button
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  key={index}
                  onClick={() => manejarRespuesta(opcion.v)}
                  className="w-full py-5 px-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-slate-300 hover:bg-indigo-600/20 hover:text-white hover:border-indigo-500/50 transition-all font-bold text-left flex justify-between items-center group"
                >
                  <span>{opcion.t}</span>
                  <span className="opacity-0 group-hover:opacity-100 text-indigo-400 text-xs font-mono">SELECCIONAR</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        
        <footer className="mt-12 text-center">
          <p className="text-slate-600 text-[9px] uppercase tracking-widest font-bold">
            Tus respuestas son procesadas de forma cifrada y anónima
          </p>
        </footer>
      </div>
    </main>
  );
}