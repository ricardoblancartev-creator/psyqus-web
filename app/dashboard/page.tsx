"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase
        .from('resultados_encuesta')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (data && data[0]) {
        const formateados = [
          { subject: 'Atención', A: data[0].atencion },
          { subject: 'Resiliencia', A: data[0].resiliencia },
          { subject: 'Empatía', A: data[0].empatia },
          { subject: 'Liderazgo', A: data[0].liderazgo },
          { subject: 'Enfoque', A: data[0].enfoque },
          { subject: 'Balance', A: data[0].balance },
        ];
        setDatos(formateados);
      }
    }
    cargar();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-10">
      <h1 className="text-3xl font-bold mb-10 text-center uppercase tracking-widest text-cyan-500">Tu Radar de Bienestar</h1>
      <div className="w-full h-[450px] bg-slate-900/30 rounded-3xl border border-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datos}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 12}} />
            <Radar name="Bienestar" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-8 text-center">
        <p className="text-slate-500 text-sm font-mono">DATOS SINCRONIZADOS CON SUPABASE REAL-TIME</p>
      </div>
    </div>
  );
}