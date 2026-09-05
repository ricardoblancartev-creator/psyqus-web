"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Focus,
  Lightbulb,
  MessageSquareMore,
  Moon,
  Play,
  Sparkles,
  Wind,
} from "lucide-react";

/* =========================================================
   TIPOS
========================================================= */

type Lesson = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  duration: string;
  description: string;

  situation: string;

  discovery: string[];

  challenge: string;

  exercise: {
    title: string;
    instructions: string[];
  };

  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
};

type LessonProgress = {
  stage: number;
  completed: boolean;
  quizPassed: boolean;
};

type ProgressState =
  Record<string, LessonProgress>;

/* =========================================================
   CONTENIDO
========================================================= */

const lessons: Lesson[] = [
  {
    id: "estres-recuperacion",

    category: "Estrés y recuperación",

    title:
      "Recuperarte después de un día pesado",

    subtitle:
      "Reduce la tensión acumulada antes de llevártela a casa.",

    duration: "7 min",

    description:
      "Aprende una forma sencilla de cerrar una jornada difícil sin intentar resolver todo de golpe.",

    situation:
      "Terminaste el día con pendientes, mensajes sin responder y la sensación de que todavía deberías estar haciendo algo. Ya saliste del trabajo, pero mentalmente sigues ahí.",

    discovery: [
      "Salir del trabajo no siempre significa desconectarse mentalmente del trabajo.",

      "Después de una jornada exigente, intentar resolver todos los pendientes en tu cabeza puede prolongar la sensación de tensión.",

      "Separar lo que todavía requiere acción de lo que puede esperar ayuda a darle un cierre más claro a la jornada.",

      "Una transición breve entre trabajo y descanso puede ayudarte a dejar de responder automáticamente a cada pendiente.",
    ],

    challenge:
      "Antes de terminar tu jornada de hoy, identifica una cosa que sí debe continuar mañana y una cosa que puedes dejar de cargar mentalmente esta noche.",

    exercise: {
      title:
        "Cierre de jornada en 3 pasos",

      instructions: [
        "Escribe el pendiente más importante que continuará mañana.",

        "Define cuál será la primera acción concreta para retomarlo.",

        "Cierra tus herramientas de trabajo y realiza durante un minuto una actividad diferente: caminar, respirar, estirarte o cambiar de espacio.",
      ],
    },

    quiz: {
      question:
        "Después de una jornada difícil, ¿qué puede facilitar mejor la desconexión?",

      options: [
        "Seguir repasando mentalmente todos los pendientes.",

        "Intentar terminar absolutamente todo antes de descansar.",

        "Definir qué continúa mañana y realizar una transición de cierre.",

        "Ignorar cualquier pendiente aunque sea urgente.",
      ],

      correctIndex: 2,

      explanation:
        "Definir qué continuará después permite cerrar temporalmente la jornada sin confundir desconexión con abandonar responsabilidades.",
    },
  },

  {
    id: "dormir-desconexion",

    category: "Sueño y desconexión",

    title:
      "Prepararte para dormir mejor",

    subtitle:
      "Ayuda a tu mente a distinguir trabajo, actividad y descanso.",

    duration: "6 min",

    description:
      "Una rutina breve de desconexión puede facilitar una transición más clara hacia el descanso.",

    situation:
      "Te acostaste, pero sigues revisando mensajes, recordando pendientes y pensando en lo que tienes que hacer mañana.",

    discovery: [
      "El descanso comienza antes de acostarte: una transición brusca entre actividad intensa y sueño puede dificultar desconectarte.",

      "Revisar continuamente pendientes de trabajo mantiene activa la atención sobre problemas que no necesariamente puedes resolver en ese momento.",

      "Anotar lo que necesitas recordar mañana puede evitar que tengas que repetirlo mentalmente para no olvidarlo.",

      "Una rutina sencilla y repetible puede convertirse en una señal de que la jornada terminó.",
    ],

    challenge:
      "Esta noche prueba cerrar tus pendientes laborales antes de acostarte y deja por escrito lo que necesites recordar mañana.",

    exercise: {
      title:
        "Rutina breve de desconexión",

      instructions: [
        "Anota cualquier pendiente laboral que estés intentando recordar.",

        "Define cuál será el primero que revisarás mañana.",

        "Durante unos minutos reduce conversaciones, contenido o actividades relacionadas con el trabajo antes de acostarte.",
      ],
    },

    quiz: {
      question:
        "Si aparece un pendiente laboral justo antes de dormir, ¿qué opción puede ayudar más a desconectarte?",

      options: [
        "Resolver inmediatamente todos los pendientes.",

        "Anotarlo para revisarlo después y volver a tu rutina de descanso.",

        "Repetirlo mentalmente hasta quedarte dormido.",

        "Revisar mensajes para comprobar si apareció otro problema.",
      ],

      correctIndex: 1,

      explanation:
        "Registrar el pendiente permite conservar la información sin mantenerla activamente en la memoria durante toda la noche.",
    },
  },

  {
    id: "concentracion",

    category: "Concentración",

    title:
      "Recuperar el enfoque cuando tienes demasiado encima",

    subtitle:
      "Reduce el ruido y decide qué merece tu atención primero.",

    duration: "5 min",

    description:
      "La concentración no siempre consiste en esforzarte más. Muchas veces empieza por reducir decisiones y distracciones.",

    situation:
      "Tienes mensajes, correos, pendientes y varias tareas abiertas. Cambias constantemente de una a otra y sientes que avanzas poco.",

    discovery: [
      "Cambiar constantemente de tarea obliga a recuperar contexto una y otra vez.",

      "Cuando todo parece urgente, elegir conscientemente una prioridad reduce la cantidad de decisiones que tienes que tomar durante los siguientes minutos.",

      "Una tarea grande se vuelve más manejable cuando defines la siguiente acción visible y concreta.",

      "Crear un periodo breve sin interrupciones puede ser más útil que esperar a tener una hora completamente libre.",
    ],

    challenge:
      "Elige una tarea pendiente y conviértela en una acción que puedas comenzar en menos de dos minutos.",

    exercise: {
      title: "Bloque de enfoque",

      instructions: [
        "Elige una sola tarea.",

        "Define exactamente qué acción vas a realizar primero.",

        "Retira durante unos minutos las notificaciones que no sean necesarias.",

        "Termina ese bloque antes de decidir cuál será la siguiente tarea.",
      ],
    },

    quiz: {
      question:
        "¿Qué suele ayudar más cuando tienes demasiadas tareas compitiendo por tu atención?",

      options: [
        "Mantener todas abiertas para no olvidar ninguna.",

        "Cambiar de tarea cada vez que llegue una notificación.",

        "Elegir una prioridad y definir la siguiente acción concreta.",

        "Esperar hasta sentirte completamente motivado.",
      ],

      correctIndex: 2,

      explanation:
        "Una prioridad clara y una siguiente acción concreta reducen el número de decisiones necesarias para empezar.",
    },
  },

  {
    id: "sobrepensamiento",

    category: "Sobrepensamiento",

    title:
      "Cuando tu cabeza no deja de darle vueltas",

    subtitle:
      "Distingue entre pensar un problema y quedarte atrapado en él.",

    duration: "7 min",

    description:
      "Aprende a transformar una preocupación repetitiva en una decisión, una acción o algo que puedas dejar temporalmente en espera.",

    situation:
      "Tuviste una conversación incómoda en el trabajo. Horas después sigues repasando lo que dijiste, lo que la otra persona quiso decir y todo lo que pudo haber pasado.",

    discovery: [
      "Pensar sobre un problema puede ser útil cuando produce nueva información, una decisión o una acción.",

      "Repetir la misma conversación mentalmente sin obtener nada nuevo puede mantener activa la preocupación.",

      "Preguntarte qué parte de la situación está realmente bajo tu control ayuda a separar acción de especulación.",

      "No todas las dudas necesitan resolverse inmediatamente para poder continuar con tu día.",
    ],

    challenge:
      "Toma una preocupación actual y escribe dos columnas: 'puedo hacer algo hoy' y 'no depende de mí ahora'.",

    exercise: {
      title: "De pensamiento a acción",

      instructions: [
        "Describe el problema en una sola frase.",

        "Pregunta: ¿hay alguna acción concreta que pueda realizar ahora?",

        "Si existe, define la acción más pequeña.",

        "Si no existe, anota cuándo volverás a revisar el tema y cambia deliberadamente de actividad.",
      ],
    },

    quiz: {
      question:
        "¿Qué diferencia mejor una reflexión útil de darle vueltas repetidamente a un problema?",

      options: [
        "Pensar durante muchas horas.",

        "Llegar a nueva información, una decisión o una acción posible.",

        "Imaginar todos los escenarios negativos.",

        "Recordar exactamente cada detalle de la situación.",
      ],

      correctIndex: 1,

      explanation:
        "La reflexión se vuelve más útil cuando ayuda a comprender, decidir o actuar, en lugar de repetir el mismo ciclo sin información nueva.",
    },
  },
];

