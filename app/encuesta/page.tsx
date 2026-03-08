"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EncuestaPsyqus() {
  // 1. ESTADOS DE CONTROL
  const [pasoInicial, setPasoInicial] = useState(true);
  const [departamento, setDepartamento] = useState("");
  const [pasoModulo, setPasoModulo] = useState(0);

  // 2. ESTADOS PARA LAS RESPUESTAS (Módulos de la NOM-035)
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});

  // 3. DEFINICIÓN DE MÓDULOS (Tu metodología de 6 puntos)
  const MODULOS = [
    { id: 1, nombre: "Ambiente Laboral", preguntas: ["¿Tu carga de trabajo es excesiva?", "¿Tienes los recursos necesarios?", "¿Las condiciones físicas son adecuadas?"] },
    { id: 2, nombre: "Liderazgo", preguntas: ["¿Tu jefe escucha tus sugerencias?", "¿Hay respeto en tu equipo?", "¿La comunicación es clara?"] },
    { id: 3, nombre: "Carga Emocional", preguntas: ["¿Terminas el día agotado?", "¿Sientes ansiedad por el trabajo?", "¿Te cuesta desconectarte?"] },
    { id: 4, nombre: "Violencia Laboral", preguntas: ["¿Has presenciado malos tratos?", "¿Existe trato justo?", "¿Te sientes seguro en tu entorno?"] },
    { id: 5, nombre: "Comunicación", preguntas: ["¿Se resuelven los conflictos sanamente?", "¿Hay empatía entre colegas?", "¿Te sientes parte del equipo?"] },
    { id: 6, nombre: "Desarrollo", preguntas: ["¿Sientes que creces profesionalmente?", "¿Tu trabajo tiene sentido para ti?", "¿Hay oportunidades de aprendizaje?"] }
  ];

  // 4. FUNCIONES DE CÁLCULO
  const calcularPromedioModulo = (moduloId: number) => {
    const preguntasModulo = MODULOS[moduloId - 1].preguntas;
    const valores = preguntasModulo.map(p => respuestas[p] || 0);
    const suma = valores.reduce((a, b) => a + b, 0);
    return Number((suma / preguntasModulo.length).toFixed(2));
  };

  const handleFinalizar = async () => {
    const dataParaGuardar = {
      usuario_id: "ANONIMO",
      departamento: departamento,
      modulo_1_score: calcularPromedioModulo(1),
      modulo_2_score: calcularPromedioModulo(2),
      modulo_3_score: calcularPromedioModulo(3),
      modulo_4_score: calcularPromedioModulo(4),
      modulo_5_score: calcularPromedioModulo(5),
      modulo_6_score: calcularPromedioModulo(6),
      fecha: new Date().toISOString()
    };

    const { error } = await supabase.from('resultados_encuesta').insert([dataParaGuardar]);

    if (!error) {
      window.location.href = "/gracias";
    } else {
      alert("Error al guardar: " + error.message);
    }
  };

  // PANTALLA A: SELECCIÓN DE DEPARTAMENTO
  if (pasoInicial) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-slate-900/50 border border-slate-800 p-10 rounded-[2.5rem] text-center">
          <h2 className="text-xl font-black uppercase italic mb-6 text-cyan-500">Selecciona tu Área</h2>
          <select 
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full bg-black border border-slate-700 p-4 rounded-xl text-white mb-6 outline-none appearance-none"
          >
            <option value="">Elegir Departamento...</option>
            <option value="Operaciones">Operaciones</option>
            <option value="Ventas">Ventas</option>
            <option value="RH">Recursos Humanos</option>
            <option value="Administración">Administración</option>
          </select>
          <button 
            disabled={!departamento}
            onClick={() => setPasoInicial(false)}
            className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl disabled:opacity-30 transition-all"
          >CONTINUAR</button>
        </div>
      </div>
    );
  }

  // PANTALLA B: ENCUESTA POR MÓDULOS
  return (
    <main className="min-h-screen bg-[#020617] text-white p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <header className="mb-10 text-center">
          <span className="text-cyan-500 font-bold text-[10px] tracking-widest uppercase">Módulo {pasoModulo + 1} de 6</span>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">{MODULOS[pasoModulo].nombre}</h2>
        </header>

        <div className="space-y-6">
          {MODULOS[pasoModulo].preguntas.map((pregunta, i) => (
            <div key={i} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
              <p className="text-sm mb-4 italic text-slate-300">{pregunta}</p>
              <div className="grid grid-cols-5 gap-2 text-[10px] font-bold uppercase">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setRespuestas({ ...respuestas, [pregunta]: num })}
                    className={`py-3 rounded-xl border transition-all ${
                      respuestas[pregunta] === num ? 'bg-cyan-500 border-cyan-500 text-black' : 'bg-black/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {num === 1 ? 'Nunca' : num === 5 ? 'Siempre' : num}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-between">
          <button 
            onClick={() => pasoModulo > 0 && setPasoModulo(pasoModulo - 1)}
            className={`text-slate-500 font-bold uppercase text-xs ${pasoModulo === 0 ? 'opacity-0' : ''}`}
          >Anterior</button>
          
          {pasoModulo < 5 ? (
            <button 
              onClick={() => setPasoModulo(pasoModulo + 1)}
              className="bg-white text-black px-8 py-3 rounded-xl font-black uppercase text-xs"
            >Siguiente</button>
          ) : (
            <button 
              onClick={handleFinalizar}
              className="bg-cyan-500 text-black px-8 py-3 rounded-xl font-black uppercase text-xs"
            >Finalizar Diagnóstico</button>
          )}
        </div>
      </div>
    </main>
  );
}