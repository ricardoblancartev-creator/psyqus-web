"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EncuestaNOM035({ params }: { params: { id: string } }) {
  const [empresa, setEmpresa] = useState<any>(null);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    async function getEmpresa() {
      const { data } = await supabase.from('centros_trabajo').select('nombre').eq('id', params.id).single();
      if (data) setEmpresa(data);
    }
    getEmpresa();
  }, [params.id]);

  const finalizarEncuesta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const respuestas = Object.fromEntries(data);
    
    const requiereAtencion = Object.values(respuestas).includes("si");
    const interpretacion = requiereAtencion 
      ? "Requiere valoración clínica." 
      : "Sin síntomas de riesgo.";

    await supabase.from('respuestas_encuesta').insert([{
      centro_trabajo_id: params.id,
      respuestas: respuestas,
      resultado: interpretacion
    }]);

    setEnviado(true);
  };

  if (enviado) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm font-sans">
        <h2 className="text-2xl font-bold text-green-600">¡Gracias!</h2>
        <p className="text-gray-600 mt-2">Respuestas enviadas con éxito.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-blue-700 p-6 text-white text-center">
          <h1 className="text-xl font-bold uppercase">Psyqus - NOM-035</h1>
          <p className="opacity-80 mt-1">{empresa?.nombre || "Cargando..."}</p>
        </div>
        <form onSubmit={finalizarEncuesta} className="p-8 space-y-8">
          <div className="space-y-4">
            <p className="text-gray-700 font-medium">¿Ha tenido recuerdos persistentes sobre algún evento traumático en el trabajo?</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2"><input type="radio" name="p1" value="si" required /> Sí</label>
              <label className="flex items-center gap-2"><input type="radio" name="p1" value="no" required /> No</label>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg">
            Enviar Respuestas
          </button>
        </form>
      </div>
    </div>
  );
}