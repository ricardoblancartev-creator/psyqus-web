"use client";

import RadarBienestar from "../components/RadarBienestar";

export const dynamic = "force-dynamic";

export default function ResultadosPage() {
  // Aquí puedes usar la misma lógica que en el dashboard 
  // para mostrar un resumen más detallado
  return (
    <div className="p-8 bg-[#020617] min-h-screen text-white">
      <h1 className="text-3xl font-black italic uppercase mb-8">Análisis Detallado</h1>
      <div className="max-w-2xl mx-auto bg-slate-900/50 p-10 rounded-[3rem] border border-slate-800">
         <RadarBienestar scores={[0,0,0,0,0,0]} />
      </div>
    </div>
  );
}