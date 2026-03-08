"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import RadarBienestar from './components/temp_radar';
import Link from 'next/link';

export default function DashboardUsuario() {
  const [scores, setScores] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUltimoResultado = async () => {
      const { data } = await supabase
        .from('resultados_encuesta')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setScores([
          data.modulo_1_score,
          data.modulo_2_score,
          data.modulo_3_score,
          data.modulo_4_score,
          data.modulo_5_score,
          data.modulo_6_score
        ]);
      }
      setLoading(false);
    };
    fetchUltimoResultado();
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-6 lg:p-12">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8">
          <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">
            Tu Radar de <span className="text-cyan-500">Bienestar</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">
            Análisis de Riesgo Psicosocial • NOM-035
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Gráfica */}
          <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-[3rem]">
            <RadarBienestar scores={scores} />
          </div>

          {/* Interpretación Rápida */}
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase text-cyan-500 italic">Interpretación</h3>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              Este radar muestra tu equilibrio laboral. Los puntos más cercanos al borde representan áreas de fortaleza, mientras que los más cercanos al centro indican áreas de riesgo donde <span className="text-white">Psyqus</span> recomienda intervención.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/psicoeducacion" className="bg-white text-black p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 transition-colors">
                Ver Cursos
              </Link>
              <Link href="/encuesta" className="border border-slate-700 p-4 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest hover:text-cyan-500 transition-colors">
                Re-evaluar
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}