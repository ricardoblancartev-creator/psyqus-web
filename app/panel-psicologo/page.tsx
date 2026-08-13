"use client";

import { supabase } from "@/lib/supabase"
import { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";


const QUESTIONS = [
  "La cantidad de trabajo que realizo suele rebasar el tiempo disponible.",
  "Termino mi jornada con agotamiento físico o mental.",
  "En mi trabajo hay momentos de presión tan alta que me cuesta concentrarme.",
  "Mi trabajo me permite organizar mis tareas con claridad.",
  "Tengo claridad sobre lo que se espera de mí en mi puesto.",
  "Puedo tomar algunas decisiones sobre cómo realizar mi trabajo.",
  "Mi jefe inmediato escucha mis opiniones o propuestas.",
  "Recibo retroalimentación clara y útil sobre mi desempeño.",
  "Cuando surge un problema, mi liderazgo lo maneja con respeto.",
  "Siento que mi esfuerzo pasa desapercibido.",
  "En mi trabajo rara vez se reconoce lo que hago bien.",
  "Mis horarios o carga laboral interfieren con mi vida personal.",
  "Me cuesta desconectarme del trabajo incluso fuera del horario laboral.",
  "El ambiente entre compañeros suele sentirse tenso o desgastante.",
  "En mi equipo se puede hablar con respeto incluso cuando hay desacuerdo.",
  "He sentido aislamiento, indiferencia o exclusión dentro del trabajo.",
  "He recibido trato humillante, burlas o descalificación en el trabajo.",
  "Me preocupa ser castigado o señalado si expreso malestar laboral.",
  "He presenciado formas de maltrato o agresión dentro del entorno laboral.",
  "En general, siento que mi trabajo es psicológicamente sostenible.",
];

const LABELS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "Nunca",
  1: "Casi nunca",
  2: "A veces",
  3: "Casi siempre",
  4: "Siempre",
};

const COLORS: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "#67e8f9",
  1: "#c4b5fd",
  2: "#fca5a5",
  3: "#facc15",
  4: "#86efac",
};

