"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  MessageSquareMore,
  ShieldCheck,
  Users,
  Brain,
  Award,
  Search,
} from "lucide-react";

type Lesson = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discovery: string[];
  challenge: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

type ProgressState = Record<
  string,
  { stage: number; completed: boolean; quizPassed: boolean }
>;

const lessons: Lesson[] = [
  {
    id: "comunicacion",
    title: "Comunicación sana",
    subtitle: "Descubre cómo bajar tensión",
    description: "No solo leas: ve descubriendo cada idea paso a paso.",
    discovery: [
      "Una conversación difícil empeora cuando empieza como ataque.",
      "Describir hechos concretos baja la defensividad.",
      "Pedir algo claro funciona mejor que quedarse en la queja.",
      "Cerrar con acuerdo observable evita repetir el conflicto.",
    ],
    challenge:
      "Piensa en una conversación pendiente y escribe primero el hecho observable, no tu juicio.",
    quiz: {
      question: "¿Qué baja mejor la defensividad al iniciar una conversación difícil?",
      options: [
        "Acusar de frente",
        "Describir el hecho observable",
        "Generalizar todo",
        "Quedarte callado",
      ],
      correctIndex: 1,
      explanation:
        "Empezar por hechos observables abre espacio para escuchar y responder mejor.",
    },
  },
  {
    id: "ambiente",
    title: "Ambiente laboral saludable",
    subtitle: "Descubre qué sí sostiene bienestar",
    description: "Explora qué vuelve un entorno laboral habitable.",
    discovery: [
      "Ambiente sano no es ausencia de conflicto.",
      "Claridad + respeto + seguimiento sostienen mejor el trabajo.",
      "La ambigüedad desgasta mucho más de lo que parece.",
      "El reconocimiento reduce carga emocional del trabajo.",
    ],
    challenge:
      "Detecta una práctica simple que podría mejorar el ambiente de tu equipo esta semana.",
    quiz: {
      question: "¿Qué sostiene mejor un ambiente laboral sano?",
      options: [
        "Evitar hablar de problemas",
        "Claridad, respeto y seguimiento",
        "Solo incentivos económicos",
        "Que cada quien se arregle solo",
      ],
      correctIndex: 1,
      explanation:
        "La combinación de claridad, respeto y seguimiento hace el entorno más estable.",
    },
  },
  {
    id: "riesgo",
    title: "Riesgo psicosocial",
    subtitle: "Descubre señales tempranas",
    description: "Aprende a reconocer deterioro antes de crisis.",
    discovery: [
      "El riesgo muchas veces empieza como cansancio normalizado.",
      "Irritabilidad y retraimiento pueden ser señales tempranas.",
      "El silencio por miedo es una alerta seria.",
      "La prevención sirve cuando detecta antes de que explote todo.",
    ],
    challenge:
      "Observa una señal de desgaste en tu entorno y nombra qué contexto la podría estar causando.",
    quiz: {
      question: "¿Cuál es una señal temprana de riesgo psicosocial?",
      options: [
        "Cansancio crónico y retraimiento",
        "Más claridad laboral",
        "Mayor energía sostenida",
        "Mejor vínculo entre áreas",
      ],
      correctIndex: 0,
      explanation:
        "El cansancio sostenido y el retraimiento suelen aparecer temprano en procesos de desgaste.",
    },
  },
];

