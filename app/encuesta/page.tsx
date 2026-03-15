"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSurveyResults } from '../dashboard/serverActions';

export default function EncuestaPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [scores, setScores] = useState({
    atencion: 5, resiliencia: 5, empatia: 5, liderazgo: 5, enfoque: 5, balance: 5
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    try {
      const res = await saveSurveyResults(scores);
      if (res.success) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative">
      {/* Marco Legal NOM-035 */}
      <div className="max-w-4xl mx-auto border-l-4 border-cyan-500 pl-6 mb-12">
        <h1 className="text-4xl font-black mb-2">EVALUACIÓN DE FACTORES DE RIESGO</h1>
        <p className="text-slate-400 text-sm uppercase tracking-widest font-mono">
          Protocolo de Cumplimiento: NOM-035-STPS-2018
        </p>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Sección de Avisos y Guía */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              🛡️ Aviso de Privacidad
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Los datos recopilados son estrictamente confidenciales y se utilizan únicamente para la generación de indicadores de bienestar organizacional conforme a la Ley Federal de Protección de Datos Personales.
            </p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-slate-300 font-bold mb-3">Instrucciones</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Deslice cada barra para reflejar su percepción actual en los últimos 2 meses. El valor 1 representa "Deficiente" y 10 representa "Excelente".
            </p>
          </div>
        </div>

        {/* Formulario de Encuesta */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-sm">
          {Object.keys(scores).map((skill) => (
            <div key={skill} className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="capitalize font-bold text-lg text-slate-200">{skill}</label>
                <span className="bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-sm font-mono border border-cyan-500/20">
                  Nivel: {scores[skill as keyof typeof scores]}
                </span>
              </div>
              <input
                type="range" min="1" max="10" name={skill}
                value={scores[skill as keyof typeof scores]}
                onChange={(e) => setScores({...scores, [e.target.name]: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>
          ))}

          <button
            type="submit" disabled={enviando}
            className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-2xl font-black text-lg transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 uppercase tracking-widest"
          >
            {enviando ? 'Procesando Datos...' : 'Finalizar Evaluación'}
          </button>
        </form>
      </div>
    </div>
  );
}