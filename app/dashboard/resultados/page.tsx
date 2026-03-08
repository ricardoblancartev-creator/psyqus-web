"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ProcesadorInteligente() {
  const [loading, setLoading] = useState(true);

  const analizarRiesgos = (puntaje: number) => {
    if (puntaje >= 140) return { nivel: "Muy Alto", color: "text-red-500", alerta: true };
    if (puntaje >= 99) return { nivel: "Alto", color: "text-orange-500", alerta: true };
    return { nivel: "Normal/Bajo", color: "text-green-500", alerta: false };
  };

  const guardarResultadoYNotificar = async (dataEncuesta: any) => {
    const { puntajeTotal, usuario_id, empresa_id } = dataEncuesta;
    const analisis = analizarRiesgos(puntajeTotal);

    // 1. Guardar en Supabase
    const { error } = await supabase.from('resultados_encuesta').insert([
      { ...dataEncuesta, nivel_riesgo: analisis.nivel }
    ]);

    // 2. Si hay ALERTA ROJA (Paso 2), mandamos notificación interna
    if (analisis.alerta) {
      await supabase.from('incidencias').insert([{
        mensaje: `🚨 ALERTA DE RIESGO: El usuario ${usuario_id} ha registrado un nivel ${analisis.nivel} (${puntajeTotal} pts). Se requiere intervención.`,
        tipo: 'SISTEMA'
      }]);
    }
  };

  return (
    <div className="p-10 text-white">
      <h2 className="text-2xl font-black italic underline decoration-cyan-500">
        PROCESANDO INTELIGENCIA...
      </h2>
      <p className="text-slate-400 mt-2 italic">Calculando dimensiones NOM-035 y verificando alertas de riesgo.</p>
    </div>
  );
}