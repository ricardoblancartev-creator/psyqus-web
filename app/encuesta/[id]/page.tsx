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
    
    // Lógica de Interpretación NOM-035 (Guía I)
    const requiereAtencion = Object.values(respuestas).includes("si");
    const interpretacion = requiereAtencion 
      ? "El trabajador requiere valoración clínica inmediata por exposición a acontecimientos traumáticos." 
      : "El trabajador no manifiesta síntomas que requieran atención clínica inmediata.";

    await supabase.from('respuestas_encuesta').insert([{
      centro_trabajo_id: params.id,
      respuestas: respuestas,
      resultado: interpretacion,
      requiere_atencion: requiereAtencion
    }]);

    setEnviado(true);
  };

  if (enviado) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm">
        <h2 className="text-2xl font-bold text-green-600">¡Encuesta Finalizada!</h2>
        <p className="text-gray-600 mt-2">Tu participación ayuda a crear un mejor entorno laboral en {empresa?.nombre}.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-blue-700 p-6 text-white text-center">
          <h1 className="text-xl font-bold uppercase tracking-widest">Psyqus - NOM-035</h1>
          <p className="opacity-80 mt-1">{empresa?.nombre || "Cargando..."}</p>
        </div>
        
        <form onSubmit={finalizarEncuesta} className="p-8 space-y-8">
          <section>
            <h3 className="font-bold text-lg text-slate-800 mb-4">Sección I: Acontecimientos Traumáticos</h3>
            <p className="text-sm text-gray-500 mb-6">¿Durante el último mes ha tenido recuerdos persistentes sobre algún evento traumático en el trabajo?</p>
            
            <div className="space-y-4">
              {["Recuerdos recurrentes", "Sueños de carácter angustiante", "Esfuerzos por evitar pensamientos"].map((pregunta, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-gray-700 font-medium">{pregunta}</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name={`p${i}`} value="si" required className="w-5 h-5 accent-blue-600" /> Sí
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="radio" name={`p${i}`} value="no" required className="w-5 h-5 accent-blue-600" /> No
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-95 shadow-lg shadow-blue-200">
            Enviar Respuestas y Finalizar
          </button>
        </form>
      </div>
    </div>
  );
}