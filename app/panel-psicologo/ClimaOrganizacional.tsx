"use client";

import { useMemo, useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* =========================================================
   PREGUNTAS
========================================================= */

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

/* =========================================================
   TIPOS
========================================================= */

type ResultadoClima = {
  id?: string;
  user_id?: string | null;
  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;
  area?: string | null;
  puesto?: string | null;
  respuestas?: Record<string, number> | null;
};

type Props = {
  resultados: ResultadoClima[];
};

/* =========================================================
   COMPONENTE
========================================================= */

export default function ClimaOrganizacional({
  resultados,
}: Props) {
  const [preguntaAbierta, setPreguntaAbierta] =
    useState<number | null>(null);

  const resumen = useMemo(() => {
    return QUESTIONS.map((questionText, index) => {
      const questionNumber = String(index + 1);

      const totalPregunta: Record<
        0 | 1 | 2 | 3 | 4,
        number
      > = {
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
          respuestas: Record<
            0 | 1 | 2 | 3 | 4,
            number
          >;
        }
      > = {};

      resultados.forEach((item) => {
        const respuestas =
          item.respuestas || {};

        const area =
          item.area || "Sin área";

        const puesto =
          item.puesto || "Sin puesto";

        const key =
          `${area}__${puesto}`;

        const value = Number(
          respuestas[questionNumber]
        );

        if (
          Number.isNaN(value) ||
          value < 0 ||
          value > 4
        ) {
          return;
        }

        const responseValue =
          value as 0 | 1 | 2 | 3 | 4;

        totalPregunta[
          responseValue
        ] += 1;

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

        areas[key].respuestas[
          responseValue
        ] += 1;
      });

      const chartData = Object.entries(
        totalPregunta
      )
        .map(([key, value]) => {
          const k =
            Number(key) as
              | 0
              | 1
              | 2
              | 3
              | 4;

          return {
            key: k,
            name: LABELS[k],
            value,
            color: COLORS[k],
          };
        })
        .filter(
          (item) => item.value > 0
        );

      return {
        numero: index + 1,
        pregunta: questionText,
        chartData,
        areas: Object.values(areas),
      };
    });
  }, [resultados]);

  return (
    <div>
      {/* =================================================
          PARTICIPANTES
      ================================================= */}

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <Users className="w-5 h-5 text-cyan-300" />

          <div>
            <h3 className="text-xl font-black">
              Participantes
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Información registrada en la evaluación interna.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase tracking-[0.12em] text-slate-500">
                <th className="py-3 pr-5">
                  Nombre
                </th>

                <th className="py-3 pr-5">
                  Área
                </th>

                <th className="py-3 pr-5">
                  Puesto
                </th>

                <th className="py-3">
                  Correo
                </th>
              </tr>
            </thead>

            <tbody>
              {resultados.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-6 text-slate-500"
                  >
                    No hay participantes registrados.
                  </td>
                </tr>
              ) : (
                resultados.map(
                  (item, index) => (
                    <tr
                      key={
                        item.id ||
                        `${item.user_id}-${index}`
                      }
                      className="border-b border-white/5"
                    >
                      <td className="py-4 pr-5 font-semibold text-white">
                        {[
                          item.nombre,
                          item.apellido,
                        ]
                          .filter(Boolean)
                          .join(" ") ||
                          "Sin nombre"}
                      </td>

                      <td className="py-4 pr-5 text-sm text-slate-300">
                        {item.area ||
                          "Sin área"}
                      </td>

                      <td className="py-4 pr-5 text-sm text-slate-300">
                        {item.puesto ||
                          "Sin puesto"}
                      </td>

                      <td className="py-4 text-sm text-slate-500">
                        {item.email ||
                          "Sin correo"}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================
          PREGUNTAS
      ================================================= */}

      <div className="space-y-3">
        {resumen.map((item) => {
          const abierta =
            preguntaAbierta === item.numero;

          const total =
            item.chartData.reduce(
              (acc, current) =>
                acc + current.value,
              0
            );

          return (
            <div
              key={item.numero}
              className="rounded-[1.6rem] border border-white/10 bg-slate-950/70 overflow-hidden"
            >
              <button
                type="button"
                onClick={() =>
                  setPreguntaAbierta(
                    abierta
                      ? null
                      : item.numero
                  )
                }
                className="w-full flex items-center justify-between gap-5 p-5 md:p-6 text-left hover:bg-white/[0.025] transition"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-cyan-300">
                    Pregunta{" "}
                    {item.numero}
                  </p>

                  <p className="mt-2 font-bold text-slate-100">
                    {item.pregunta}
                  </p>

                  <p className="mt-2 text-xs text-slate-600">
                    {total} respuestas válidas
                  </p>
                </div>

                {abierta ? (
                  <ChevronUp className="w-5 h-5 shrink-0 text-cyan-300" />
                ) : (
                  <ChevronDown className="w-5 h-5 shrink-0 text-slate-500" />
                )}
              </button>

              {abierta && (
                <div className="border-t border-white/10 p-5 md:p-6">
                  <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-7 items-center">
                    {/* GRÁFICA */}

                    <div className="h-[280px] md:h-[330px]">
                      {item.chartData.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-sm text-slate-500">
                          Sin datos para graficar.
                        </div>
                      ) : (
                        <ResponsiveContainer
                          width="100%"
                          height="100%"
                        >
                          <PieChart>
                            <Pie
                              data={item.chartData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={105}
                              labelLine={false}
                              label={({
                                name,
                                value,
                              }) =>
                                `${name}: ${value}`
                              }
                            >
                              {item.chartData.map(
                                (entry) => (
                                  <Cell
                                    key={entry.key}
                                    fill={
                                      entry.color
                                    }
                                  />
                                )
                              )}
                            </Pie>

                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    {/* DISTRIBUCIÓN */}

                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">
                        Distribución
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {item.chartData.map(
                          (entry) => (
                            <div
                              key={entry.key}
                              className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    entry.color,
                                }}
                              />

                              <p className="mt-3 text-xs text-slate-500">
                                {entry.name}
                              </p>

                              <p className="mt-1 text-2xl font-black">
                                {entry.value}
                              </p>

                              <p className="mt-1 text-xs text-slate-600">
                                {total > 0
                                  ? Math.round(
                                      (entry.value /
                                        total) *
                                        100
                                    )
                                  : 0}
                                %
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ÁREAS */}

                  <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-4">
                      Distribución por área y puesto
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left">
                        <thead>
                          <tr className="border-b border-white/10 text-xs text-slate-500">
                            <th className="py-4 pr-6">
                              Área
                            </th>

                            <th className="py-4 pr-6">
                              Puesto
                            </th>

                            <th className="py-4 px-3 text-center">
                              Total
                            </th>

                            <th className="py-4 px-3 text-center">
                              Nunca
                            </th>

                            <th className="py-4 px-3 text-center">
                              Casi nunca
                            </th>

                            <th className="py-4 px-3 text-center">
                              A veces
                            </th>

                            <th className="py-4 px-3 text-center">
                              Casi siempre
                            </th>

                            <th className="py-4 px-3 text-center">
                              Siempre
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {item.areas.length === 0 && (
                            <tr>
                              <td
                                colSpan={8}
                                className="py-6 text-slate-500"
                              >
                                Sin datos para esta pregunta.
                              </td>
                            </tr>
                          )}

                          {item.areas.map(
                            (area, index) => (
                              <tr
                                key={`${area.area}-${area.puesto}-${index}`}
                                className="border-b border-white/5"
                              >
                                <td className="py-4 pr-6 font-bold">
                                  {area.area}
                                </td>

                                <td className="py-4 pr-6 text-slate-300">
                                  {area.puesto}
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {area.total}
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {
                                    area
                                      .respuestas[0]
                                  }
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {
                                    area
                                      .respuestas[1]
                                  }
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {
                                    area
                                      .respuestas[2]
                                  }
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {
                                    area
                                      .respuestas[3]
                                  }
                                </td>

                                <td className="py-4 px-3 text-center">
                                  {
                                    area
                                      .respuestas[4]
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
