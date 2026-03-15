"use client";

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import Link from 'next/link';

export default function DashboardPage() {
  const [datosRadar, setDatosRadar] = useState<any[]>([]);
  const [statsMaster, setStatsMaster] = useState({
    puntaje: 0,
    nivel: 'Cargando...',
    color: '#06b6d4',
    participacion: '92%',
    clima: '8.4'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const { data, error } = await supabase
          .from('resultados_encuesta')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (data && data[0]) {
          const d = data[0];
          
          // Actualizar Radar
          setDatosRadar([
            { subject: 'Atención', A: d.atencion, fullMark: 10 },
            { subject: 'Resiliencia', A: d.resiliencia, fullMark: 10 },
            { subject: 'Empatía', A: d.empatia, fullMark: 10 },
            { subject: 'Liderazgo', A: d.liderazgo, fullMark: 10 },
            { subject: 'Enfoque', A: d.enfoque, fullMark: 10 },
            { subject: 'Balance', A: d.balance, fullMark: 10 },
          ]);

          // Actualizar Stats de la NOM-035
          setStatsMaster(prev => ({
            ...prev,
            puntaje: d.puntaje_total || 0,
            nivel: d.nivel_riesgo || 'Nulo',
            color: d.color_alerta || '#22c55e'
          }));
        }
      } catch (err) {
        console.error("Error cargando Dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Pro */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 border-b border-slate-800 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-cyan-500 rounded-full animate-ping"></span>
                <p className="text-cyan-500 font-mono text-[10px] tracking-[0.4em] uppercase">Real-Time Analytics</p>
            </div>
            <h1 className="text-5xl font-black tracking-tighter">CENTRO DE CONTROL</h1>
          </div>
          
          <div className="flex gap-4">
            <Link href="/encuesta" className="px-6 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-xs font-bold hover:bg-slate-800 transition-all uppercase tracking-widest">Nueva Evaluación</Link>
            <div className="bg-slate-900/80 border border-slate-700 px-6 py-3 rounded-2xl backdrop-blur-xl">
              <p className="text-slate-500 text-[9px] uppercase tracking-widest mb-1 font-bold">Protocolo Activo</p>
              <span className="text-white text-xs font-black tracking-widest">NOM-035-STPS-2018</span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Métricas Principales */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Tarjeta de Riesgo Principal */}
            <div className="p-8 rounded-[2.5rem] border transition-all duration-700 shadow-2xl overflow-hidden relative" 
                 style={{ backgroundColor: `${statsMaster.color}10`, borderColor: `${statsMaster.color}40` }}>
              <div className="absolute top-[-20px] right-[-20px] text-6xl opacity-10 font-black italic">!</div>
              <p className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2 font-bold">Riesgo Detectado</p>
              <h2 className="text-5xl font-black mb-4 tracking-tighter" style={{ color: statsMaster.color }}>
                {statsMaster.nivel}
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed opacity-80 italic">
                Puntaje Global: <span className="font-bold text-white font-mono">{statsMaster.puntaje} pts</span>
              </p>
            </div>

            {/* Grid de Stats Secundarios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
                <p className="text-slate-500 text-[10px] uppercase mb-1 font-bold">Clima</p>
                <p className="text-2xl font-black text-white">{statsMaster.clima}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
                <p className="text-slate-500 text-[10px] uppercase mb-1 font-bold">Participación</p>
                <p className="text-2xl font-black text-white">{statsMaster.participacion}</p>
              </div>
            </div>

            {/* Tarjeta IA Recomendación */}
            <div className="bg-gradient-to-br from-slate-900 to-black border border-slate-800 p-8 rounded-[2.5rem]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-cyan-500 text-xl">🤖</span>
                <h3 className="font-bold text-sm tracking-widest text-white uppercase">Psyqus AI Insight</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-medium">
                Basado en el nivel <span className="text-white underline decoration-cyan-500">{statsMaster.nivel}</span>, 
                se sugiere priorizar el canal de Buzón de Paz para mitigar factores de estrés en el liderazgo.
              </p>
            </div>
          </div>

          {/* Columna Derecha: El Radar Tecnológico */}
          <div className="lg:col-span-8 bg-slate-900/20 border border-slate-800/50 rounded-[3rem] p-10 backdrop-blur-sm relative shadow-inner">
            <h3 className="text-sm font-bold tracking-[0.3em] mb-12 flex items-center gap-4 text-slate-500 uppercase italic">
               Visualización de Competencias Psicosociales
               <div className="h-[1px] flex-1 bg-slate-800"></div>
            </h3>

            <div className="w-full h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={datosRadar}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{fill: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em'}} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    name="Puntaje"
                    dataKey="A"
                    stroke={statsMaster.color}
                    fill={statsMaster.color}
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <footer className="mt-8 flex justify-between items-center text-[10px] font-mono text-slate-600 tracking-widest uppercase">
                <span>Data Integrity Verified</span>
                <span>System v2.4</span>
            </footer>
          </div>

        </div>
      </div>
    </div>
  );
}