export default function PanelPsicologoPage() {
  const [resultados, setResultados] = useState<any[]>([]);
  async function load() {
  const { data, error } = await supabase
    .from("resultados_encuestas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando resultados:", error);
    return;
  }

  setResultados(data || []);
}
  useEffect(() => {
    load();
  }, []);

  const resumen = useMemo(() => {
    return QUESTIONS.map((questionText, index) => {
      const questionNumber = String(index + 1);

      const totalPregunta: Record<0 | 1 | 2 | 3 | 4, number> = {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
      };

const areas: Record<
  string,
  {
    area: string;
    puesto: string;
    total: number;
    respuestas: Record<0 | 1 | 2 | 3 | 4, number>;
  }
> = {};


      resultados.forEach((item) => {
        const respuestas = item.respuestas || {};
        const area = item.area || "Sin área";
        const puesto = item.puesto || "Sin puesto";
        const key = `${area}__${puesto}`;

        const value = Number(respuestas[questionNumber]) as 0 | 1 | 2 | 3 | 4;

        if (value < 0 || value > 4 || Number.isNaN(value)) return;

        totalPregunta[value] += 1;

        if (!areas[key]) {
          areas[key] = {
            area,
            puesto,

            total: 0,
            respuestas: {
              0: 0,
              1: 0,
              2: 0,
              3: 0,
              4: 0,
            },
          };
        }

        areas[key].total += 1;
        areas[key].respuestas[value] += 1;
      });

      const chartData = Object.entries(totalPregunta)
        .map(([key, value]) => {
          const k = Number(key) as 0 | 1 | 2 | 3 | 4;

          return {
            key: k,
            name: LABELS[k],
            value,
            color: COLORS[k],
          };
        })
        .filter((x) => x.value > 0);

      return {
        numero: index + 1,
        pregunta: questionText,
        chartData,
        areas: Object.entries(areas).map(([key, data]) => ({
          ...data,
        })),
      };
    });
  }, [resultados]);

  return (
    <main className="min-h-screen bg-[#020617] text-white p-8">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm">
            Psyqus
          </p>

          <h1 className="text-5xl font-black text-cyan-300 mt-2">
            Panel Psicólogo
          </h1>

          <p className="text-slate-400 mt-3">
            Resultados por pregunta y área.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">
          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Evaluaciones</p>
            <p className="text-5xl font-black text-cyan-300 mt-2">
              {resultados.length}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Preguntas</p>
            <p className="text-5xl font-black text-white mt-2">
              {QUESTIONS.length}
            </p>
          </div>

          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Áreas</p>
            <p className="text-5xl font-black text-emerald-300 mt-2">
              {new Set(resultados.map((x) => x.area || "Sin área")).size}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {resumen.map((item) => (
            <div
              key={item.numero}
              className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6"
            >
              <h2 className="text-3xl font-black text-cyan-300">
                Pregunta {item.numero}
              </h2>

              <p className="text-slate-300 mt-2 mb-6">{item.pregunta}</p>

              
              <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-6 md:gap-8 items-center overflow-hidden">

                <div className="h-[260px] md:h-[340px] w-full overflow-hidden">
                  {item.chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-slate-400">
                      Sin datos para graficar.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={item.chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={
                            typeof window !== "undefined" &&
                            window.innerWidth < 768
                              ? 85
                              : 115
                          }
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {item.chartData.map((entry) => (
                            <Cell key={entry.key} fill={entry.color} />
                          ))}
                        </Pie>

                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 mb-10">
  <h2 className="text-2xl font-black text-cyan-300 mb-5">
    Participantes
  </h2>

  <div className="overflow-x-auto">
    <table className="w-full text-left">
      <thead>
        <tr className="border-b border-white/10 text-slate-400">
          <th className="py-3 pr-4">Nombre</th>
          <th className="py-3 pr-4">Área</th>
          <th className="py-3 pr-4">Puesto</th>
          <th className="py-3 pr-4">Correo</th>
        </tr>
      </thead>

      <tbody>
        {resultados.map((item, index) => (
          <tr
            key={item.id || `${item.user_id}-${index}`}
            className="border-b border-white/5"
          >
            <td className="py-4 pr-4 font-semibold text-white">
              {[item.nombre, item.apellido].filter(Boolean).join(" ") ||
                "Sin nombre"}
            </td>

            <td className="py-4 pr-4 text-slate-300">
              {item.area || "Sin área"}
            </td>

            <td className="py-4 pr-4 text-slate-300">
              {item.puesto || "Sin puesto"}
            </td>

            <td className="py-4 pr-4 text-slate-400">
              {item.email || "Sin correo"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {item.chartData.map((entry) => (
            <div
              key={entry.key}
              className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 md:p-4 overflow-hidden"
            >
              <div
                className="w-4 h-4 rounded-full mb-2"
                style={{ backgroundColor: entry.color }}
              />

              <p className="text-xs md:text-sm text-slate-400 break-words">
                {entry.name}
              </p>

              <p className="text-2xl md:text-3xl font-black text-white">
                {entry.value}
              </p>
            </div>
          ))}
        </div>

      </div>


              <div className="overflow-x-auto mt-8">
                <table className="w-full min-w-[900px] text-left">
<thead>
  <tr className="border-b border-white/10">
    <th className="py-4 pr-8 min-w-[140px]">Área</th>
    <th className="py-4 pr-8 min-w-[140px]">Puesto</th>
    <th className="py-4 px-4 text-center">Total</th>
    <th className="py-4 px-4 text-center">Nunca</th>
    <th className="py-4 px-4 text-center whitespace-nowrap">
      Casi nunca
    </th>
    <th className="py-4 px-4 text-center">A veces</th>
    <th className="py-4 px-4 text-center whitespace-nowrap">
      Casi siempre
    </th>
    <th className="py-4 px-4 text-center">Siempre</th>
  </tr>
</thead>


                  <tbody>
                    {item.areas.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-6 text-slate-400">
                          Sin datos para esta pregunta.
                        </td>
                      </tr>
                    )}

                    {item.areas.map((area, index) => (
                      <tr
  key={`${area.area}-${area.puesto}-${index}`}
  className="border-b border-white/5"
>

<td className="py-4 pr-8 font-bold">{area.area}</td>
<td className="py-4 pr-8">{area.puesto}</td>

<td className="py-4 px-4 text-center">{area.total}</td>
<td className="py-4 px-4 text-center">{area.respuestas[0]}</td>
<td className="py-4 px-4 text-center">{area.respuestas[1]}</td>
<td className="py-4 px-4 text-center">{area.respuestas[2]}</td>
<td className="py-4 px-4 text-center">{area.respuestas[3]}</td>
<td className="py-4 px-4 text-center">{area.respuestas[4]}</td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
