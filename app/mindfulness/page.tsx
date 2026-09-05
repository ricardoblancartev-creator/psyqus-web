"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  CircleDot,
  Clock3,
  Focus,
  HeartHandshake,
  Moon,
  Play,
  RotateCcw,
  Sparkles,
  Wind,
  X,
} from "lucide-react";

type ToolId =
  | "respiracion"
  | "grounding"
  | "concentracion"
  | "cierre"
  | "tension"
  | "conversacion";

type QuickTool = {
  id: ToolId;
  title: string;
  description: string;
  duration: string;
  icon: React.ElementType;
};

const tools: QuickTool[] = [
  {
    id: "respiracion",
    title: "Calmarme",
    description: "Respiración guiada para bajar revoluciones.",
    duration: "1 min",
    icon: Wind,
  },
  {
    id: "grounding",
    title: "Volver al presente",
    description: "Ejercicio breve para reconectar con tu entorno.",
    duration: "2 min",
    icon: CircleDot,
  },
  {
    id: "concentracion",
    title: "Recuperar concentración",
    description: "Ordena tu atención antes de volver a una tarea.",
    duration: "2 min",
    icon: Focus,
  },
  {
    id: "cierre",
    title: "Cerrar mi jornada",
    description: "Ayuda a separar mentalmente trabajo y descanso.",
    duration: "3 min",
    icon: Moon,
  },
  {
    id: "tension",
    title: "Soltar tensión",
    description: "Una pausa corporal después de un momento pesado.",
    duration: "2 min",
    icon: Brain,
  },
  {
    id: "conversacion",
    title: "Preparar una conversación",
    description: "Organiza lo que quieres decir antes de hablar.",
    duration: "3 min",
    icon: HeartHandshake,
  },
];

const groundingSteps = [
  {
    title: "Mira a tu alrededor",
    text: "Identifica 5 cosas que puedas ver. No necesitas analizarlas, solo nombrarlas.",
  },
  {
    title: "Nota el contacto",
    text: "Identifica 4 sensaciones físicas: tus pies en el suelo, la silla, tu ropa o la temperatura.",
  },
  {
    title: "Escucha",
    text: "Identifica 3 sonidos presentes, incluso si son muy pequeños.",
  },
  {
    title: "Respira",
    text: "Haz 2 respiraciones lentas y permite que tu atención vuelva al momento actual.",
  },
];

const focusSteps = [
  {
    title: "Vacía el ruido",
    text: "Piensa qué asuntos están ocupando tu atención en este momento.",
  },
  {
    title: "Elige una sola tarea",
    text: "Decide cuál es la única tarea que necesita tu atención durante los próximos minutos.",
  },
  {
    title: "Define el siguiente movimiento",
    text: "No pienses en terminar todo. Define únicamente la siguiente acción concreta.",
  },
  {
    title: "Reduce interrupciones",
    text: "Cierra durante unos minutos lo que no necesites para esa acción y comienza.",
  },
];

const closingSteps = [
  {
    title: "Reconoce lo que sí terminó",
    text: "Identifica mentalmente qué tareas o pendientes avanzaste hoy.",
  },
  {
    title: "Saca lo pendiente de tu cabeza",
    text: "Define qué necesita continuar mañana. No necesitas resolverlo ahora.",
  },
  {
    title: "Marca un límite",
    text: "Recuérdate: lo que quedó pendiente pertenece a la siguiente jornada.",
  },
  {
    title: "Cambia de contexto",
    text: "Haz una acción sencilla que marque el final: levantarte, guardar tus cosas, caminar o cambiar de espacio.",
  },
];

const tensionSteps = [
  {
    title: "Detecta",
    text: "Observa dónde estás acumulando tensión: mandíbula, hombros, manos, espalda o abdomen.",
  },
  {
    title: "Suelta los hombros",
    text: "Súbelos suavemente durante unos segundos y después déjalos caer.",
  },
  {
    title: "Afloja",
    text: "Relaja mandíbula y manos. Evita forzar cualquier movimiento.",
  },
  {
    title: "Exhala lento",
    text: "Haz una exhalación larga y vuelve gradualmente a tu actividad.",
  },
];

const conversationSteps = [
  {
    title: "¿Qué ocurrió?",
    text: "Describe el hecho concreto evitando palabras como “siempre”, “nunca” o ataques personales.",
  },
  {
    title: "¿Qué efecto tuvo?",
    text: "Define brevemente qué consecuencia tuvo la situación para ti, el trabajo o el equipo.",
  },
  {
    title: "¿Qué necesitas pedir?",
    text: "Convierte la molestia en una petición concreta y realizable.",
  },
  {
    title: "Prepárate para escuchar",
    text: "Deja espacio para conocer la perspectiva de la otra persona antes de buscar un acuerdo.",
  },
];

