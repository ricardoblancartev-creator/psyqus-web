"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const [reportes, setReportes] = useState<any[]>([]);
  const [stats, setStats] = useState({ bajo: 0, moderado: 0, alto: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // CAMBIA ESTO POR TU CORREO PARA PROBAR
  const EMAIL_AUTORIZADO = "ricardoblancartev@gmail.com";

  useEffect(() => {
    async function verificarYExtraer() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== EMAIL_AUTORIZADO) {
        router.push('/dashboard');
        return;
      }

      // Si es el correo autorizado, cargamos los datos
      const { data: dataReportes } = await supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: dataRespuestas } = await supabase
        .from('respuestas')
        .select('nivel');

      if (dataReportes) setReportes(dataReportes);
      if (dataRespuestas) {
        setStats({
          bajo: dataRespuestas.filter(r => r.nivel === 'Bajo').length,
          moderado: dataRespuestas.filter(r => r.nivel === 'Moderado').length,
          alto: dataRespuestas.filter(r => r.nivel === 'Alto').length,
          total: dataRespuestas.length
        });
      }
      setLoading(false);
    }
    verificarYExtraer();
  }, [router]);

  // Función para que el psicólogo marque como gestionado
  const borrarReporte = async (id: number) => {
    const confirmar = confirm("¿Confirmas que ya se atendió esta situación?");
    if (confirmar) {
      const { error } = await supabase.from('reportes').delete().eq('id', id);
      if (!error) {
        setReportes(reportes.filter(r => r.id !== id));
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Verificando acceso de especialista...</div>;

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* ... (Todo el código de las gráficas que ya tenías arriba) ... */}

      {/* TARJETAS DE RESUMEN RÁPIDO */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div className="bg-blue-600 p-6 rounded-2xl text-white shadow-lg">
    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Total Evaluaciones</p>
    <div className="text-4xl font-black">{stats.total}</div>
    <p className="text-blue-200 text-xs mt-2">Participación histórica</p>
  </div>
  
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Casos Críticos</p>
    <div className="text-4xl font-black text-red-600">{stats.alto}</div>
    <p className="text-xs mt-2 text-red-400 font-medium">Requieren atención inmediata</p>
  </div>

  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Mensajes en Buzón</p>
    <div className="text-4xl font-black text-blue-900">{reportes.length}</div>
    <p className="text-gray-400 text-xs mt-2">Pendientes de revisión</p>
  </div>
</div>
      {/* TABLA DE REPORTES ACTUALIZADA */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-10">
        <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
          <h2 className="font-bold text-gray-700 uppercase tracking-widest text-xs">Casos Pendientes de Seguimiento</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-500 text-[10px] font-black uppercase">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Mensaje</th>
                <th className="p-4">Acción</th>
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
                  <td className="p-4">
                    <button 
                      onClick={() => borrarReporte(r.id)}
                      className="text-xs font-bold text-green-600 hover:text-green-800 underline"
                    >
                      Marcar como Atendido
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}