/* =========================================================
   IDENTIDAD VISUAL DE CADA CURSO
========================================================= */

const lessonVisuals = {
  "estres-recuperacion": {
    icon: Wind,

    label: "RECUPERACIÓN",

    gradient:
      "from-cyan-500/25 via-sky-500/10 to-slate-950",

    glow:
      "bg-cyan-400/20",

    accent:
      "text-cyan-300",

    border:
      "border-cyan-400/20",

    scene: "Fin de jornada",
  },

  "dormir-desconexion": {
    icon: Moon,

    label: "DESCANSO",

    gradient:
      "from-violet-500/25 via-indigo-500/10 to-slate-950",

    glow:
      "bg-violet-400/20",

    accent:
      "text-violet-300",

    border:
      "border-violet-400/20",

    scene: "Desconexión",
  },

  concentracion: {
    icon: Focus,

    label: "ENFOQUE",

    gradient:
      "from-emerald-500/20 via-cyan-500/10 to-slate-950",

    glow:
      "bg-emerald-400/20",

    accent:
      "text-emerald-300",

    border:
      "border-emerald-400/20",

    scene: "Atención",
  },

  sobrepensamiento: {
    icon: Brain,

    label: "CLARIDAD MENTAL",

    gradient:
      "from-fuchsia-500/20 via-violet-500/10 to-slate-950",

    glow:
      "bg-fuchsia-400/20",

    accent:
      "text-fuchsia-300",

    border:
      "border-fuchsia-400/20",

    scene: "Perspectiva",
  },
} as const;

