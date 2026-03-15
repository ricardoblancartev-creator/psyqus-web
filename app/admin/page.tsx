"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      const { data } = await supabase
        .from('resultados_encuesta')
        .select('*')
        .order('created_at', { ascending: false });
      setResultados(data || []);
      setLoading(false);
    }
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-20 text-white bg-[#020617] min-h-screen text-center">Cargando...</div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <h1 className="text-2xl font-bold mb-8 uppercase tracking-tighter border-b border-slate-800 pb-4">Panel Admin Psyqus</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-slate-500 mb-4">HISTORIAL DE ENCUESTAS</h2>
          {resultados.map(r => (
            <div key={r.id} className="p-3 mb-2 bg-slate-800/40 rounded-lg flex justify-between font-mono text-sm">
              <span>Encuesta #{r.id}</span>
              <span className="text-cyan-400">{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
          <h2 className="text-sm font-bold text-slate-500 mb-4 w-full">VISTA RÁPIDA (ÚLTIMO RESULTADO)</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { s: 'AT', v: resultados[0]?.atencion },
                { s: 'RS', v: resultados[0]?.resiliencia },
                { s: 'EM', v: resultados[0]?.empatia },
                { s: 'LI', v: resultados[0]?.liderazgo },
                { s: 'EN', v: resultados[0]?.enfoque },
                { s: 'BA', v: resultados[0]?.balance },
              ]}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="s" tick={{fill: '#475569', fontSize: 10}} />
                <Radar dataKey="v" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}