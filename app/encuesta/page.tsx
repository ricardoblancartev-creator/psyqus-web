"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
// Importación corregida a la nueva ruta y nombre de archivo
import { saveSurveyResults } from '../dashboard/serverActions';

export default function EncuestaPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [scores, setScores] = useState({
    atencion: 5,
    resiliencia: 5,
    empatia: 5,
    liderazgo: 5,
    enfoque: 5,
    balance: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await saveSurveyResults(scores);
      if (res.success) {
        alert("¡Encuesta guardada con éxito!");
        router.push('/dashboard');
      } else {
        alert("Error al guardar");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScores({ ...scores, [e.target.name]: parseInt(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8 text-cyan-400">EVALUACIÓN DE BIENESTAR</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        {Object.keys(scores).map((skill) => (
          <div key={skill} className="flex flex-col">
            <label className="capitalize mb-2 text-slate-300 font-medium">{skill}: {scores[skill as keyof typeof scores]}</label>
            <input
              type="range"
              min="1"
              max="10"
              name={skill}
              value={scores[skill as keyof typeof scores]}
              onChange={handleChange}
              className="accent-cyan-500 cursor-pointer"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={enviando}
          className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {enviando ? 'ENVIANDO...' : 'GUARDAR RESULTADOS'}
        </button>
      </form>
    </div>
  );
}