/* =========================================================
   PORTADA DEL CURSO
========================================================= */

function CourseCover({
  lesson,
  large = false,
}: {
  lesson: Lesson;
  large?: boolean;
}) {
  const visual =
    lessonVisuals[
      lesson.id as keyof typeof lessonVisuals
    ];

  const Icon = visual.icon;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${visual.gradient} ${
        large
          ? "min-h-[300px] md:min-h-[380px]"
          : "h-[210px]"
      }`}
    >
      {/* LUCES */}

      <div
        className={`absolute -right-14 -top-14 w-48 h-48 rounded-full blur-3xl ${visual.glow}`}
      />

      <div
        className={`absolute -left-16 -bottom-16 w-44 h-44 rounded-full blur-3xl ${visual.glow}`}
      />

      {/* ORBITAS */}

      <div className="absolute right-6 top-6 w-28 h-28 rounded-full border border-white/10" />

      <div className="absolute right-11 top-11 w-18 h-18 rounded-full border border-white/10" />

      {/* AVATAR VISUAL */}

      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative ${
            large
              ? "w-36 h-36 md:w-44 md:h-44"
              : "w-28 h-28"
          } rounded-full border ${visual.border} bg-slate-950/50 backdrop-blur-md flex items-center justify-center shadow-2xl`}
        >
          <div className="absolute inset-3 rounded-full border border-white/10" />

          <div
            className={`absolute inset-7 rounded-full blur-xl ${visual.glow}`}
          />

          <Icon
            className={`relative ${
              large
                ? "w-16 h-16 md:w-20 md:h-20"
                : "w-12 h-12"
            } ${visual.accent}`}
          />
        </div>
      </div>

      {/* ETIQUETA */}

      <div className="absolute left-5 top-5">
        <span
          className={`rounded-full border ${visual.border} bg-slate-950/50 backdrop-blur-md px-3 py-1.5 text-[10px] font-black tracking-[0.2em] ${visual.accent}`}
        >
          {visual.label}
        </span>
      </div>

      {/* AVATAR PSYQUS */}

      <div className="absolute left-5 bottom-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border border-white/15 bg-slate-950/70 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
            Psyqus
          </p>

          <p className="text-xs font-semibold text-slate-300">
            {visual.scene}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PÁGINA
