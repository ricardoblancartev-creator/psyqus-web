"use client";

import { useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Question = {
  id: number;
  text: string;
  category:
    | "Ambiente"
    | "Carga"
    | "Control"
    | "Liderazgo"
    | "Reconocimiento"
    | "Jornada"
    | "Violencia";
  reverse?: boolean;
};

const scale = [
  { label: "Siempre", value: 4 },
  { label: "Casi siempre", value: 3 },
  { label: "A veces", value: 2 },
  { label: "Casi nunca", value: 1 },
  { label: "Nunca", value: 0 },
];

const questions: Question[] = [
  { id: 1, text: "La cantidad de trabajo que realizo suele rebasar el tiempo disponible.", category: "Carga" },
  { id: 2, text: "Termino mi jornada con agotamiento físico o mental.", category: "Carga" },
  { id: 3, text: "En mi trabajo hay momentos de presión tan alta que me cuesta concentrarme.", category: "Carga" },
  { id: 4, text: "Mi trabajo me permite organizar mis tareas con claridad.", category: "Control", reverse: true },
  { id: 5, text: "Tengo claridad sobre lo que se espera de mí en mi puesto.", category: "Control", reverse: true },
  { id: 6, text: "Puedo tomar algunas decisiones sobre cómo realizar mi trabajo.", category: "Control", reverse: true },
  { id: 7, text: "Mi jefe inmediato escucha mis opiniones o propuestas.", category: "Liderazgo", reverse: true },
  { id: 8, text: "Recibo retroalimentación clara y útil sobre mi desempeño.", category: "Liderazgo", reverse: true },
  { id: 9, text: "Cuando surge un problema, mi liderazgo lo maneja con respeto.", category: "Liderazgo", reverse: true },
  { id: 10, text: "Siento que mi esfuerzo pasa desapercibido.", category: "Reconocimiento" },
  { id: 11, text: "En mi trabajo rara vez se reconoce lo que hago bien.", category: "Reconocimiento" },
  { id: 12, text: "Mis horarios o carga laboral interfieren con mi vida personal.", category: "Jornada" },
  { id: 13, text: "Me cuesta desconectarme del trabajo incluso fuera del horario laboral.", category: "Jornada" },
  { id: 14, text: "El ambiente entre compañeros suele sentirse tenso o desgastante.", category: "Ambiente" },
  { id: 15, text: "En mi equipo se puede hablar con respeto incluso cuando hay desacuerdo.", category: "Ambiente", reverse: true },
  { id: 16, text: "He sentido aislamiento, indiferencia o exclusión dentro del trabajo.", category: "Ambiente" },
  { id: 17, text: "He recibido trato humillante, burlas o descalificación en el trabajo.", category: "Violencia" },
  { id: 18, text: "Me preocupa ser castigado o señalado si expreso malestar laboral.", category: "Violencia" },
  { id: 19, text: "He presenciado formas de maltrato o agresión dentro del entorno laboral.", category: "Violencia" },
  { id: 20, text: "En general, siento que mi trabajo es psicológicamente sostenible.", category: "Ambiente", reverse: true },
];

const categoryDescriptions: Record<Question["category"], string> = {
  Ambiente: "Clima interpersonal y habitabilidad emocional del entorno.",
  Carga: "Exigencia, presión y desgaste por volumen o intensidad de trabajo.",
  Control: "Claridad, autonomía y capacidad de organizar la tarea.",
  Liderazgo: "Escucha, dirección y trato por parte de jefaturas.",
  Reconocimiento: "Visibilidad del esfuerzo y valoración del trabajo realizado.",
  Jornada: "Equilibrio entre horario, descanso y vida personal.",
  Violencia: "Señales de hostilidad, castigo, humillación o temor.",
};

function normalizeScore(question: Question, value: number) {
  return question.reverse ? 4 - value : value;
}

function getRiskLevel(total: number) {
  if (total >= 50) return "alto";
  if (total >= 30) return "medio";
  return "bajo";
}

function getRiskCopy(total: number) {
  if (total >= 50) {
    return {
      title: "Riesgo psicosocial alto",
      accent: "text-red-300",
      box: "border-red-500/20 bg-red-500/10",
      message:
        "Se observan señales relevantes de desgaste, tensión o vulnerabilidad organizacional. Conviene intervención más cercana, seguimiento y revisión de liderazgo, carga y clima.",
    };
  }

  if (total >= 30) {
    return {
      title: "Riesgo psicosocial medio",
      accent: "text-amber-300",
      box: "border-amber-500/20 bg-amber-500/10",
      message:
        "Hay focos de atención que pueden escalar si no se atienden. Lo recomendable es reforzar comunicación, claridad operativa y prevención del desgaste.",
    };
  }

  return {
    title: "Riesgo psicosocial bajo",
    accent: "text-emerald-300",
    box: "border-emerald-500/20 bg-emerald-500/10",
    message:
      "La lectura general sugiere una condición relativamente estable. Aun así, conviene sostener hábitos de comunicación, reconocimiento y prevención.",
  };
}

function getPersonalInterpretation(
  total: number,
  dominantCategory: Question["category"] | null
) {
  const risk = getRiskLevel(total);

  const categoryMessageMap: Record<Question["category"], string> = {
    Carga:
      "La principal presión parece venir de la sobrecarga y del agotamiento sostenido. Aquí conviene revisar distribución de tareas, tiempos y expectativa de rendimiento.",
    Control:
      "La principal tensión parece relacionarse con falta de claridad o autonomía. Esto suele desgastar mucho porque genera incertidumbre y sensación de desorden.",
    Liderazgo:
      "La lectura apunta a que el estilo de liderazgo o la falta de escucha puede estar impactando tu bienestar más de lo deseable.",
    Reconocimiento:
      "Aparece una necesidad fuerte de valoración. Cuando el esfuerzo no se reconoce, el trabajo se vuelve emocionalmente más pesado.",
    Jornada:
      "La frontera entre trabajo y vida personal parece estar debilitada. Eso suele alimentar fatiga, irritabilidad y desmotivación.",
    Ambiente:
      "El clima relacional parece tener bastante peso en tu experiencia. Un entorno tenso erosiona bienestar incluso cuando la operación funciona.",
    Violencia:
      "Hay señales sensibles vinculadas a trato hostil, temor o formas de violencia laboral. Esto merece atención prioritaria y una ruta segura de seguimiento.",
  };

  if (!dominantCategory) {
    return "La evaluación fue completada, pero no se pudo identificar una dimensión dominante.";
  }

  if (risk === "alto") {
    return `Tu lectura general sugiere una condición delicada. ${categoryMessageMap[dominantCategory]} La recomendación es no normalizarlo y activar recursos de apoyo, mediación o seguimiento interno.`;
  }

  if (risk === "medio") {
    return `Tu evaluación muestra una zona de tensión que todavía puede trabajarse preventivamente. ${categoryMessageMap[dominantCategory]} Intervenir temprano puede evitar desgaste mayor.`;
  }

  return `Tu resultado general se mantiene en un rango relativamente estable. Aun así, ${categoryMessageMap[dominantCategory]} Trabajarlo ahora puede fortalecer el bienestar antes de que surjan problemas mayores.`;
}

export default function EncuestaPage() {
  const { user } = useUser();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState("");

  const currentQuestion = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const computed = useMemo(() => {
    const categoryScores: Record<Question["category"], number> = {
      Ambiente: 0,
      Carga: 0,
      Control: 0,
      Liderazgo: 0,
      Reconocimiento: 0,
      Jornada: 0,
      Violencia: 0,
    };

    questions.forEach((question) => {
      const answer = answers[question.id];
      if (typeof answer === "number") {
        categoryScores[question.category] += normalizeScore(question, answer);
      }
    });

    const total = Object.values(categoryScores).reduce((sum, value) => sum + value, 0);

    const dominantCategory =
      Object.entries(categoryScores).sort((a, b) => b[1] - a[1])[0]?.[0] as
        | Question["category"]
        | undefined;

    return {
      total,
      categoryScores,
      dominantCategory: dominantCategory || null,
      risk: getRiskLevel(total),
    };
  }, [answers]);

  const resultCopy = getRiskCopy(computed.total);
  const personalizedInterpretation = getPersonalInterpretation(
    computed.total,
    computed.dominantCategory
  );

  const sortedDimensions = Object.entries(computed.categoryScores).sort(
    (a, b) => b[1] - a[1]
  ) as [Question["category"], number][];

  async function saveEvaluation(finalAnswers: Record<number, number>) {
    setSaving(true);
    setSaveError("");

    const payload = {
      user_id: user?.id ?? null,
      puntaje_total: computed.total,
      riesgo: computed.risk,
      interpretacion: personalizedInterpretation,
      dimensiones: computed.categoryScores,
      respuestas: finalAnswers,
    };

    const { error } = await supabase
      .from("resultados_encuestas")
      .insert([payload]);

    if (error) {
      console.error("Error al guardar encuesta:", error);
      setSaveError(
        "La evaluación terminó, pero no pude guardarla. Revisa si la tabla resultados_encuestas tiene columnas como user_id, riesgo, interpretacion, dimensiones y respuestas."
      );
    }

    setSaving(false);
    setSubmitted(true);
  }

  async function handleAnswer(value: number) {
    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: value,
    };

    setAnswers(nextAnswers);

    if (step < questions.length - 1) {
      setStep((prev) => prev + 1);
      return;
    }

    await saveEvaluation(nextAnswers);
  }

  function goBack() {
    if (step > 0) setStep((prev) => prev - 1);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.13),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_24%)]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:40px_40px]" />

        <section className="relative max-w-6xl mx-auto px-6 py-10 md:py-14">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold mb-2">
                  Psyqus Assessment
                </p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Evaluación completada
                </h1>
                <p className="mt-3 text-slate-300 max-w-3xl">
                  Tu evaluación ya fue procesada y guardada para tu perfil.
                </p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
            <div className="space-y-6">
              <div className={`rounded-[1.75rem] border p-6 ${resultCopy.box}`}>
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle className={`w-5 h-5 ${resultCopy.accent}`} />
                  <h2 className={`text-2xl font-bold ${resultCopy.accent}`}>
                    {resultCopy.title}
                  </h2>
                </div>
                <p className="text-slate-100 leading-relaxed">{resultCopy.message}</p>
                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Puntaje total
                    </p>
                    <p className="mt-2 text-4xl font-black">{computed.total}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Riesgo
                    </p>
                    <p className="mt-2 text-4xl font-black uppercase">{computed.risk}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-5 h-5 text-fuchsia-300" />
                  <h3 className="text-2xl font-bold">Interpretación personalizada</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{personalizedInterpretation}</p>
              </div>

              {saveError && (
                <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
                  {saveError}
                </div>
              )}
            </div>

            <aside className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 h-fit">
              <div className="flex items-center gap-3 mb-5">
                <ClipboardList className="w-5 h-5 text-cyan-300" />
                <h3 className="text-2xl font-bold">Dimensiones</h3>
              </div>

              <div className="space-y-4">
                {sortedDimensions.map(([category, score]) => {
                  const percent = Math.min(100, Math.round((score / 12) * 100));
                  return (
                    <div
                      key={category}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{category}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {categoryDescriptions[category]}
                          </p>
                        </div>
                        <p className="text-xl font-black text-cyan-300">{score}</p>
                      </div>

                      <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  onClick={() => (window.location.href = "/resultados")}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 font-bold text-black hover:bg-cyan-400 transition"
                >
                  Ver mis resultados
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => (window.location.href = "/dashboard")}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white hover:bg-white/10 transition"
                >
                  Volver al dashboard
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.12),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative max-w-5xl mx-auto px-6 py-10 md:py-14">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold mb-2">
                NOM-035 / Psyqus Scan
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Evaluación psicosocial
              </h1>
              <p className="mt-3 text-slate-300 max-w-3xl">
                Esta evaluación se guarda vinculada a tu perfil para que veas solo tus propios resultados.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-slate-400">
                Pregunta {step + 1} de {questions.length}
              </p>
              <p className="mt-1 text-sm text-cyan-300 font-medium">
                Dimensión: {currentQuestion.category}
              </p>
            </div>

            <div className="w-full md:w-64">
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-right text-xs text-slate-500 mt-2">
                {Math.round(progress)}%
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 md:p-8 mb-6">
                <p className="text-2xl md:text-3xl font-black leading-tight">
                  {currentQuestion.text}
                </p>
                <p className="mt-4 text-sm text-slate-400">
                  {categoryDescriptions[currentQuestion.category]}
                </p>
              </div>

              <div className="grid gap-3">
                {scale.map((option) => (
                  <button
                    key={option.label}
                    onClick={() => handleAnswer(option.value)}
                    disabled={saving}
                    className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-left transition hover:border-cyan-500/40 hover:bg-slate-900 disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-lg font-semibold text-white">
                        {option.label}
                      </span>
                      <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                        Respuesta
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={goBack}
              disabled={step === 0 || saving}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-white/10 transition"
            >
              Regresar
            </button>

            <div className="text-right">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                Psyqus Engine
              </p>
              <p className="text-sm text-slate-300">
                Lectura progresiva de riesgo psicosocial
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}