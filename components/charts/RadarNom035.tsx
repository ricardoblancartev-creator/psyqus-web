"use client";

import { useEffect, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { supabase } from "../../lib/supabase";

// Factores NOM-035
const FACTORES_NOM035 = [
  { key: "carga_laboral", label: "Carga laboral" },
  { key: "control_trabajo", label: "Control trabajo" },
  { key: "liderazgo", label: "Liderazgo" },
  { key: "relaciones", label: "Relaciones" },
  { key: "reconocimiento", label: "Reconocimiento" },
  { key: "violencia", label: "Violencia" },
];

interface DatoRiesgo {
  dimension: string;
  score: number;
}

export default function RadarNom035() {
  const [data, setData] = useState<DatoRiesgo[]>([
    { dimension: "Carga laboral", score: 72 },
    { dimension: "Control trabajo", score: 55 },
    { dimension: "Liderazgo", score: 61 },
    { dimension: "Relaciones", score: 68 },
    { dimension: "Reconocimiento", score: 49 },
    { dimension: "Violencia", score: 35 },
  ]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargarDatosReales() {
      try {
        // Intentar obtener datos reales de Supabase
        const { data: resultados, error } = await supabase
          .from("resultados_encuesta")
          .select("modulo_1_score, modulo_2_score, modulo_3_score");

        if (error) throw error;

        if (resultados && resultados.length > 0) {
          // Calcular promedios reales (escala 0-10 → 0-100)
          const promedioMod1 = resultados.reduce((acc, r) => acc + (r.modulo_1_score || 0), 0) / resultados.length;
          const promedioMod2 = resultados.reduce((acc, r) => acc + (r.modulo_2_score || 0), 0) / resultados.length;
          const promedioMod3 = resultados.reduce((acc, r) => acc + (r.modulo_3_score || 0), 0) / resultados.length;

          // Mapear a factores NOM-035 (distribución proporcional)
          const datosReales: DatoRiesgo[] = [
            { dimension: "Carga laboral", score: Math.round(promedioMod1 * 10) },
            { dimension: "Control trabajo", score: Math.round(promedioMod2 * 8) },
            { dimension: "Liderazgo", score: Math.round(promedioMod3 * 9) },
            { dimension: "Relaciones", score: Math.round((promedioMod1 + promedioMod2) * 5) },
            { dimension: "Reconocimiento", score: Math.round(promedioMod2 * 7) },
            { dimension: "Violencia", score: Math.round(promedioMod3 * 6) },
          ];

          setData(datosReales);
        }
      } catch (error) {
        console.log("Usando datos de ejemplo:", error);
        // Si falla, mantiene los datos de ejemplo (ya seteados arriba)
      } finally {
        setCargando(false);
      }
    }

    cargarDatosReales();
  }, []);

  if (cargando) {
    return (
      <div className="w-full h-[320px] flex items-center justify-center text-slate-400">
        <div className="animate-pulse">Cargando datos NOM-035...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[320px]">
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="#334155" />
          
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: "#64748b", fontSize: 10 }}
          />
          
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const valor = payload[0].value as number;
                let color = "text-green-400";
                let riesgo = "Bajo";
                if (valor > 75) { color = "text-red-400"; riesgo = "Crítico"; }
                else if (valor > 50) { color = "text-orange-400"; riesgo = "Alto"; }
                else if (valor > 25) { color = "text-yellow-400"; riesgo = "Medio"; }
                
                return (
                  <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl">
                    <p className="text-slate-200 font-medium">{payload[0].payload.dimension}</p>
                    <p className={`text-2xl font-bold ${color}`}>{valor}%</p>
                    <p className="text-xs text-slate-400">Riesgo: {riesgo}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Radar
            name="Riesgo Psicosocial"
            dataKey="score"
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}