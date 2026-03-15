"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';

export default function DashboardReal() {
  const [datosRadar, setDatosRadar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResultados() {
      try {
        setLoading(true);
        // 1. Pedimos el último resultado insertado en la tabla
        const { data, error } = await supabase
          .from('resultados_encuesta')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) throw error;

        if (data) {
          // 2. Transformamos los datos de la fila al formato que necesita el Radar
          const formateados = [
            { tema: 'Atención', valor: data.atencion || 0 },
            { tema: 'Resiliencia', valor: data.resiliencia || 0 },
            { tema: 'Empatía', valor: data.empatia || 0 },
            { tema: 'Liderazgo', valor: data.liderazgo || 0 },
            { tema: 'Enfoque', valor: data.enfoque || 0 },
            { tema: 'Balance', valor: data.balance || 0 },
          ];
          setDatosRadar(formateados);
        }
      } catch (err) {
        console.error("Error cargando datos reales:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchResultados();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-cyan-500 animate-pulse font-mono tracking-widest">CARGANDO MÉTRICAS REALES...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-4xl mx-auto bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 backdrop-blur-md">
        <h1 className="text-2xl font-black mb-2 tracking-tighter">RADAR DE BIENESTAR</h1>
        <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest">Resultados basados en la última evaluación</p>

        <div className="w-full h-[400px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datosRadar}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="tema" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
              <Radar
                name="Bienestar"
                dataKey="valor"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.5}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px' }}
                itemStyle={{ color: '#06b6d4' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {datosRadar.map((item) => (
            <div key={item.tema} className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
              <p className="text-[10px] text-slate-500 uppercase font-bold">{item.tema}</p>
              <p className="text-xl font-black text-cyan-400">{item.valor}/10</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}