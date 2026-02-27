"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [stats, setStats] = useState({ bajo: 0, moderado: 0, alto: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Obtener reportes del buzón
      const { data: dataReportes } = await supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false });

      // 2. Obtener TODAS las respuestas para las gráficas
      const { data: dataRespuestas } = await supabase
        .from('respuestas')
        .select('nivel');

      if (dataReportes) setReportes(dataReportes);
      
      if (dataRespuestas) {
        const counts = {
          bajo: dataRespuestas.filter(r => r.nivel === 'Bajo').length,
          moderado: dataRespuestas.filter(r => r.nivel === 'Moderado').length,
          alto: dataRespuestas.filter(r => r.nivel === 'Alto').length,
          total: dataRespuestas.length
        };
        setStats(counts);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Función para calcular porcentaje de la barra
  const getWidth = (count: number) => stats.total > 0 ? (count / stats.total) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-black text-blue-900">ADMIN PSYQUS</h1>
        <Link href="/dashboard" className="bg-white border px-4 py-2 rounded-xl shadow-sm hover:bg-gray-50 transition">
          Volver a mi perfil
        </Link>
      </div>

      {/* SECCIÓN DE GRÁFICAS NATIVAS */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-10">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Distribución de Riesgo Psicosocial (NOM-035)</h2>
        
        <div className="space-y-6">
          {/* Barra Nivel Bajo */}
          <div>
            <div className="flex justify-between mb-2 text-sm font-bold">
              <span className="text-green-600">RIESGO BAJO</span>
              <span>{stats.bajo} empleados ({Math.round(getWidth(stats.bajo))}%)</span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${getWidth(stats.bajo)}%` }}></div>
            </div>
          </div>

          {/* Barra Nivel Moderado */}
          <div>
            <div className="flex justify-between mb-2 text-sm font-bold text-yellow-600">
              <span>RIESGO MODERADO</span>
              <span>{stats.moderado} empleados ({Math.round(getWidth(stats.moderado))}%)</span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-yellow-500 h-full transition-all duration-1000" style={{ width: `${getWidth(stats.moderado)}%` }}></div>
            </div>
          </div>

          {/* Barra Nivel Alto */}
          <div>
            <div className="flex justify-between mb-2 text-sm font-bold text-red-600">
              <span>RIESGO ALTO</span>
              <span>{stats.alto} empleados ({Math.round(getWidth(stats.alto))}%)</span>
            </div>
            <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${getWidth(stats.alto)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE REPORTES */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="font-bold text-gray-700 uppercase tracking-widest text-xs">Buzón de Incidencias Recientes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reportes.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/50 transition">
                  <td className="p-4 text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      r.tipo === 'queja' ? 'bg-red-100 text-red-600' : 
                      r.tipo === 'contencion' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {r.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-700 font-medium">"{r.mensaje}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}