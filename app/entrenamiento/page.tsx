"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  MessageSquareMore,
  ShieldCheck,
  Users,
  Brain,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

type ScenarioOption = {
  text: string;
  feedback: string;
  recommended: boolean;
};

type ScenarioStep = {
  situation: string;
  question: string;
  options: ScenarioOption[];
};

type Track = {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  duration: string;
  context: string;
  steps: ScenarioStep[];
  conclusion: string;
  takeaway: string;
};

type TrainingProgress = Record<
  string,
  {
    step: number;
    completed: boolean;
  }
>;

const tracks: Track[] = [
  {
    id: "comunicacion",
    category: "Comunicación",
    title: "Un compañero no cumplió con su parte",
    subtitle:
      "Practica cómo abordar un incumplimiento sin convertirlo en una pelea.",
    duration: "5 min",
    context:
      "Estás trabajando en una entrega importante. Una parte dependía de un compañero, pero no la terminó a tiempo. Ahora tú tienes más presión y necesitas hablar con él.",
    steps: [
      {
        situation:
          "Encuentras a tu compañero y sigues molesto por lo ocurrido.",
        question: "¿Cómo iniciarías la conversación?",
        options: [
          {
            text: "Siempre haces lo mismo. Por tu culpa ahora tengo que resolver todo.",
            feedback:
              "Expresa el enojo, pero empieza con una generalización y un ataque personal. Eso puede hacer que la otra persona se defienda antes de hablar del problema.",
            recommended: false,
          },
          {
            text: "La parte que necesitábamos no estuvo lista a la hora acordada y eso retrasó la entrega. ¿Qué pasó?",
            feedback:
              "Empiezas describiendo un hecho concreto y su impacto, y después abres espacio para conocer qué ocurrió.",
            recommended: true,
          },
          {
            text: "No digo nada. Mejor lo termino yo para evitar problemas.",
            feedback:
              "Puede resolver la urgencia inmediata, pero deja sin atender el problema y aumenta la posibilidad de que vuelva a ocurrir.",
            recommended: false,
          },
        ],
      },
      {
        situation:
          "Tu compañero explica que recibió otra tarea urgente y asumió que podría terminar ambas sin avisarte.",
        question: "¿Qué harías después?",
        options: [
          {
            text: "Le digo que eso no me importa y que simplemente cumpla.",
            feedback:
              "Mantiene el reclamo, pero no construye una forma concreta de prevenir que la situación se repita.",
            recommended: false,
          },
          {
            text: "Le propongo que, si vuelve a cambiar una prioridad que afecte la entrega, me avise antes para reorganizarnos.",
            feedback:
              "Convierte el conflicto en un acuerdo observable para una situación futura.",
            recommended: true,
          },
          {
            text: "Le digo que no pasa nada aunque sí me haya afectado.",
            feedback:
              "Evita tensión en el momento, pero oculta el impacto real y dificulta establecer un acuerdo.",
            recommended: false,
          },
        ],
      },
    ],
    conclusion:
      "Resolver un conflicto no significa evitar la incomodidad. Una conversación puede ser firme sin convertirse en un ataque.",
    takeaway:
      "Hecho observable → impacto → escuchar → acuerdo concreto.",
  },

  {
    id: "liderazgo",
    category: "Liderazgo",
    title: "Recibes un trabajo con errores antes de una entrega",
    subtitle:
      "Practica cómo corregir bajo presión sin humillar ni ignorar el problema.",
    duration: "5 min",
    context:
      "Coordinas a otras personas. Falta poco para entregar un trabajo importante y detectas varios errores en lo que preparó un integrante del equipo.",
    steps: [
      {
        situation:
          "Estás bajo presión y necesitas que los errores se corrijan rápidamente.",
        question: "¿Cómo abordarías a la persona?",
        options: [
          {
            text: "¿Cómo pudiste entregar algo así? Esto está fatal.",
            feedback:
              "Comunica molestia, pero convierte la corrección del trabajo en una valoración sobre la persona y puede aumentar la defensividad.",
            recommended: false,
          },
          {
            text: "Encontré estos tres errores en la entrega. Necesitamos corregirlos antes de enviarla. Revisemos qué pasó.",
            feedback:
              "Delimita el problema, establece la necesidad y permite investigar la causa sin recurrir a humillación.",
            recommended: true,
          },
          {
            text: "Lo corrijo yo y no digo nada porque no hay tiempo.",
            feedback:
              "Puede resolver la emergencia, pero elimina una oportunidad de aprendizaje y deja intacta la causa del error.",
            recommended: false,
          },
        ],
      },
      {
        situation:
          "La persona reconoce que no entendió una parte de las instrucciones, pero no preguntó porque temía parecer poco preparada.",
        question: "¿Cuál sería una respuesta más útil?",
        options: [
          {
            text: "Pues debiste entenderlo desde el principio.",
            feedback:
              "Cierra la conversación sin resolver la ambigüedad que contribuyó al error.",
            recommended: false,
          },
          {
            text: "Aclaremos esa parte ahora. Para la próxima, si una instrucción no está clara, prefiero que la revisemos antes de avanzar.",
            feedback:
              "Corrige la situación actual y establece una conducta concreta para prevenir errores similares.",
            recommended: true,
          },
          {
            text: "Entonces mejor ya no te asigno este tipo de tareas.",
            feedback:
              "Reduce el problema inmediato, pero puede limitar aprendizaje sin explorar primero si la dificultad era corregible.",
            recommended: false,
          },
        ],
      },
    ],
    conclusion:
      "La exigencia y el respeto no son opuestos. Corregir con claridad permite atender el desempeño sin convertir el error en una agresión personal.",
    takeaway:
      "Problema concreto → expectativa clara → causa → siguiente paso.",
  },

  {
    id: "prevencion",
    category: "Prevención",
    title: "Tu equipo lleva varias semanas bajo presión",
    subtitle:
      "Practica qué hacer cuando el desgaste empieza a normalizarse.",
    duration: "6 min",
    context:
      "Durante varias semanas ha aumentado la carga de trabajo. Empiezas a notar irritabilidad, errores y comentarios frecuentes sobre cansancio entre varias personas.",
    steps: [
      {
        situation:
          "Todavía se están cumpliendo las entregas, pero el ambiente está cada vez más tenso.",
        question: "¿Cuál sería una primera respuesta más útil?",
        options: [
          {
            text: "No hacer nada mientras los resultados sigan saliendo.",
            feedback:
              "Esperar únicamente a que aparezca una afectación mayor reduce las posibilidades de actuar preventivamente.",
            recommended: false,
          },
          {
            text: "Revisar qué está generando la presión y si existen prioridades, cargas o procesos que puedan reorganizarse.",
            feedback:
              "Busca comprender las condiciones que están contribuyendo al desgaste antes de asumir una causa.",
            recommended: true,
          },
          {
            text: "Decirle al equipo que necesita aprender a manejar mejor el estrés.",
            feedback:
              "Traslada el problema directamente a las personas sin revisar primero si existen condiciones de trabajo modificables.",
            recommended: false,
          },
        ],
      },
      {
        situation:
          "Al revisar el trabajo descubres que varias urgencias aparecen porque las prioridades cambian constantemente y no siempre se comunican con claridad.",
        question: "¿Qué acción sería más concreta?",
        options: [
          {
            text: "Dar una charla general sobre actitud positiva.",
            feedback:
              "Puede tener valor en otros contextos, pero no modifica la causa organizacional que acabas de identificar.",
            recommended: false,
          },
          {
            text: "Definir cómo se comunicarán los cambios de prioridad y quién decidirá qué tarea se desplaza cuando aparezca una urgencia.",
            feedback:
              "Ataca directamente una condición identificada y convierte la prevención en una acción observable.",
            recommended: true,
          },
          {
            text: "Pedir al equipo que se acostumbre porque el trabajo siempre es así.",
            feedback:
              "Normalizar una condición problemática impide evaluar si existen ajustes razonables que reduzcan el desgaste.",
            recommended: false,
          },
        ],
      },
    ],
    conclusion:
      "La prevención no consiste en atribuir automáticamente el desgaste a las personas. También implica revisar las condiciones y procesos que pueden estar contribuyendo al problema.",
    takeaway:
      "Observar → investigar la condición → actuar sobre una causa identificada → dar seguimiento.",
  },
];

