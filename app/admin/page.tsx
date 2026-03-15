"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BotonExportarPDF from '../dashboard/components/GeneradorPDF';
import RadarBienestar from '../dashboard/components/MapaDeCalor';

export default function AdminPage() {
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      try {
        setLoading(true);
        // Traemos todos los resultados de la tabla
        const { data, error } = await supabase
          .from('resultados_encuesta')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResultados(data || []);
      } catch (err) {
        console.error("Error en Admin:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-cyan-500 animate-pulse font-mono uppercase tracking-[0.3em]">Accediendo al Panel de Control...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">Panel de Administración</h1>
            <p className="text-slate-400 mt-2 font-mono text-sm">GESTIÓN DE RESULTADOS NOM-035</p>
          </div>
          {resultados.length > 0 && (
            <BotonExportarPDF data={resultados[0]} />
          )}
        </header>

        {resultados.length === 0 ? (
          <div className="bg-slate-900/50 border border-dashed border-slate-700 p-20 text-center rounded-3xl">
            <p className="text-slate-500 uppercase tracking-widest">No hay encuestas registradas aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tabla de Resultados */}
            <div className="lg:col-span-2 overflow-x-auto bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Puntaje</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {resultados.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="py-4 text-sm text-slate-300 font-mono">
                        {new Date(res.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-sm font-bold text-cyan-500">#{res.id}</td>
                      <td className="py-4 text-right">
                        <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-black">
                          PROCESADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Previa del último Radar */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Último Análisis</h3>
              <div className="h-[300px]">
                <RadarBienestar data={resultados[0]} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}