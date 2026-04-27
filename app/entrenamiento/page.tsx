"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { CheckCircle2, GraduationCap, ArrowRight } from "lucide-react";

type Track = {
  id: string;
  title: string;
  lesson: string[];
  quizQuestion: string;
  quizOptions: string[];
  correctIndex: number;
  conclusion: string;
};

type TrainingProgress = Record<
  string,
  { step: number; completed: boolean }
>;

const tracks: Track[] = [
  {
    id: "liderazgo",
    title: "Liderazgo sano",
    lesson: [
      "Corregir no es humillar. Un liderazgo útil distingue hechos de ataques personales.",
      "Cuando un líder solo presiona, produce miedo; cuando ordena con claridad, produce estructura.",
      "La mejor retroalimentación nombra el problema, el impacto y el siguiente paso.",
    ],
    quizQuestion: "¿Qué hace más útil una corrección?",
    quizOptions: [
      "Humillar para que no se repita",
      "Nombrar el hecho, impacto y siguiente paso",
      "Guardar silencio",
    ],
    correctIndex: 1,
    conclusion: "Un liderazgo sano corrige con estructura, no con violencia.",
  },
  {
    id: "comunicacion",
    title: "Comunicación de equipo",
    lesson: [
      "Una conversación difícil empeora cuando arranca con juicio y no con observación.",
      "Hablar mejor no es hablar más: es hablar con más precisión.",
      "Una petición concreta vale más que una queja infinita.",
    ],
    quizQuestion: "¿Qué ayuda más a bajar tensión en una conversación?",
    quizOptions: [
      "Describir hechos observables",
      "Generalizar todo",
      "Subir el tono",
    ],
    correctIndex: 0,
    conclusion: "La precisión relacional reduce el desgaste del equipo.",
  },
  {
    id: "prevencion",
    title: "Prevención de riesgo",
    lesson: [
      "El riesgo psicosocial muchas veces empieza como algo que todos ya normalizaron.",
      "Cansancio sostenido, miedo a hablar y tensión interpersonal son señales de alerta.",
      "La prevención funciona cuando interviene antes del colapso.",
    ],
    quizQuestion: "¿Cuál es una señal temprana de riesgo?",
    quizOptions: [
      "Mayor claridad operativa",
      "Cansancio crónico y retraimiento",
      "Mejor comunicación",
    ],
    correctIndex: 1,
    conclusion: "Detectar temprano evita que el problema crezca en silencio.",
  },
];

export default function EntrenamientoPage() {
  const { user } = useUser();
  const [activeTrackId, setActiveTrackId] = useState(tracks[0].id);
  const [progress, setProgress] = useState<TrainingProgress>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);

  const activeTrack = useMemo(
    () => tracks.find((t) => t.id === activeTrackId) || tracks[0],
    [activeTrackId]
  );

  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("progreso_entrenamiento")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      const mapped: TrainingProgress = {};
      (data || []).forEach((row: any) => {
        mapped[row.track_id] = {
          step: Number(row.station || 1),
          completed: !!row.completed,
        };
      });
      setProgress(mapped);
    }

    loadProgress();
  }, [user?.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setCheckedAnswer(false);
  }, [activeTrackId]);

  async function persist(next: { step: number; completed: boolean }) {
    if (!user?.id) return;

    await supabase.from("progreso_entrenamiento").upsert(
      {
        user_id: user.id,
        track_id: activeTrack.id,
        station: next.step,
        started: true,
        completed: next.completed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,track_id" }
    );
  }

  async function nextStep() {
    const current = progress[activeTrack.id] || { step: 1, completed: false };
    const max = activeTrack.lesson.length + 2;
    const next = {
      step: Math.min(max, current.step + 1),
      completed: current.completed,
    };

    setProgress((prev) => ({ ...prev, [activeTrack.id]: next }));
    await persist(next);
  }

  async function markComplete() {
    const next = { step: activeTrack.lesson.length + 2, completed: true };
    setProgress((prev) => ({ ...prev, [activeTrack.id]: next }));
    await persist(next);
  }

  const currentStep = progress[activeTrack.id]?.step || 1;
  const inLesson = currentStep <= activeTrack.lesson.length;
  const inQuiz = currentStep === activeTrack.lesson.length + 1;
  const inConclusion = currentStep >= activeTrack.lesson.length + 2;

  const completedCount = Object.values(progress).filter((x) => x.completed).length;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-6xl mx-auto px-6 py-8 md:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 font-semibold mb-2">
                  Psyqus Training Core
                </p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Entrenamiento
                </h1>
                <p className="mt-3 text-slate-300 max-w-3xl">
                  Avanza paso a paso como si fuera una mini lección guiada.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">
                Rutas completadas
              </p>
              <p className="mt-2 text-3xl font-black text-emerald-300">
                {completedCount}/{tracks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="space-y-4">
            {tracks.map((track) => {
              const active = activeTrackId === track.id;
              const completed = progress[track.id]?.completed;

              return (
                <button
                  key={track.id}
                  onClick={() => setActiveTrackId(track.id)}
                  className={`w-full text-left rounded-[1.6rem] border p-5 transition ${
                    active
                      ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                      : "border-white/10 bg-slate-950/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">{track.title}</h2>
                      <p className="text-sm text-slate-300 mt-2">
                        {track.lesson.length} pasos + quiz
                      </p>
                    </div>

                    {completed && (
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                        Completado
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <h2 className="text-2xl font-bold mb-5">{activeTrack.title}</h2>

            {inLesson && (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">
                  Paso {currentStep} de {activeTrack.lesson.length}
                </p>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-base leading-relaxed text-slate-200">
                    {activeTrack.lesson[currentStep - 1]}
                  </p>
                </div>

                <button
                  onClick={nextStep}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black hover:bg-cyan-400 transition"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {inQuiz && (
              <>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-3">
                  Quiz
                </p>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-base leading-relaxed text-slate-200 mb-4">
                    {activeTrack.quizQuestion}
                  </p>

                  <div className="grid gap-3">
                    {activeTrack.quizOptions.map((option, idx) => (
                      <button
                        key={option}
                        onClick={() => setSelectedAnswer(idx)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selectedAnswer === idx
                            ? "border-cyan-400/30 bg-cyan-500/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCheckedAnswer(true)}
                  className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-3 font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 transition"
                >
                  Revisar respuesta
                </button>

                {checkedAnswer && selectedAnswer !== null && (
                  <div
                    className={`mt-5 rounded-2xl border p-4 ${
                      selectedAnswer === activeTrack.correctIndex
                        ? "border-emerald-400/20 bg-emerald-500/10"
                        : "border-red-400/20 bg-red-500/10"
                    }`}
                  >
                    <p className="font-semibold mb-3">
                      {selectedAnswer === activeTrack.correctIndex
                        ? "Correcto"
                        : "No exactamente"}
                    </p>

                    <button
                      onClick={nextStep}
                      className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black hover:bg-cyan-400 transition"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </>
            )}

            {inConclusion && (
              <>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <h3 className="text-xl font-bold">Conclusión</h3>
                  </div>
                  <p className="text-slate-100 leading-relaxed">
                    {activeTrack.conclusion}
                  </p>
                </div>

                <button
                  onClick={markComplete}
                  className="mt-5 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-black hover:bg-emerald-400 transition"
                >
                  Marcar ruta completada
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}