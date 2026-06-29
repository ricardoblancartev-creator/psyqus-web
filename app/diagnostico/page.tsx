"use client";

import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  Brain,
  Building2,
  Activity,
  ArrowRight,
  Home,
} from "lucide-react";

const questions = [
  {
    category: "Cultura",
    question:
      "¿La empresa cuenta con canales confidenciales para colaboradores?",
  },
  {
    category: "Cultura",
    question:
      "¿Se realizan acciones para detectar agotamiento o burnout?",
  },
  {
    category: "Documentación",
    question:
      "¿La organización mantiene registros de evaluaciones psicosociales?",
  },
  {
    category: "Documentación",
    question:
      "¿Se encuentran formalmente documentados los protocolos de seguimiento preventivo y atención temprana de riesgos psicososciales?",
  },
  {
    category: "Riesgo",
    question:
      "¿La empresa monitorea rotación, ausentismo y conflictos internos?",
  },
  {
    category: "Riesgo",
    question:
      "¿Se identifican cuales son las áreas con mayor desgaste laboral?",
  },
  {
    category: "Inteligencia",
    question:
      "¿Existen métricas visuales (Gráficas, indicadores y registros) de bienestar organizacional?",
  },
  {
    category: "Inteligencia",
    question:
      "¿La dirección toma decisiones basadas en datos organizacionales?",
  },
];

export default function DiagnosticoPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [finished, setFinished] = useState(false);

  const current = questions[step];

  function handleAnswer(value: number) {
    const updated = [...answers, value];
    setAnswers(updated);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      setFinished(true);
    }
  }

  function calculateCategory(category: string) {
    const filtered = questions
      .map((q, i) => ({
        ...q,
        value: answers[i] || 0,
      }))
      .filter((q) => q.category === category);

    const total =
      filtered.reduce((acc, item) => acc + item.value, 0) / filtered.length;

    return Math.round(total * 50);
  }

  const radarData = [
    {
      subject: "Cultura",
      value: calculateCategory("Cultura"),
    },
    {
      subject: "Documentación",
      value: calculateCategory("Documentación"),
    },
    {
      subject: "Riesgo",
      value: calculateCategory("Riesgo"),
    },
    {
      subject: "Inteligencia",
      value: calculateCategory("Inteligencia"),
    },
  ];

  const overall =
    radarData.reduce((acc, item) => acc + item.value, 0) / radarData.length;

  function getStatus() {
    if (overall >= 80) {
      return {
        title: "Estado Organizacional: Estable",
        color: "text-emerald-400",
      };
    }

    if (overall >= 55) {
      return {
        title: "Estado Organizacional: Vulnerable",
        color: "text-yellow-400",
      };
    }

    return {
      title: "Estado Organizacional: Riesgo Alto",
      color: "text-red-500",
    };
  }

  const status = getStatus();

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative max-w-5xl mx-auto">
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-cyan-300 transition"
          >
            <Home className="w-4 h-4" />
            Volver a Psyqus
          </a>
        </div>

        {!finished ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(34,211,238,0.08)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <Brain className="text-cyan-400 w-8 h-8" />

              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
                  Psyqus Diagnostic
                </p>

                <h1 className="text-3xl md:text-4xl font-black">
                  Diagnóstico Organizacional
                </h1>
              </div>
            </div>

            <p className="text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Evaluación rápida sobre bienestar psicosocial, trazabilidad
              preventiva y capacidad organizacional de monitoreo.
            </p>

            <div className="mb-8">
              <div className="inline-flex rounded-full bg-cyan-500/10 border border-cyan-400/20 px-4 py-2 text-sm text-cyan-300 mb-5">
                {current.category}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold leading-relaxed">
                {current.question}
              </h2>
            </div>

            <div className="grid gap-4">
              <button
                onClick={() => handleAnswer(2)}
                className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 transition px-6 py-5 text-lg font-black"
              >
                Sí
              </button>

              <button
                onClick={() => handleAnswer(1)}
                className="rounded-2xl bg-yellow-500 hover:bg-yellow-400 transition px-6 py-5 text-lg font-black text-black"
              >
                Parcialmente
              </button>

              <button
                onClick={() => handleAnswer(0)}
                className="rounded-2xl bg-red-500 hover:bg-red-400 transition px-6 py-5 text-lg font-black"
              >
                No
              </button>
            </div>

            <div className="mt-8 text-sm text-slate-500">
              Pregunta {step + 1} de {questions.length}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(34,211,238,0.08)]"
          >
            <div className="flex items-center gap-3 mb-6">
              <ShieldAlert className="text-cyan-400 w-8 h-8" />

              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
                  Resultado Organizacional
                </p>

                <h1 className="text-3xl md:text-4xl font-black">
                  Evaluación completada
                </h1>
              </div>
            </div>

            <div className={`text-3xl font-black mb-10 ${status.color}`}>
              {status.title}
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={radarData}
                      dataKey="value"
                      nameKey="subject"
                      outerRadius={120}
                      label
                    >
                      {radarData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={[
                            "#06b6d4",
                            "#22c55e",
                            "#f59e0b",
                            "#a855f7",
                            "#ef4444",
                          ][index % 5]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div>
                <p className="text-slate-300 leading-relaxed mb-6">
                  La organización presenta áreas relacionadas con monitoreo
                  psicosocial, trazabilidad preventiva y visualización
                  organizacional que podrían fortalecerse mediante herramientas
                  de seguimiento y evaluación continua.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                    <Building2 className="text-cyan-300 w-5 h-5" />
                    <span>Evaluación estratégica organizacional</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                    <Activity className="text-cyan-300 w-5 h-5" />
                    <span>Monitoreo de indicadores psicosociales</span>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center gap-3">
                    <Brain className="text-cyan-300 w-5 h-5" />
                    <span>Prevención temprana y bienestar laboral</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-7 py-4 font-black text-black hover:bg-cyan-400 transition"
                  >
                    Solicitar Demo
                    <ArrowRight className="w-5 h-5" />
                  </a>

                  <button
                    onClick={() => {
                      setAnswers([]);
                      setStep(0);
                      setFinished(false);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white hover:bg-white/10 transition"
                  >
                    Repetir diagnóstico
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