const iconMap = {
  comunicacion: MessageSquareMore,
  liderazgo: Users,
  prevencion: ShieldCheck,
} as const;

export default function EntrenamientoPage() {
  const { user, isLoaded } = useUser();

  const [activeTrackId, setActiveTrackId] = useState(tracks[0].id);

  const [progress, setProgress] = useState<TrainingProgress>({});

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const [saving, setSaving] = useState(false);

  const [loadingProgress, setLoadingProgress] = useState(true);

  const [saveError, setSaveError] = useState("");

  const activeTrack = useMemo(
    () =>
      tracks.find((track) => track.id === activeTrackId) ||
      tracks[0],
    [activeTrackId]
  );

  useEffect(() => {
    async function loadProgress() {
      if (!isLoaded) return;

      if (!user?.id) {
        setLoadingProgress(false);
        return;
      }

      setLoadingProgress(true);

      let data: any[] = [];

      try {
        const response = await fetch(
          "/api/progreso/entrenamiento",
          { cache: "no-store" }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }

        const json = await response.json();

        data = Array.isArray(json?.progreso)
          ? json.progreso
          : [];
      } catch (error) {
        console.error(
          "Error cargando progreso_entrenamiento:",
          error
        );

        setLoadingProgress(false);
        return;
      }

      const mapped: TrainingProgress = {};

      (data || []).forEach((row: any) => {
        mapped[row.track_id] = {
          step: Math.max(1, Number(row.station || 1)),
          completed: row.completed === true,
        };
      });

      setProgress(mapped);
      setLoadingProgress(false);
    }

    loadProgress();
  }, [isLoaded, user?.id]);

  useEffect(() => {
    setSelectedOption(null);
    setFeedbackVisible(false);
    setSaveError("");
  }, [activeTrackId]);

  async function persist(
    next: {
      step: number;
      completed: boolean;
    }
  ): Promise<boolean> {
    if (!user?.id) {
      setSaveError(
        "Necesitas iniciar sesión para guardar tu progreso."
      );

      return false;
    }

    setSaving(true);
    setSaveError("");

    let error: unknown = null;

    try {
      const response = await fetch(
        "/api/progreso/entrenamiento",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            track_id: activeTrack.id,
            station: next.step,
            completed: next.completed,
          }),
        }
      );

      if (!response.ok) {
        error = `Error HTTP ${response.status}`;
      }
    } catch (fetchError) {
      error = fetchError;
    }

    setSaving(false);

    if (error) {
      console.error(
        "Error guardando progreso_entrenamiento:",
        error
      );

      setSaveError(
        "No pudimos guardar tu progreso. Intenta nuevamente."
      );

      return false;
    }

    return true;
  }

  const currentStep =
    progress[activeTrack.id]?.step || 1;

  const scenarioIndex = Math.min(
    currentStep - 1,
    activeTrack.steps.length
  );

  const inScenario =
    currentStep <= activeTrack.steps.length;

  const inConclusion =
    currentStep > activeTrack.steps.length;

  const activeScenario = inScenario
    ? activeTrack.steps[scenarioIndex]
    : null;

  async function continueScenario() {
    const current =
      progress[activeTrack.id] || {
        step: 1,
        completed: false,
      };

    const next = {
      step: Math.min(
        activeTrack.steps.length + 1,
        current.step + 1
      ),
      completed: current.completed,
    };

    const saved = await persist(next);

    if (!saved) return;

    setProgress((prev) => ({
      ...prev,
      [activeTrack.id]: next,
    }));

    setSelectedOption(null);
    setFeedbackVisible(false);
  }

  async function markComplete() {
    const next = {
      step: activeTrack.steps.length + 1,
      completed: true,
    };

    const saved = await persist(next);

    if (!saved) return;

    setProgress((prev) => ({
      ...prev,
      [activeTrack.id]: next,
    }));
  }

  const completedCount =
    Object.values(progress).filter(
      (item) => item.completed
    ).length;

  const [vista, setVista] = useState<"lista" | "practica">("lista");

  function abrir(trackId: string) {
    setActiveTrackId(trackId);
    setVista("practica");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function repetir() {
    const next = { step: 1, completed: progress[activeTrack.id]?.completed === true };
    const saved = await persist(next);
    if (!saved) return;
    setProgress((prev) => ({ ...prev, [activeTrack.id]: next }));
    setSelectedOption(null);
    setFeedbackVisible(false);
  }

  function estadoDe(track: Track) {
    const p = progress[track.id];
    if (!p) return { texto: "Nuevo", boton: "Empezar", tono: "text-slate-400" };
    if (p.completed && p.step > track.steps.length)
      return { texto: "Completado", boton: "Repetir", tono: "text-emerald-300" };
    if (p.completed) return { texto: `Repasando · paso ${p.step} de ${track.steps.length}`, boton: "Continuar", tono: "text-cyan-300" };
    if (p.step > track.steps.length) return { texto: "Falta cerrar", boton: "Terminar", tono: "text-amber-300" };
    return { texto: `En curso · paso ${p.step} de ${track.steps.length}`, boton: "Continuar", tono: "text-cyan-300" };
  }

  const ActiveIcon =
    iconMap[activeTrack.id as keyof typeof iconMap] || Brain;

  const opcionElegida =
    activeScenario && selectedOption !== null
      ? activeScenario.options[selectedOption]
      : null;

  const opcionRecomendada = activeScenario?.options.find((o) => o.recommended) || null;

  const yaCompletado = progress[activeTrack.id]?.completed === true;

  /* =========================================================
     VISTA 1 · ELEGIR ESCENARIO
  ========================================================= */

  if (vista === "lista") {
    return (
      <main className="min-h-screen bg-[#020617] text-white">
        <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>

          <header className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <GraduationCap className="h-4 w-4" /> Práctica
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">¿Qué situación quieres practicar?</h1>
              <p className="mt-2 max-w-2xl text-slate-400">
                Elige una situación del trabajo, decide qué harías y descubre por qué una respuesta funciona mejor que otra.
              </p>
            </div>
            {!loadingProgress && (
              <p className="text-sm text-slate-400">
                Completaste <strong className="text-white">{completedCount} de {tracks.length}</strong>
              </p>
            )}
          </header>

          {saveError && (
            <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{saveError}</p>
          )}

          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {tracks.map((track) => {
              const Icono = iconMap[track.id as keyof typeof iconMap] || Brain;
              const estado = estadoDe(track);
              return (
                <li key={track.id}>
                  <button
                    type="button"
                    onClick={() => abrir(track.id)}
                    className="group flex h-full w-full flex-col rounded-2xl border border-white/10 bg-slate-900/60 p-5 text-left transition hover:border-cyan-400/40 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10">
                        <Icono className="h-5 w-5 text-cyan-300" />
                      </span>
                      <span className={`text-xs font-semibold ${estado.tono}`}>
                        {estado.texto === "Completado" && <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />}
                        {estado.texto}
                      </span>
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {track.category} · {track.duration}
                    </p>
                    <h2 className="mt-1 text-lg font-bold leading-snug">{track.title}</h2>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{track.subtitle}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 group-hover:gap-2.5 transition-all">
                      {estado.boton} <ArrowRight className="h-4 w-4" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </main>
    );
  }

  /* =========================================================
     VISTA 2 · PRACTICAR UN ESCENARIO
  ========================================================= */

  const totalPasos = activeTrack.steps.length + 1; // pasos + cierre
  const pasoActual = Math.min(currentStep, totalPasos);

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
        <button
          type="button"
          onClick={() => setVista("lista")}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Todas las situaciones
        </button>

        <header className="mt-6">
          <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
            <ActiveIcon className="h-4 w-4" /> {activeTrack.category}
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight md:text-3xl">{activeTrack.title}</h1>

          {/* Avance */}
          <ol className="mt-5 flex gap-2" aria-label={`Paso ${pasoActual} de ${totalPasos}`}>
            {Array.from({ length: totalPasos }, (_, i) => (
              <li
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i + 1 < pasoActual ? "bg-cyan-400" : i + 1 === pasoActual ? "bg-cyan-400/70" : "bg-white/10"}`}
              />
            ))}
          </ol>
          <p className="mt-2 text-xs text-slate-500">
            {inConclusion ? "Cierre" : `Paso ${pasoActual} de ${activeTrack.steps.length}`}
          </p>
        </header>

        {saveError && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{saveError}</p>
        )}

        {/* PASOS */}
        {activeScenario && (
          <section className="mt-6 space-y-5">
            {currentStep === 1 && (
              <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">La situación</p>
                <p className="mt-2 leading-relaxed text-slate-200">{activeTrack.context}</p>
              </div>
            )}

            <div>
              <p className="leading-relaxed text-slate-300">{activeScenario.situation}</p>
              <h2 className="mt-3 text-xl font-bold">{activeScenario.question}</h2>
            </div>

            <ul className="space-y-3">
              {activeScenario.options.map((option, index) => {
                const elegida = selectedOption === index;
                const mostrar = feedbackVisible && elegida;
                const borde = mostrar
                  ? option.recommended
                    ? "border-emerald-400/60 bg-emerald-500/10"
                    : "border-amber-400/60 bg-amber-500/10"
                  : elegida
                    ? "border-cyan-400/60 bg-cyan-500/10"
                    : "border-white/10 bg-slate-900/60 hover:border-white/25";
                return (
                  <li key={index}>
                    <button
                      type="button"
                      disabled={feedbackVisible}
                      onClick={() => {
                        setSelectedOption(index);
                        setFeedbackVisible(true);
                      }}
                      className={`flex w-full gap-3 rounded-2xl border p-4 text-left transition disabled:cursor-default ${borde}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="leading-relaxed">“{option.text}”</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {feedbackVisible && opcionElegida && (
              <div
                className={`rounded-2xl border p-5 ${
                  opcionElegida.recommended ? "border-emerald-400/30 bg-emerald-500/10" : "border-amber-400/30 bg-amber-500/10"
                }`}
                role="status"
              >
                <p className={`flex items-center gap-2 font-bold ${opcionElegida.recommended ? "text-emerald-300" : "text-amber-300"}`}>
                  {opcionElegida.recommended ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                  {opcionElegida.recommended ? "Buena opción" : "Hay una opción más útil"}
                </p>
                <p className="mt-2 leading-relaxed text-slate-200">{opcionElegida.feedback}</p>

                {!opcionElegida.recommended && opcionRecomendada && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-sm font-semibold text-emerald-300">La opción más útil</p>
                    <p className="mt-1 leading-relaxed text-white">“{opcionRecomendada.text}”</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-300">{opcionRecomendada.feedback}</p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={continueScenario}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {saving ? "Guardando…" : currentStep < activeTrack.steps.length ? "Siguiente paso" : "Ver el cierre"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption(null);
                      setFeedbackVisible(false);
                    }}
                    className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5"
                  >
                    Probar otra respuesta
                  </button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* CIERRE */}
        {inConclusion && (
          <section className="mt-6 space-y-5">
            <div className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-6">
              <p className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <Sparkles className="h-4 w-4" /> Lo que te llevas
              </p>
              <p className="mt-3 text-xl font-bold leading-snug">{activeTrack.takeaway}</p>
            </div>
            <p className="leading-relaxed text-slate-300">{activeTrack.conclusion}</p>

            <div className="flex flex-wrap gap-3 pt-2">
              {!yaCompletado ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={markComplete}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> {saving ? "Guardando…" : "Marcar como completado"}
                </button>
              ) : (
                <p className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 font-semibold text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Completado
                </p>
              )}
              <button
                type="button"
                disabled={saving}
                onClick={repetir}
                className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5 disabled:opacity-50"
              >
                Repetir
              </button>
              <button
                type="button"
                onClick={() => setVista("lista")}
                className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/5"
              >
                Elegir otra situación
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
