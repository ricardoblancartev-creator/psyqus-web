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
      <h1 className="text-3xl font-bold mb-10 text-center">TU RADAR DE BIENESTAR</h1>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datos}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8'}} />
            <Radar name="Bienestar" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}