const TOTAL_SECONDS = 60;

export default function MindfulnessPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [step, setStep] = useState(0);

  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);

  const [breathPhase, setBreathPhase] = useState<
    "ready" | "inhale" | "hold" | "exhale"
  >("ready");

  const [phaseSeconds, setPhaseSeconds] = useState(4);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          setRunning(false);
          setBreathPhase("ready");
          setPhaseSeconds(4);
          return 0;
        }

        return previous - 1;
      });

      setPhaseSeconds((previous) => {
        if (previous > 1) {
          return previous - 1;
        }

        if (breathPhase === "inhale") {
          setBreathPhase("hold");
          return 4;
        }

        if (breathPhase === "hold") {
          setBreathPhase("exhale");
          return 6;
        }

        setBreathPhase("inhale");
        return 4;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, breathPhase]);

  const selectedTool = useMemo(
    () => tools.find((tool) => tool.id === activeTool),
    [activeTool]
  );

  function openTool(id: ToolId) {
    setActiveTool(id);
    setStep(0);

    if (id === "respiracion") {
      resetBreathing();
    }
  }

  function closeTool() {
    setActiveTool(null);
    setStep(0);
    setRunning(false);
    setBreathPhase("ready");
  }

  function startBreathing() {
    if (secondsLeft === 0) {
      setSecondsLeft(TOTAL_SECONDS);
    }

    setBreathPhase("inhale");
    setPhaseSeconds(4);
    setRunning(true);
  }

  function toggleBreathing() {
    if (!running && breathPhase === "ready") {
      startBreathing();
      return;
    }

    setRunning((previous) => !previous);
  }

  function resetBreathing() {
    setRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
    setBreathPhase("ready");
    setPhaseSeconds(4);
  }

  const breathLabel =
    breathPhase === "inhale"
      ? "Inhala"
      : breathPhase === "hold"
      ? "Sostén"
      : breathPhase === "exhale"
      ? "Exhala"
      : "Listo";

  const orbTransform =
    breathPhase === "inhale" || breathPhase === "hold"
      ? "scale(1.32)"
      : "scale(0.76)";

  const orbDuration =
    breathPhase === "inhale"
      ? "4000ms"
      : breathPhase === "exhale"
      ? "6000ms"
      : "350ms";

  function getSteps() {
    switch (activeTool) {
      case "grounding":
        return groundingSteps;
      case "concentracion":
        return focusSteps;
      case "cierre":
        return closingSteps;
      case "tension":
        return tensionSteps;
      case "conversacion":
        return conversationSteps;
      default:
        return [];
    }
  }

  const currentSteps = getSteps();
  const currentStep = currentSteps[step];
  const finished =
    activeTool !== "respiracion" &&
    currentSteps.length > 0 &&
    step >= currentSteps.length;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.09),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-7 md:py-10">
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </a>

        {!activeTool ? (
          <>
            <header className="max-w-3xl mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-cyan-300 font-semibold">
                <Sparkles className="w-4 h-4" />
                Herramientas rápidas
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-tight">
                ¿Qué necesitas
                <span className="text-cyan-300"> ahora?</span>
              </h1>

              <p className="mt-5 text-lg md:text-xl text-slate-300 leading-relaxed">
                Ejercicios breves para hacer una pausa, recuperar atención o
                prepararte para una situación difícil durante tu día.
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Elige una herramienta. No es una evaluación ni necesitas
                obtener una puntuación.
              </p>
            </header>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <button
                    key={tool.id}
                    onClick={() => openTool(tool.id)}
                    className="group text-left rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-6 hover:border-cyan-400/30 hover:bg-cyan-500/[0.06] transition"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center group-hover:border-cyan-400/20 group-hover:bg-cyan-500/10 transition">
                        <Icon className="w-6 h-6 text-cyan-300" />
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock3 className="w-3.5 h-3.5" />
                        {tool.duration}
                      </span>
                    </div>

                    <h2 className="mt-6 text-xl font-black">{tool.title}</h2>

                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      {tool.description}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-cyan-300">
                      Comenzar
                      <Play className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <p className="text-sm text-slate-400 leading-relaxed">
                Estas herramientas ofrecen ejercicios generales de bienestar y
                autorregulación. No realizan diagnósticos ni sustituyen atención
                psicológica o médica.
              </p>
            </div>
          </>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-7">
              <button
                onClick={closeTool}
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Herramientas
              </button>

              <button
                onClick={closeTool}
                aria-label="Cerrar herramienta"
                className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl overflow-hidden">
              <div className="border-b border-white/10 p-6 md:p-8">
                <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-300/70 font-semibold">
                  Herramienta rápida
                </p>

                <h1 className="mt-2 text-3xl md:text-4xl font-black">
                  {selectedTool?.title}
                </h1>

                <p className="mt-3 text-slate-400">
                  {selectedTool?.description}
                </p>
              </div>

              {activeTool === "respiracion" ? (
                <div className="p-6 md:p-10 text-center">
                  <div className="h-[310px] md:h-[350px] flex items-center justify-center overflow-hidden">
                    <div className="relative w-[210px] h-[210px] flex items-center justify-center">
                      <div
                        className="absolute w-[210px] h-[210px] rounded-full border border-cyan-300/20"
                        style={{
                          transform: orbTransform,
                          transitionProperty: "transform",
                          transitionDuration: orbDuration,
                          transitionTimingFunction: "ease-in-out",
                        }}
                      />

                      <div
                        className="absolute w-[175px] h-[175px] rounded-full bg-cyan-500/20 blur-3xl"
                        style={{
                          transform: orbTransform,
                          transitionProperty: "transform",
                          transitionDuration: orbDuration,
                          transitionTimingFunction: "ease-in-out",
                        }}
                      />

                      <div
                        className="relative w-[145px] h-[145px] rounded-full bg-gradient-to-br from-cyan-200 via-cyan-500 to-fuchsia-500 shadow-[0_0_90px_rgba(34,211,238,0.55)]"
                        style={{
                          transform: orbTransform,
                          transitionProperty: "transform",
                          transitionDuration: orbDuration,
                          transitionTimingFunction: "ease-in-out",
                        }}
                      />

                      <div className="absolute w-3 h-3 rounded-full bg-white shadow-[0_0_25px_white]" />
                    </div>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-black text-cyan-300">
                    {breathLabel}
                  </h2>

                  {breathPhase !== "ready" ? (
                    <p className="mt-2 text-slate-400">
                      {phaseSeconds} s · {secondsLeft} s restantes
                    </p>
                  ) : (
                    <p className="mt-2 text-slate-400">
                      Inhala 4 · sostén 4 · exhala 6
                    </p>
                  )}

                  <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <button
                      onClick={toggleBreathing}
                      className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 hover:bg-cyan-300 transition"
                    >
                      <Play className="w-4 h-4" />
                      {running
                        ? "Pausar"
                        : breathPhase === "ready"
                        ? "Comenzar"
                        : "Continuar"}
                    </button>

                    <button
                      onClick={resetBreathing}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10 transition"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reiniciar
                    </button>
                  </div>

                  {secondsLeft === 0 && (
                    <div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                      <CheckCircle2 className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
                      <p className="font-bold">Pausa terminada</p>
                      <p className="mt-1 text-sm text-slate-300">
                        Tómate unos segundos antes de volver a lo que estabas
                        haciendo.
                      </p>
                    </div>
                  )}
                </div>
              ) : !finished ? (
                <div className="p-6 md:p-10">
                  <div className="flex items-center justify-between gap-4 mb-7">
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Paso {step + 1} de {currentSteps.length}
                    </span>

                    <div className="flex gap-1.5">
                      {currentSteps.map((_, index) => (
                        <div
                          key={index}
                          className={`h-1.5 w-8 rounded-full ${
                            index <= step ? "bg-cyan-400" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="min-h-[230px] flex flex-col justify-center">
                    <h2 className="text-3xl md:text-4xl font-black">
                      {currentStep?.title}
                    </h2>

                    <p className="mt-5 text-lg leading-relaxed text-slate-300">
                      {currentStep?.text}
                    </p>
                  </div>

                  <button
                    onClick={() => setStep((previous) => previous + 1)}
                    className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 hover:bg-cyan-300 transition"
                  >
                    {step === currentSteps.length - 1
                      ? "Terminar"
                      : "Siguiente"}
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="p-8 md:p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-300" />
                  </div>

                  <h2 className="mt-6 text-3xl font-black">
                    Ejercicio terminado
                  </h2>

                  <p className="mt-3 text-slate-400 max-w-lg mx-auto">
                    Puedes volver a tus actividades o elegir otra herramienta
                    si la necesitas.
                  </p>

                  <button
                    onClick={closeTool}
                    className="mt-7 rounded-2xl bg-cyan-400 px-6 py-3 font-black text-slate-950 hover:bg-cyan-300 transition"
                  >
                    Volver a herramientas
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
