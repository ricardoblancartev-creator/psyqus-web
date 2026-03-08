"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function EncuestaPsyqus() {
  const [paso, setPaso] = useState('departamento'); // departamento, motivacion, preguntas
  const [departamento, setDepartamento] = useState("");
  const [pasoModulo, setPasoModulo] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});

  const MODULOS = [
    { id: 1, categoria: "Ambiente", nombre: "Condiciones del Entorno", preguntas: ["¿Consideras que tu espacio de trabajo te permite alcanzar tu máximo potencial?", "¿Los recursos que tienes son dignos para tu labor?", "¿Tu entorno físico es seguro y saludable?"] },
    { id: 2, categoria: "Carga", nombre: "Ritmo y Carga de Trabajo", preguntas: ["¿Sientes que el tiempo que inviertes en tu trabajo es productivo para tu vida?", "¿Tus responsabilidades están alineadas con tus capacidades?", "¿Puedes organizar tu jornada con autonomía?"] },
    { id: 3, categoria: "Control", nombre: "Sentido de Pertenencia", preguntas: ["¿Tienes influencia sobre cómo realizas tu trabajo?", "¿Se te permite proponer mejoras en tus procesos?", "¿Sientes que tu trabajo tiene un propósito claro?"] },
    { id: 4, categoria: "Jornada", nombre: "Equilibrio Vida-Trabajo", preguntas: ["¿Tu jornada laboral respeta tus espacios de descanso y familia?", "¿Logras desconectarte mentalmente al finalizar tu día?", "¿La empresa apoya tu bienestar fuera de la oficina?"] },
    { id: 5, categoria: "Liderazgo", nombre: "Liderazgo Humanista", preguntas: ["¿Tu líder te trata con respeto y aceptación incondicional?", "¿Recibes apoyo para resolver problemas laborales?", "¿La comunicación con tus jefes es abierta y honesta?"] },
    { id: 6, categoria: "Reconocimiento", nombre: "Autorrealización", preguntas: ["¿Recibes reconocimiento cuando haces un excelente trabajo?", "¿Sientes que estás creciendo como persona en esta empresa?", "¿Te sientes orgulloso de pertenecer a esta organización?"] }
  ];

  const handleFinalizar = async () => {
    const data = {
      usuario_id: "ANONIMO",
      departamento,
      modulo_1_score: ( (respuestas[MODULOS[0].preguntas[0]] || 0) + (respuestas[MODULOS[0].preguntas[1]] || 0) + (respuestas[MODULOS[0].preguntas[2]] || 0) ) / 3,
      modulo_2_score: ( (respuestas[MODULOS[1].preguntas[0]] || 0) + (respuestas[MODULOS[1].preguntas[1]] || 0) + (respuestas[MODULOS[1].preguntas[2]] || 0) ) / 3,
      modulo_3_score: ( (respuestas[MODULOS[2].preguntas[0]] || 0) + (respuestas[MODULOS[2].preguntas[1]] || 0) + (respuestas[MODULOS[2].preguntas[2]] || 0) ) / 3,
      modulo_4_score: ( (respuestas[MODULOS[3].preguntas[0]] || 0) + (respuestas[MODULOS[3].preguntas[1]] || 0) + (respuestas[MODULOS[3].preguntas[2]] || 0) ) / 3,
      modulo_5_score: ( (respuestas[MODULOS[4].preguntas[0]] || 0) + (respuestas[MODULOS[4].preguntas[1]] || 0) + (respuestas[MODULOS[4].preguntas[2]] || 0) ) / 3,
      modulo_6_score: ( (respuestas[MODULOS[5].preguntas[0]] || 0) + (respuestas[MODULOS[5].preguntas[1]] || 0) + (respuestas[MODULOS[5].preguntas[2]] || 0) ) / 3,
      fecha: new Date().toISOString()
    };
    const { error } = await supabase.from('resultados_encuesta').insert([data]);
    if (!error) window.location.href = "/gracias";
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 flex items-center justify-center font-sans">
      <AnimatePresence mode="wait">
        {/* PASO 1: DEPARTAMENTO */}
        {paso === 'departamento' && (
          <motion.div key="dept" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[3rem] text-center">
            <h2 className="text-xl font-black italic uppercase text-cyan-500 mb-6 italic">Identificación</h2>
            <select onChange={(e) => setDepartamento(e.target.value)} className="w-full bg-black border border-slate-700 p-4 rounded-2xl mb-6 text-sm">
              <option value="">Selecciona tu área...</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Administración">Administración</option>
              <option value="Ventas">Ventas</option>
            </select>
            <button disabled={!departamento} onClick={() => setPaso('motivacion')} className="w-full bg-white text-black font-black py-4 rounded-2xl text-[10px] tracking-widest disabled:opacity-20 transition-all">SIGUIENTE</button>
          </motion.div>
        )}

        {/* PASO 2: MOTIVACIÓN (ROGERS/MASLOW) */}
        {paso === 'motivacion' && (
          <motion.div key="motiva" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-lg text-center p-12 bg-gradient-to-b from-slate-900 to-black border border-cyan-500/20 rounded-[3rem] shadow-2xl">
            <div className="text-4xl mb-6">🎯</div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-4 italic">Tu bienestar es nuestro <span className="text-cyan-500">propósito</span></h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 italic">
              "La curiosa paradoja es que cuando me acepto tal como soy, entonces puedo cambiar." — <span className="text-white">Carl Rogers</span>. 
              <br /><br />
              Esta evaluación busca entender tu entorno para potenciar tu crecimiento. Responde con la honestidad de quien desea su mejor versión.
            </p>
            <button onClick={() => setPaso('preguntas')} className="w-full bg-cyan-500 text-black font-black py-4 rounded-2xl text-[10px] tracking-widest">COMENZAR DIAGNÓSTICO</button>
          </motion.div>
        )}

        {/* PASO 3: PREGUNTAS (NOM-035) */}
        {paso === 'preguntas' && (
          <motion.div key="pregs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl w-full">
            <div className="mb-10 text-center">
              <span className="text-cyan-500 font-black text-[9px] tracking-[0.4em] uppercase">Módulo {pasoModulo + 1} de 6 | {MODULOS[pasoModulo].categoria}</span>
              <h2 className="text-3xl font-black italic uppercase mt-2 italic">{MODULOS[pasoModulo].nombre}</h2>
            </div>
            <div className="space-y-6">
              {MODULOS[pasoModulo].preguntas.map((p, i) => (
                <div key={i} className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                  <p className="text-sm mb-6 text-slate-300 italic">{p}</p>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => setRespuestas({ ...respuestas, [p]: n })} className={`py-4 rounded-xl border text-[10px] font-bold transition-all ${respuestas[p] === n ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-black/50 border-slate-700 text-slate-500'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex justify-between">
              <button onClick={() => pasoModulo > 0 && setPasoModulo(pasoModulo - 1)} className={`text-slate-500 font-bold uppercase text-[10px] ${pasoModulo === 0 ? 'opacity-0' : ''}`}>Anterior</button>
              {pasoModulo < 5 ? (
                <button onClick={() => setPasoModulo(pasoModulo + 1)} className="bg-white text-black px-10 py-3 rounded-xl font-black uppercase text-[10px]">Siguiente</button>
              ) : (
                <button onClick={handleFinalizar} className="bg-cyan-500 text-black px-10 py-3 rounded-xl font-black uppercase text-[10px]">Finalizar</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}