export default function PsicoeducacionPage() {
  const { user } = useUser();

  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
  const [progress, setProgress] = useState<ProgressState>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState(false);
  const [saving, setSaving] = useState(false);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) || lessons[0],
    [activeLessonId]
  );

  useEffect(() => {
    async function loadProgress() {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("progreso_psicoeducacion")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error cargando progreso_psicoeducacion:", error);
        return;
      }

      const mapped: ProgressState = {};
      (data || []).forEach((row: any) => {
        mapped[row.lesson_id] = {
          stage: Number(row.stage || 1),
          completed: !!row.completed,
          quizPassed: !!row.quiz_passed,
        };
      });
      setProgress(mapped);
    }

    loadProgress();
  }, [user?.id]);

  useEffect(() => {
    setSelectedAnswer(null);
    setCheckedAnswer(false);
  }, [activeLessonId]);

  async function persist(next: { stage: number; completed: boolean; quizPassed: boolean }) {
    if (!user?.id) return;

    setSaving(true);
    const { error } = await supabase.from("progreso_psicoeducacion").upsert(
      {
        user_id: user.id,
        lesson_id: activeLesson.id,
        stage: next.stage,
        completed: next.completed,
        quiz_passed: next.quizPassed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );

    if (error) console.error(error);
    setSaving(false);
  }

  async function nextStage() {
    const current = progress[activeLesson.id] || {
      stage: 1,
      completed: false,
      quizPassed: false,
    };

    const next = {
      ...current,
      stage: Math.min(activeLesson.discovery.length, current.stage + 1),
    };

    setProgress((prev) => ({ ...prev, [activeLesson.id]: next }));
    await persist(next);
  }

  async function markCompleted() {
    const current = progress[activeLesson.id] || {
      stage: activeLesson.discovery.length,
      completed: false,
      quizPassed: false,
    };

    const next = {
      ...current,
      stage: activeLesson.discovery.length,
      completed: true,
    };

    setProgress((prev) => ({ ...prev, [activeLesson.id]: next }));
    await persist(next);
  }

  async function checkQuiz() {
    if (selectedAnswer === null) return;
    setCheckedAnswer(true);

    const current = progress[activeLesson.id] || {
      stage: activeLesson.discovery.length,
      completed: false,
      quizPassed: false,
    };

    const next = {
      ...current,
      quizPassed: selectedAnswer === activeLesson.quiz.correctIndex,
    };

    setProgress((prev) => ({ ...prev, [activeLesson.id]: next }));
    await persist(next);
  }

  const currentStage = progress[activeLesson.id]?.stage || 1;
  const visibleDiscovery = activeLesson.discovery.slice(0, currentStage);
  const completedCount = Object.values(progress).filter((x) => x.completed).length;

  const iconMap = {
    comunicacion: MessageSquareMore,
    ambiente: Users,
    riesgo: Brain,
  } as const;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_25%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-cyan-300" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold mb-2">
                  Psyqus Academy
                </p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Psicoeducación
                </h1>
                <p className="mt-3 text-slate-300 max-w-3xl">
                  Aquí el usuario va descubriendo ideas, no solo leyendo bloques.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-4 min-w-[220px]">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                Lecciones completadas
              </p>
              <p className="mt-2 text-3xl font-black text-cyan-300">
                {completedCount}/{lessons.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.05fr] gap-6">
          <div className="space-y-4">
            {lessons.map((lesson) => {
              const Icon = iconMap[lesson.id as keyof typeof iconMap] || BookOpen;
              const isActive = activeLessonId === lesson.id;
              const done = progress[lesson.id]?.completed;
              const quizPassed = progress[lesson.id]?.quizPassed;

              return (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLessonId(lesson.id)}
                  className={`w-full text-left rounded-[1.5rem] border p-5 transition ${
                    isActive
                      ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]"
                      : "border-white/10 bg-slate-900/50 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-cyan-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{lesson.title}</h2>
                        <p className="text-sm text-cyan-300 mt-1">{lesson.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {done && (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-300">
                          Completa
                        </span>
                      )}
                      {quizPassed && (
                        <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-fuchsia-300">
                          Quiz OK
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-300">
                    {lesson.description}
                  </p>
                </button>
              );
            })}
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-5 h-5 text-cyan-300" />
                <h3 className="text-2xl font-bold">{activeLesson.title}</h3>
              </div>

              <div className="space-y-4">
                {visibleDiscovery.map((item, idx) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">
                      Descubrimiento {idx + 1}
                    </p>
                    <p className="text-sm leading-relaxed text-slate-200">{item}</p>
                  </div>
                ))}
              </div>

              {currentStage < activeLesson.discovery.length ? (
                <button
                  onClick={nextStage}
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black hover:bg-cyan-400 transition disabled:opacity-60"
                >
                  Descubrir siguiente idea
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={markCompleted}
                  disabled={saving}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-black hover:bg-emerald-400 transition disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar lección completa
                </button>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-5 h-5 text-fuchsia-300" />
                <h3 className="text-2xl font-bold">Reto</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">{activeLesson.challenge}</p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <h3 className="text-2xl font-bold mb-4">Mini quiz</h3>
              <p className="text-sm text-slate-300 mb-4">{activeLesson.quiz.question}</p>

              <div className="grid gap-3">
                {activeLesson.quiz.options.map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedAnswer === idx
                        ? "border-fuchsia-400/30 bg-fuchsia-500/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-sm text-white">{option}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={checkQuiz}
                disabled={saving}
                className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-3 font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 transition disabled:opacity-60"
              >
                Revisar respuesta
              </button>

              {checkedAnswer && selectedAnswer !== null && (
                <div
                  className={`mt-5 rounded-2xl border p-4 ${
                    selectedAnswer === activeLesson.quiz.correctIndex
                      ? "border-emerald-400/20 bg-emerald-500/10"
                      : "border-red-400/20 bg-red-500/10"
                  }`}
                >
                  <p className="font-semibold mb-2">
                    {selectedAnswer === activeLesson.quiz.correctIndex
                      ? "Correcto"
                      : "Todavía no"}
                  </p>
                  <p className="text-sm leading-relaxed text-slate-200">
                    {activeLesson.quiz.explanation}
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}