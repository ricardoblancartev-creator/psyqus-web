"use client";

export const dynamic = 'force-dynamic'; 

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';

export default function DashboardPage() {
  const [datos, setDatos] = useState<any[]>([]);
  const [rawStats, setRawStats] = useState<any>(null);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('resultados_encuesta')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        setRawStats(data[0]);
        const formateados = [
          { subject: 'Atención', A: data[0].atencion, fullMark: 10 },
          { subject: 'Resiliencia', A: data[0].resiliencia, fullMark: 10 },
          { subject: 'Empatía', A: data[0].empatia, fullMark: 10 },
          { subject: 'Liderazgo', A: data[0].liderazgo, fullMark: 10 },
          { subject: 'Enfoque', A: data[0].enfoque, fullMark: 10 },
          { subject: 'Balance', A: data[0].balance, fullMark: 10 },
        ];
        setDatos(formateados);
      }
    }
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12">
      {/* Header con Estilo NOM */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <p className="text-cyan-500 font-mono text-xs tracking-[0.3em] mb-2 uppercase">Protocolo de Análisis</p>
          <h1 className="text-4xl font-black tracking-tight">DASHBOARD DE BIENESTAR</h1>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 px-6 py-3 rounded-2xl backdrop-blur-md">
          <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Estatus de Cumplimiento</p>
          <span className="text-emerald-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            NOM-035-STPS ACTIVA
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="grid grid-cols-2 gap-4 lg:col-span-1">
          {[
            { label: 'Riesgo Psicosocial', val: 'Bajo', color: 'text-emerald-400' },
            { label: 'Índice de Clima', val: '8.4', color: 'text-cyan-400' },
            { label: 'Participación', val: '92%', color: 'text-white' },
            { label: 'Alertas', val: '0', color: 'text-slate-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/30 border border-slate-800 p-6 rounded-3xl hover:bg-slate-900/50 transition-all text-center">
              <p className="text-slate-500 text-[10px] uppercase mb-2">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
          
          <div className="col-span-2 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/20 p-8 rounded-3xl mt-4">
            <h3 className="text-lg font-bold mb-2">Resumen Ejecutivo</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Los niveles de resiliencia y liderazgo se mantienen estables. Se recomienda reforzar el pilar de "Balance" para optimizar el rendimiento del equipo bajo los lineamientos de la NOM-035.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <p className="text-6xl font-black italic">PSY</p>
          </div>
            
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-cyan-500"></span>
            ANÁLISIS DE COMPETENCIAS
          </h3>
          
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datos}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                <Radar
                  name="Puntaje"
                  dataKey="A"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}