"use client";

import { useMemo, useState } from "react";
import ModeloBPSE from "@/components/modelobpss";
import { Brain, Sparkles, UserRound } from "lucide-react";

type Question = {
  id: number;
  text: string;
  axis: "intuicion" | "analisis" | "reserva";
};

const questions: Question[] = [
  { id: 1, text: "Sueles enfocarte más en posibilidades futuras que en detalles inmediatos.", axis: "intuicion" },
  { id: 2, text: "Te gusta encontrar patrones o conexiones ocultas entre ideas.", axis: "intuicion" },
  { id: 3, text: "Al decidir, valoras más la coherencia lógica que la presión del momento.", axis: "analisis" },
  { id: 4, text: "Antes de actuar, prefieres pensar y estructurar lo que harás.", axis: "analisis" },
  { id: 5, text: "Prefieres observar antes de participar intensamente en un grupo.", axis: "reserva" },
  { id: 6, text: "Te drena más la sobreexposición social que el trabajo profundo en solitario.", axis: "reserva" },
];

const options = [
  { label: "Sí", value: 2 },
  { label: "A veces", value: 1 },
  { label: "No", value: 0 },
];

export default function PerfilPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const completed = Object.keys(answers).length === questions.length;

  const result = useMemo(() => {
    const totals = {
      intuicion: 0,
      analisis: 0,
      reserva: 0,
    };

    questions.forEach((q) => {
      totals[q.axis] += answers[q.id] ?? 0;
    });

    return totals;
  }, [answers]);

  const profileText = useMemo(() => {
    if (!completed) return null;

    const intuicion = result.intuicion >= 3 ? "alta" : "media";
    const analisis = result.analisis >= 3 ? "alto" : "medio";
    const reserva = result.reserva >= 3 ? "alta" : "media";

    return {
      intuicion:
        intuicion === "alta"
          ? "Tiendes a captar patrones, posibilidades y sentido general más allá de lo inmediato."
          : "Tu intuición aparece, pero no domina totalmente tu forma de percibir.",
      analisis:
        analisis === "alto"
          ? "Sueles decidir con estructura, criterio y necesidad de coherencia."
          : "Combinas análisis con adaptación al contexto.",
      reserva:
        reserva === "alta"
          ? "Tiendes a observar antes de exponerte y a valorar profundidad sobre ruido."
          : "Puedes moverte socialmente, aunque también necesitas espacios de resguardo.",
      lectura:
        "Esta lectura no constituye diagnóstico clínico. Sirve como exploración de estilo personal dentro de Psyqus.",
    };
  }, [completed, result]);

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 font-semibold mb-3">
            Psyqus Insight Layer
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Perfil integral
          </h1>
          <p className="mt-4 text-slate-300 max-w-3xl">
            Responde el test y descubre una lectura real de tu estilo personal.
          </p>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <UserRound className="w-5 h-5 text-cyan-300" />
                <h2 className="text-2xl font-bold">Test de estilo personal</h2>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">
                      Pregunta {index + 1}
                    </p>
                    <p className="text-sm text-slate-200 mb-4">{question.text}</p>

                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <button
                          key={option.label}
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: option.value,
                            }))
                          }
                          className={`rounded-xl px-4 py-2 text-sm border transition ${
                            answers[question.id] === option.value
                              ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300"
                              : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {profileText && (
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                  <h2 className="text-2xl font-bold">Resultado</h2>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                      Percepción
                    </p>
                    <p className="mt-2 text-sm text-slate-100">{profileText.intuicion}</p>
                  </div>

                  <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-300/80">
                      Decisión
                    </p>
                    <p className="mt-2 text-sm text-slate-100">{profileText.analisis}</p>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                      Relación
                    </p>
                    <p className="mt-2 text-sm text-slate-100">{profileText.reserva}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {profileText.lectura}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-cyan-300" />
                <h2 className="text-2xl font-bold">Modelo BPSE</h2>
              </div>
              <ModeloBPSE />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}