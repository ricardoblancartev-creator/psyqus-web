"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function TrainingPage() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);

  return (
    <main className="min-h-screen bg-[#080c14] p-6 lg:p-20 text-slate-200 overflow-hidden relative">
      {/* Luces de fondo estilo Cyberpunk */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-2 mb-10 transition-all group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> VOLVER AL CUARTEL GENERAL
        </Link>

        <header className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase italic">
              NEURO-<span className="text-purple-500 text-shadow-neon">LAB</span>
            </h1>
            <p className="text-slate-500 mt-4 font-mono text-sm tracking-[0.3em] uppercase">Entrenamiento de Resiliencia Cognitiva</p>
          </motion.div>
        </header>

        {/* --- EL JUEGO: ESFERA DE RESPIRACIÓN RÍTMICA --- */}
        <section className="bg-slate-900/40 border border-purple-500/20 rounded-[3rem] p-8 md:p-16 flex flex-col items-center shadow-2xl backdrop-blur-xl relative overflow-hidden">
          
          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Esfera de Calma v1.0</h2>
            <p className="text-purple-400 font-mono text-xs mb-12 uppercase tracking-widest">Protocolo: Reducción de Cortisol</p>
            
            <div className="relative w-72 h-72 flex items-center justify-center">
              {/* Esfera con Glow Animado */}
              <AnimatePresence>
                <motion.div
                  animate={{
                    scale: isBreathing ? [1, 1.8, 1] : 1,
                    opacity: isBreathing ? [0.3, 0.7, 0.3] : 0.2,
                  }}
                  transition={{
                    duration: 5, // Ritmo de respiración profunda
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-48 h-48 bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 rounded-full blur-2xl absolute"
                />
              </AnimatePresence>

              <motion.div
                animate={{
                  scale: isBreathing ? [1, 1.4, 1] : 1,
                  borderColor: isBreathing ? ["#a855f7", "#22d3ee", "#a855f7"] : "#4b5563"
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-48 h-48 border-4 rounded-full flex flex-col items-center justify-center relative z-10 bg-slate-900/80 shadow-inner"
              >
                <span className="font-black text-white text-lg tracking-tighter">
                  {isBreathing ? "RESPIRA" : "READY?"}
                </span>
                {isBreathing && (
                  <motion.span 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="text-[10px] text-cyan-400 font-bold mt-2"
                  >
                    INHALA ... EXHALA
                  </motion.span>
                )}
              </motion.div>
            </div>

            <div className="mt-16 text-center">
              {!isBreathing ? (
                <button 
                  onClick={() => setIsBreathing(true)}
                  className="bg-purple-600 hover:bg-purple-500 text-white px-12 py-4 rounded-full font-black tracking-widest text-sm shadow-[0_0_30px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95"
                >
                  INICIAR PROTOCOLO
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsBreathing(false);
                    setSessionDone(true);
                  }}
                  className="bg-transparent border border-red-500/50 text-red-400 px-12 py-4 rounded-full font-black tracking-widest text-sm hover:bg-red-500/10 transition-all"
                >
                  FINALIZAR SESIÓN
                </button>
              )}
            </div>
          </div>
        </section>

        {/* --- SISTEMA DE PROGRESO (GAMIFICACIÓN) --- */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Control Emocional', val: '85%', color: 'bg-purple-500' },
            { label: 'Enfoque Beta', val: '62%', color: 'bg-cyan-500' },
            { label: 'Nivel Oxitocina', val: '40%', color: 'bg-pink-500' },
            { label: 'Racha Semanal', val: '3 Días', color: 'bg-green-500' },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl"
            >
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-xl font-black text-white mb-2">{stat.val}</p>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} w-2/3`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Notificación de Éxito */}
      <AnimatePresence>
        {sessionDone && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-md"
            onClick={() => setSessionDone(false)}
          >
            <div className="bg-slate-800 border border-green-500/50 p-10 rounded-[3rem] text-center max-w-xs shadow-[0_0_50px_rgba(34,197,94,0.2)]">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase">¡Sesión Completa!</h3>
              <p className="text-slate-400 text-sm mb-6">Tu sistema nervioso ha sido recalibrado con éxito. +100 XP de Resiliencia.</p>
              <button className="bg-green-600 text-white px-8 py-2 rounded-full font-bold text-xs uppercase">Aceptar</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}