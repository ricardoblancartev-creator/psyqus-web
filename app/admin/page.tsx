"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

export default function AdminDashboard() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReportes() {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setReportes(data || []);
      setLoading(false);
    }
    fetchReportes();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900">Panel de Control Psyqus</h1>
        <Link href="/dashboard" className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg">
          Volver a mi perfil
        </Link>
      </div>

      <h2 className="text-xl font-bold mb-4 text-red-600 uppercase tracking-widest">Buzón de Incidencias</h2>
      
      {loading ? (
        <p>Cargando reportes...</p>
      ) : (
        <div className="overflow-x-auto shadow-xl rounded-2xl border">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
              <tr>
                <th className="p-4 border-b">Fecha</th>
                <th className="p-4 border-b">Tipo</th>
                <th className="p-4 border-b">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {reportes.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                  <td className="p-4 border-b text-sm">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      r.tipo === 'queja' ? 'bg-red-100 text-red-700' : 
                      r.tipo === 'contencion' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {r.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 border-b text-gray-700 italic">"{r.mensaje}"</td>
                </tr>
              ))}
              {reportes.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-10 text-center text-gray-400 italic">No hay mensajes en el buzón todavía.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}