"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [ultimoResultado, setUltimoResultado] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function cargarDatos() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('respuestas')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        setUltimoResultado(data);
      } else {
        router.push('/login'); // Redirigir si no hay sesión
      }
      setLoading(false);
    }
    cargarDatos();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      {/* HEADER CON LOGOUT */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">PSYQUS</h1>
          <p className="text-gray-500 font-medium uppercase text-sm tracking-widest">Plataforma NOM-035</p>
        </div>
        <button 
          onClick={handleSignOut}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors border border-red-200"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tarjeta de Encuesta */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Encuesta semanal</h2>
            <p className="text-gray-500 mb-6">Mide tu bienestar emocional hoy mismo.</p>
          </div>
          <Link 
            href="/encuesta" 
            className="block w-full text-center bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Contestar encuesta
          </Link>
        </div>

        {/* Tarjeta de Resultado */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Estrésómetro</h2>
          {loading ? (
            <div className="animate-pulse flex flex-col items-center">
               <div className="h-8 w-24 bg-gray-200 rounded mb-4"></div>
            </div>
          ) : (
            <>
              <div className="text-5xl font-black mb-4" style={{ 
                color: ultimoResultado?.nivel === 'Alto' ? '#ef4444' : 
                       ultimoResultado?.nivel === 'Moderado' ? '#f59e0b' : 
                       ultimoResultado?.nivel === 'Bajo' ? '#10b981' : '#cbd5e1'
              }}>
                {ultimoResultado ? ultimoResultado.nivel : "SIN DATOS"}
              </div>
              {ultimoResultado && (
                <p className="text-gray-500 font-medium bg-gray-50 py-2 px-4 rounded-full inline-block">
                  Puntaje: {ultimoResultado.total} pts
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}