========================================================= */

export default function PsicoeducacionPage() {
  const {
    user,
    isLoaded,
  } = useUser();

  /*
    NULL = biblioteca.
    ID = curso abierto.

    Ya no obligamos a mostrar un curso comprimido
    al lado de la biblioteca.
  */

  const [
    activeLessonId,
    setActiveLessonId,
  ] =
    useState<string | null>(
      null
    );

  const [
    progress,
    setProgress,
  ] =
    useState<ProgressState>(
      {}
    );

  const [
    selectedAnswer,
    setSelectedAnswer,
  ] =
    useState<number | null>(
      null
    );

  const [
    checkedAnswer,
    setCheckedAnswer,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    loadingProgress,
    setLoadingProgress,
  ] =
    useState(true);

  const [
    saveError,
    setSaveError,
  ] =
    useState("");

  /* =========================================================
     CURSO ACTIVO
  ========================================================= */

  const activeLesson =
    useMemo(() => {
      if (!activeLessonId) {
        return null;
      }

      return (
        lessons.find(
          (lesson) =>
            lesson.id ===
            activeLessonId
        ) || null
      );
    }, [activeLessonId]);

  /* =========================================================
     CARGAR PROGRESO REAL
  ========================================================= */

  useEffect(() => {
    async function loadProgress() {
      if (!isLoaded) {
        return;
      }

      if (!user?.id) {
        setLoadingProgress(
          false
        );

        return;
      }

      setLoadingProgress(true);

      const {
        data,
        error,
      } = await supabase
        .from(
          "progreso_psicoeducacion"
        )
        .select(
          "lesson_id, stage, completed, quiz_passed"
        )
        .eq(
          "user_id",
          user.id
        );

      if (error) {
        console.error(
          "Error cargando progreso_psicoeducacion:",
          error
        );

        setLoadingProgress(
          false
        );

        return;
      }

      const mapped: ProgressState =
        {};

      (data || []).forEach(
        (row: any) => {
          mapped[row.lesson_id] =
            {
              stage:
                Math.max(
                  1,
                  Number(
                    row.stage ||
                      1
                  )
                ),

              completed:
                row.completed ===
                true,

              quizPassed:
                row.quiz_passed ===
                true,
            };
        }
      );

      setProgress(mapped);

      setLoadingProgress(
        false
      );
    }

    void loadProgress();
  }, [
    isLoaded,
    user?.id,
  ]);

  /* =========================================================
     RESET AL CAMBIAR DE CURSO
  ========================================================= */

  useEffect(() => {
    setSelectedAnswer(
      null
    );

    setCheckedAnswer(
      false
    );

    setSaveError("");
  }, [activeLessonId]);

  /* =========================================================
     PERSISTENCIA
  ========================================================= */

  async function persist(
    lessonId: string,
    next: LessonProgress
  ): Promise<boolean> {
    if (!user?.id) {
      setSaveError(
        "Necesitas iniciar sesión para guardar tu progreso."
      );

      return false;
    }

    setSaving(true);
    setSaveError("");

    const { error } =
      await supabase
        .from(
          "progreso_psicoeducacion"
        )
        .upsert(
          {
            user_id:
              user.id,

            lesson_id:
              lessonId,

            stage:
              next.stage,

            completed:
              next.completed,

            quiz_passed:
              next.quizPassed,

            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "user_id,lesson_id",
          }
        );

    setSaving(false);

    if (error) {
      console.error(
        "Error guardando progreso_psicoeducacion:",
        error
      );

      setSaveError(
        "No pudimos guardar tu progreso. Intenta nuevamente."
      );

      return false;
    }

    return true;
  }

  /* =========================================================
     ACCIONES
  ========================================================= */

  async function nextStage() {
    if (!activeLesson) {
      return;
    }

    const current =
      progress[
        activeLesson.id
      ] || {
        stage: 1,
        completed: false,
        quizPassed: false,
      };

    const next: LessonProgress =
      {
        ...current,

        stage: Math.min(
          activeLesson
            .discovery.length,
          current.stage + 1
        ),
      };

    const saved =
      await persist(
        activeLesson.id,
        next
      );

    if (!saved) {
      return;
    }

    setProgress(
      (previous) => ({
        ...previous,

        [activeLesson.id]:
          next,
      })
    );
  }

  async function markCompleted() {
    if (!activeLesson) {
      return;
    }

    const current =
      progress[
        activeLesson.id
      ] || {
        stage:
          activeLesson
            .discovery.length,

        completed: false,

        quizPassed: false,
      };

    const next: LessonProgress =
      {
        ...current,

        stage:
          activeLesson
            .discovery.length,

        completed: true,
      };

    const saved =
      await persist(
        activeLesson.id,
        next
      );

    if (!saved) {
      return;
    }

    setProgress(
      (previous) => ({
        ...previous,

        [activeLesson.id]:
          next,
      })
    );
  }

  async function checkQuiz() {
    if (
      !activeLesson ||
      selectedAnswer ===
        null
    ) {
      return;
    }

    setCheckedAnswer(true);

    const current =
      progress[
        activeLesson.id
      ] || {
        stage:
          activeLesson
            .discovery.length,

        completed: false,

        quizPassed: false,
      };

    const passed =
      selectedAnswer ===
      activeLesson.quiz
        .correctIndex;

    const next: LessonProgress =
      {
        ...current,

        quizPassed:
          passed ||
          current.quizPassed,
      };

    const saved =
      await persist(
        activeLesson.id,
        next
      );

    if (!saved) {
      return;
    }

    setProgress(
      (previous) => ({
        ...previous,

        [activeLesson.id]:
          next,
      })
    );
  }

  /* =========================================================
     PROGRESO REAL
  ========================================================= */

  const completedCount =
    lessons.filter(
      (lesson) =>
        progress[
          lesson.id
        ]?.completed
    ).length;

  const percentage =
    lessons.length > 0
      ? Math.round(
          (completedCount /
            lessons.length) *
            100
        )
      : 0;

  /* =========================================================
     VISTA CURSO
  ========================================================= */

  if (activeLesson) {
    const visual =
      lessonVisuals[
        activeLesson.id as keyof typeof lessonVisuals
      ];

    const currentStage =
      progress[
        activeLesson.id
      ]?.stage || 1;

    const visibleDiscovery =
      activeLesson.discovery.slice(
        0,
        currentStage
      );

    const courseCompleted =
      progress[
        activeLesson.id
      ]?.completed === true;

    return (
      <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_28%)]" />

        <section className="relative max-w-5xl mx-auto px-5 md:px-6 py-6 md:py-10">
          {/* VOLVER */}

          <button
            type="button"
            onClick={() =>
              setActiveLessonId(
                null
              )
            }
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />

            Volver a Aprender
          </button>

          {/* HERO */}

          <section
            className={`rounded-[2rem] overflow-hidden border ${visual.border} bg-slate-950/70 mb-6`}
          >
            <CourseCover
              lesson={
                activeLesson
              }
              large
            />

            <div className="p-6 md:p-9">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-[10px] font-black uppercase tracking-[0.22em] ${visual.accent}`}
                >
                  {
                    activeLesson.category
                  }
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock3 className="w-3.5 h-3.5" />

                  {
                    activeLesson.duration
                  }
                </span>

                {courseCompleted && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" />

                    Completado
                  </span>
                )}
              </div>

              <h1 className="mt-4 max-w-4xl text-3xl md:text-5xl font-black tracking-tight">
                {
                  activeLesson.title
                }
              </h1>

              <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-slate-300">
                {
                  activeLesson.description
                }
              </p>
            </div>
          </section>

          {saveError && (
            <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              {saveError}
            </div>
          )}

          {/* GUÍA PSYQUS */}

          <section className="mb-6 rounded-[1.6rem] border border-cyan-400/15 bg-cyan-500/[0.05] p-5 md:p-6">
            <div className="flex items-start gap-4">
              <div className="relative w-12 h-12 rounded-full border border-cyan-400/20 bg-slate-950 flex items-center justify-center shrink-0">
                <div className="absolute inset-2 rounded-full bg-cyan-400/10 blur-md" />

                <Sparkles className="relative w-5 h-5 text-cyan-300" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-300">
                  Psyqus te acompaña
                </p>

                <p className="mt-2 text-sm md:text-base leading-relaxed text-slate-300">
                  Este microcurso no es un examen.
                  Avanza a tu ritmo, identifica
                  una idea útil y prueba al menos
                  una acción en tu día.
                </p>
              </div>
            </div>
          </section>

          {/* SITUACIÓN */}

          <section className="mb-6 rounded-[1.75rem] border border-fuchsia-400/15 bg-fuchsia-500/[0.06] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <MessageSquareMore className="w-5 h-5 text-fuchsia-300" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/70">
                  Empecemos aquí
                </p>

                <h2 className="mt-1 text-xl md:text-2xl font-black">
                  Una situación real
                </h2>
              </div>
            </div>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-300">
              {
                activeLesson.situation
              }
            </p>
          </section>

          {/* DESCUBRIMIENTO */}

          <section className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 md:p-8">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-cyan-300" />

                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                    Paso a paso
                  </p>

                  <h2 className="mt-1 text-xl md:text-2xl font-black">
                    Descubre la idea
                  </h2>
                </div>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                {currentStage}/
                {
                  activeLesson
                    .discovery
                    .length
                }
              </span>
            </div>

            {/* BARRA */}

            <div className="mb-7 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all duration-500"
                style={{
                  width: `${
                    (currentStage /
                      activeLesson
                        .discovery
                        .length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="space-y-4">
              {visibleDiscovery.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={`${activeLesson.id}-${index}`}
                    className={`rounded-[1.4rem] border p-5 md:p-6 ${
                      index ===
                      visibleDiscovery.length -
                        1
                        ? "border-cyan-400/20 bg-cyan-500/[0.05]"
                        : "border-white/10 bg-white/[0.025]"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center shrink-0 text-xs font-black text-cyan-300">
                        {index + 1}
                      </div>

                      <p className="pt-1 text-sm md:text-base leading-relaxed text-slate-200">
                        {item}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

            {currentStage <
            activeLesson
              .discovery
              .length ? (
              <button
                type="button"
                onClick={
                  nextStage
                }
                disabled={
                  saving
                }
                className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3.5 font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
              >
                {saving
                  ? "Guardando..."
                  : "Continuar"}

                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />

                Ideas revisadas
              </div>
            )}
          </section>

          {/* EJERCICIO */}

          <section className="mb-6 rounded-[1.75rem] border border-emerald-400/15 bg-emerald-500/[0.06] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-300" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/70">
                  Para usar hoy
                </p>

                <h2 className="mt-1 text-xl md:text-2xl font-black">
                  {
                    activeLesson
                      .exercise
                      .title
                  }
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {activeLesson.exercise.instructions.map(
                (
                  instruction,
                  index
                ) => (
                  <div
                    key={`${activeLesson.id}-exercise-${index}`}
                    className="rounded-2xl border border-emerald-400/10 bg-slate-950/30 p-5 flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-full border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center shrink-0 text-sm font-black text-emerald-300">
                      {index + 1}
                    </div>

                    <p className="pt-1.5 text-sm md:text-base leading-relaxed text-slate-300">
                      {
                        instruction
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* RETO */}

          <section className="mb-6 rounded-[1.75rem] border border-amber-400/15 bg-amber-500/[0.05] p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-300" />

              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">
                  Llévatelo contigo
                </p>

                <h2 className="mt-1 text-xl md:text-2xl font-black">
                  Reto práctico
                </h2>
              </div>
            </div>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-300">
              {
                activeLesson.challenge
              }
            </p>
          </section>

          {/* QUIZ */}

          <section className="mb-6 rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/70">
              Comprueba la idea
            </p>

            <h2 className="mt-2 text-xl md:text-2xl font-black">
              Una pregunta rápida
            </h2>

            <p className="mt-5 text-base leading-relaxed text-slate-300">
              {
                activeLesson.quiz
                  .question
              }
            </p>

            <div className="mt-6 grid gap-3">
              {activeLesson.quiz.options.map(
                (
                  option,
                  index
                ) => {
                  const selected =
                    selectedAnswer ===
                    index;

                  return (
                    <button
                      type="button"
                      key={`${activeLesson.id}-quiz-${index}`}
                      onClick={() => {
                        setSelectedAnswer(
                          index
                        );

                        setCheckedAnswer(
                          false
                        );
                      }}
                      className={`w-full rounded-2xl border p-4 md:p-5 text-left transition ${
                        selected
                          ? "border-fuchsia-400/30 bg-fuchsia-500/10"
                          : "border-white/10 bg-white/[0.025] hover:bg-white/[0.05]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 text-xs font-black ${
                            selected
                              ? "border-fuchsia-400/30 bg-fuchsia-500/15 text-fuchsia-300"
                              : "border-white/10 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(
                            65 +
                              index
                          )}
                        </div>

                        <span className="pt-0.5 text-sm md:text-base text-white">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={
                checkQuiz
              }
              disabled={
                selectedAnswer ===
                  null ||
                saving
              }
              className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 px-5 py-3 font-semibold text-fuchsia-300 hover:bg-fuchsia-500/20 transition disabled:opacity-40"
            >
              Revisar respuesta
            </button>

            {checkedAnswer &&
              selectedAnswer !==
                null && (
                <div
                  className={`mt-5 rounded-2xl border p-5 ${
                    selectedAnswer ===
                    activeLesson
                      .quiz
                      .correctIndex
                      ? "border-emerald-400/20 bg-emerald-500/10"
                      : "border-amber-400/20 bg-amber-500/10"
                  }`}
                >
                  <p className="font-black">
                    {selectedAnswer ===
                    activeLesson
                      .quiz
                      .correctIndex
                      ? "Bien."
                      : "Revisa esta idea."}
                  </p>

                  <p className="mt-2 text-sm leading-relaxed text-slate-200">
                    {
                      activeLesson
                        .quiz
                        .explanation
                    }
                  </p>
                </div>
              )}
          </section>

          {/* COMPLETAR */}

          <section className="rounded-[1.75rem] border border-cyan-400/15 bg-cyan-500/[0.05] p-6 md:p-8">
            {courseCompleted ? (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                  </div>

                  <div>
                    <p className="font-black text-emerald-300">
                      Microcurso completado
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Tu progreso está registrado en Psyqus.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setActiveLessonId(
                      null
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
                >
                  Ver otros cursos

                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-black">
                  Termina el microcurso
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Cuando hayas revisado todas las ideas,
                  puedes registrar este microcurso como completado.
                </p>

                <button
                  type="button"
                  onClick={
                    markCompleted
                  }
                  disabled={
                    saving ||
                    currentStage <
                      activeLesson
                        .discovery
                        .length
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-black text-slate-950 hover:bg-emerald-300 transition disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4" />

                  {saving
                    ? "Guardando..."
                    : "Completar microcurso"}
                </button>

                {currentStage <
                  activeLesson
                    .discovery
                    .length && (
                  <p className="mt-3 text-xs text-slate-500">
                    Revisa primero todas las ideas del microcurso.
                  </p>
                )}
              </>
            )}
          </section>
        </section>
      </main>
    );
  }

  /* =========================================================
     BIBLIOTECA
  ========================================================= */

  const featured =
    lessons[0];

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.08),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:44px_44px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-6 md:py-10">
        {/* VOLVER */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Inicio
        </Link>

        {/* HEADER */}

        <header className="mt-7 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-cyan-300">
                <BookOpen className="w-5 h-5" />

                <p className="text-[10px] uppercase tracking-[0.28em] font-black">
                  Psyqus · Aprender
                </p>
              </div>

              <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">
                Aprende algo útil
                <span className="text-cyan-300">
                  {" "}en pocos minutos.
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-slate-400">
                Microcursos para situaciones reales del
                trabajo. Elige lo que necesitas y avanza
                a tu ritmo.
              </p>
            </div>

            {/* PROGRESO */}

            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5 min-w-[240px]">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Tu progreso
              </p>

              {loadingProgress ? (
                <p className="mt-3 text-sm text-slate-400">
                  Cargando...
                </p>
              ) : (
                <>
                  <div className="mt-2 flex items-end justify-between">
                    <p className="text-3xl font-black">
                      {completedCount}
                      <span className="text-slate-600">
                        /{lessons.length}
                      </span>
                    </p>

                    <p className="text-sm font-black text-cyan-300">
                      {percentage}%
                    </p>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-cyan-300 transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* DESTACADO */}

        <section className="mb-12">
          <p className="mb-4 text-xs uppercase tracking-[0.22em] text-slate-500">
            Para empezar
          </p>

          <button
            type="button"
            onClick={() =>
              setActiveLessonId(
                featured.id
              )
            }
            className="group w-full overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-slate-950/65 text-left transition hover:border-cyan-400/30"
          >
            <div className="grid lg:grid-cols-[1fr_1.05fr]">
              <CourseCover
                lesson={
                  featured
                }
                large
              />

              <div className="p-7 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-300" />

                  <span className="text-[10px] uppercase tracking-[0.22em] font-black text-cyan-300">
                    Curso destacado
                  </span>
                </div>

                <h2 className="mt-4 text-3xl md:text-4xl font-black tracking-tight">
                  {
                    featured.title
                  }
                </h2>

                <p className="mt-4 text-base leading-relaxed text-slate-400">
                  {
                    featured.subtitle
                  }
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <span className="inline-flex items-center gap-2 text-sm text-slate-500">
                    <Clock3 className="w-4 h-4" />

                    {
                      featured.duration
                    }
                  </span>

                  {progress[
                    featured.id
                  ]?.completed && (
                    <span className="inline-flex items-center gap-2 text-sm text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />

                      Completado
                    </span>
                  )}
                </div>

                <div className="mt-7">
                  <span className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 group-hover:bg-cyan-300 transition">
                    <Play className="w-4 h-4 fill-current" />

                    {progress[
                      featured.id
                    ]
                      ? "Continuar"
                      : "Comenzar"}

                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* BIBLIOTECA */}

        <section>
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Biblioteca
            </p>

            <h2 className="mt-2 text-2xl md:text-3xl font-black">
              ¿Qué quieres trabajar?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {lessons.map(
              (lesson) => {
                const done =
                  progress[
                    lesson.id
                  ]?.completed ===
                  true;

                const started =
                  Boolean(
                    progress[
                      lesson.id
                    ]
                  );

                return (
                  <button
                    type="button"
                    key={
                      lesson.id
                    }
                    onClick={() =>
                      setActiveLessonId(
                        lesson.id
                      )
                    }
                    className="group overflow-hidden rounded-[1.65rem] border border-white/10 bg-slate-950/60 text-left transition hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
                  >
                    <CourseCover
                      lesson={
                        lesson
                      }
                    />

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
                          {
                            lesson.category
                          }
                        </p>

                        {done && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                        )}
                      </div>

                      <h3 className="mt-3 text-lg font-black leading-snug">
                        {
                          lesson.title
                        }
                      </h3>

                      <p className="mt-3 text-sm leading-relaxed text-slate-500 line-clamp-2">
                        {
                          lesson.subtitle
                        }
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock3 className="w-3.5 h-3.5" />

                          {
                            lesson.duration
                          }
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300">
                          {done
                            ? "Ver"
                            : started
                            ? "Continuar"
                            : "Comenzar"}

                          <ChevronRight className="w-4 h-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </section>

        {/* MENSAJE FINAL */}

        <section className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-full border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>

            <div>
              <p className="font-black">
                Aprende para usarlo, no para memorizarlo.
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
                Los microcursos de Psyqus están pensados para
                convertir una idea en una acción pequeña que
                puedas aplicar en situaciones reales del trabajo.
              </p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
