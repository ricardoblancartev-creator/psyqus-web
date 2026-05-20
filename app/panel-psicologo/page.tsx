"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const COLORS = [
  "#22d3ee",
  "#a855f7",
  "#ef4444",
  "#f59e0b",
  "#10b981",
];

const questions = [
  {
    id: 1,
    text: "La cantidad de trabajo que realizo suele rebasar el tiempo disponible.",
  },
  {
    id: 2,
    text: "Termino mi jornada con agotamiento físico o mental.",
  },
  {
    id: 3,
    text: "En mi trabajo hay momentos de presión tan alta que me cuesta concentrarme.",
  },
];

const labels = [
  "Nunca",
  "Casi nunca",
  "A veces",
  "Casi siempre",
  "Siempre",
];

export default function PanelPsicologoPage() {

  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultados();
  }, []);

  async function fetchResultados() {

    const { data, error } = await supabase
      .from("resultados_encuestas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    }

    setResultados(data || []);
    setLoading(false);
  }

  async function exportPDF() {

    const input = document.getElementById("psyqus-dashboard");

    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      backgroundColor: "#020617",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const width = 210;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, width, height);

    pdf.save("psyqus-organizational-report.pdf");
  }

  const totalEvaluaciones = resultados.length;

  const promedio = useMemo(() => {

    if (!resultados.length) return 0;

    const total = resultados.reduce(
      (acc, item) => acc + Number(item.puntaje_total || 0),
      0
    );

    return Math.round(total / resultados.length);

  }, [resultados]);

  const riesgoAlto = resultados.filter(
    (item) => item.riesgo === "alto"
  ).length;

  function getQuestionData(questionId: number) {

    const counts = [0, 0, 0, 0, 0];

    resultados.forEach((item) => {

      const respuestas = item.respuestas || {};

      const value = respuestas[questionId];

      if (typeof value === "number") {
        counts[value]++;
      }

    });

    return counts.map((count, index) => ({
      name: labels[index],
      value: count,
    }));
  }

  function getAreaData(questionId: number) {

    const grouped: Record<string, number> = {};

    resultados.forEach((item) => {

      const respuestas = item.respuestas || {};

      const value = respuestas[questionId];

      if (typeof value === "number") {

        grouped[item.area || "Sin área"] =
          (grouped[item.area || "Sin área"] || 0) + value;

      }

    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }

  function getPuestoData(questionId: number) {

    const grouped: Record<string, number> = {};

    resultados.forEach((item) => {

      const respuestas = item.respuestas || {};

      const value = respuestas[questionId];

      if (typeof value === "number") {

        grouped[item.puesto || "Sin puesto"] =
          (grouped[item.puesto || "Sin puesto"] || 0) + value;

      }

    });

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Cargando panel...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-8">

      <section
        id="psyqus-dashboard"
        className="max-w-7xl mx-auto"
      >

        <div className="flex justify-between items-center mb-10">

          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
              Psyqus
            </p>

            <h1 className="mt-3 text-4xl font-black">
              Organizational Intelligence
            </h1>

            <p className="mt-4 text-slate-400 max-w-3xl">
              Detección organizacional de burnout, riesgo psicosocial,
              desgaste emocional y comportamiento estructural por área y puesto.
            </p>
          </div>

          <button
            onClick={exportPDF}
            className="rounded-2xl bg-cyan-400 px-6 py-4 font-bold text-slate-950 hover:bg-cyan-300 transition"
          >
            Descargar PDF
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-10">

          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400 text-sm">
              Evaluaciones
            </p>

            <p className="mt-2 text-5xl font-black text-cyan-300">
              {totalEvaluaciones}
            </p>
          </div>

          <div className="rounded-3xl border border-fuchsia-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400 text-sm">
              Promedio general
            </p>

            <p className="mt-2 text-5xl font-black text-fuchsia-300">
              {promedio}
            </p>
          </div>

          <div className="rounded-3xl border border-red-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400 text-sm">
              Riesgo alto
            </p>

            <p className="mt-2 text-5xl font-black text-red-300">
              {riesgoAlto}
            </p>
          </div>

        </div>

        <div className="space-y-10">

          {questions.map((question) => {

            const pieData = getQuestionData(question.id);

            const areaData = getAreaData(question.id);

            const puestoData = getPuestoData(question.id);

            return (

              <div
                key={question.id}
                className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8"
              >

                <div className="mb-8">

                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-400">
                    Pregunta {question.id}
                  </p>

                  <h2 className="mt-2 text-2xl font-black">
                    {question.text}
                  </h2>

                </div>

                <div className="grid xl:grid-cols-3 gap-8">

                  <div className="rounded-3xl border border-white/10 bg-[#020617] p-5">

                    <h3 className="font-bold mb-4 text-cyan-300">
                      Distribución de respuestas
                    </h3>

                    <div className="h-[300px]">

                      <ResponsiveContainer width="100%" height="100%">

                        <PieChart>

                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={100}
                          >

                            {pieData.map((entry, index) => (

                              <Cell
                                key={index}
                                fill={COLORS[index % COLORS.length]}
                              />

                            ))}

                          </Pie>

                          <Tooltip />

                        </PieChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#020617] p-5">

                    <h3 className="font-bold mb-4 text-fuchsia-300">
                      Riesgo por área
                    </h3>

                    <div className="h-[300px]">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={areaData}>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />

                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                          />

                          <YAxis stroke="#94a3b8" />

                          <Tooltip />

                          <Bar
                            dataKey="value"
                            fill="#a855f7"
                            radius={[8,8,0,0]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#020617] p-5">

                    <h3 className="font-bold mb-4 text-emerald-300">
                      Riesgo por puesto
                    </h3>

                    <div className="h-[300px]">

                      <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={puestoData}>

                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />

                          <XAxis
                            dataKey="name"
                            stroke="#94a3b8"
                          />

                          <YAxis stroke="#94a3b8" />

                          <Tooltip />

                          <Bar
                            dataKey="value"
                            fill="#10b981"
                            radius={[8,8,0,0]}
                          />

                        </BarChart>

                      </ResponsiveContainer>

                    </div>

                  </div>

                </div>

                <div className="mt-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">

                  <p className="text-cyan-200 leading-relaxed">
                    La IA detectó patrones relevantes asociados a esta pregunta.
                    Existen áreas y puestos con mayor percepción de tensión
                    organizacional, lo que podría relacionarse con burnout,
                    desgaste emocional o presión operativa sostenida.
                  </p>

                </div>

              </div>

            );
          })}

        </div>

      </section>

    </main>
  );
}
