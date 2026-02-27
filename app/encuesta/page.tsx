"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PREGUNTAS = [
  { id: 1, texto: "¿Te sientes estresado por la carga de trabajo?" },
  { id: 2, texto: "¿Sientes que el tiempo de trabajo es excesivo?" },
  { id: 3, texto: "¿Sientes apoyo de tus compañeros de trabajo?" },
];

export default function EncuestaPage() {
  const [respuestas, setRespuestas] = useState<{ [key: number]: number }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeleccion = (preguntaId: number, valor: number) => {
    setRespuestas({ ...respuestas, [preguntaId]: valor });
  };

  const calcularNivel = (total: number) => {
    if (total <= 6) return "Bajo";
    if (total <= 10) return "Moderado";
    return "Alto";
  };

  const guardarEncuesta = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Debes iniciar sesión");
      setLoading(false);
      return;
    }

    const total = Object.values(respuestas).reduce((acc, curr) => acc + curr, 0);
    const nivel = calcularNivel(total);

    const { error } = await supabase.from('respuestas').insert([
      { user_id: user.id, total, nivel }
    ]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      router.push('/dashboard');
    }
    setLoading(false);
  };

  const listo = Object.keys(respuestas).length === PREGUNTAS.length;

  return (
    <div className="max-w-xl mx-auto p-6">
      <Link href="/dashboard" className="text-blue-600 text-sm mb-4 block">← Volver al Dashboard</Link>
      <h1 className="text-2xl font-bold mb-6">Encuesta NOM-035</h1>
      
      {PREGUNTAS.map((p) => (
        <div key={p.id} className="mb-6 p-4 border rounded-lg bg-white shadow-sm">
          <p className="mb-3 font-medium">{p.texto}</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => handleSeleccion(p.id, v)}
                className={`w-10 h-10 rounded ${respuestas[p.id] === v ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={guardarEncuesta}
        disabled={!listo || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300"
      >
        {loading ? "Enviando..." : "Finalizar y Guardar"}
      </button>
    </div>
  );
}