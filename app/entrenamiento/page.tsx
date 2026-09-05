"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
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

      const { data, error } = await supabase
        .from("progreso_entrenamiento")
        .select("track_id, station, completed")
        .eq("user_id", user.id);

      if (error) {
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

    const { error } = await supabase
      .from("progreso_entrenamiento")
      .upsert(
        {
          user_id: user.id,
          track_id: activeTrack.id,
          station: next.step,
          started: true,
          completed: next.completed,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,track_id",
        }
      );

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

  const percentage =
    tracks.length > 0
      ? Math.round(
          (completedCount / tracks.length) * 100
        )
      : 0;

  const ActiveIcon =
    iconMap[
      activeTrack.id as keyof typeof iconMap
    ] || Brain;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_26%)]" />

      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-7 md:py-10">

        <div className="mb-5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Inicio
          </Link>
        </div>

        <header className="rounded-[2rem] border border-white/10 bg-slate-950/65 backdrop-blur-xl p-6 md:p-8 mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div className="flex items-start gap-4">

              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-cyan-300" />
              </div>

              <div>
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold mb-2">
                  Psyqus · Práctica
                </p>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Simulador laboral
                </h1>

                <p className="mt-3 text-slate-300 max-w-3xl leading-relaxed">
                  Practica decisiones difíciles en situaciones
                  laborales antes de enfrentarlas en la vida real.
                </p>
              </div>

            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 min-w-[220px]">

              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80">
                Escenarios completados
              </p>

              {loadingProgress ? (
                <p className="mt-2 text-sm text-slate-400">
                  Cargando...
                </p>
              ) : (
                <>
                  <div className="mt-2 flex items-end justify-between gap-3">
                    <p className="text-3xl font-black text-emerald-300">
                      {completedCount}/{tracks.length}
                    </p>

                    <p className="text-sm font-bold text-emerald-200">
                      {percentage}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-950/60 overflow-hidden">
                    <div
                      className="h-full bg-emerald-300 rounded-full transition-all duration-500"
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

        {saveError && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-200">
              {saveError}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-6">

          <div>

            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Escenarios disponibles
            </p>

            <h2 className="mt-1 mb-5 text-2xl font-black">
              ¿Qué quieres practicar?
            </h2>

            <div className="space-y-3">

              {tracks.map((track) => {
                const Icon =
                  iconMap[
                    track.id as keyof typeof iconMap
                  ] || Brain;

                const active =
                  activeTrackId === track.id;

                const completed =
                  progress[track.id]?.completed;

                return (
                  <button
                    type="button"
                    key={track.id}
                    onClick={() =>
                      setActiveTrackId(track.id)
                    }
                    className={`w-full text-left rounded-[1.5rem] border p-5 transition ${
                      active
                        ? "border-cyan-400/30 bg-cyan-500/10 shadow-[0_0_35px_rgba(34,211,238,0.07)]"
                        : "border-white/10 bg-slate-950/55 hover:border-white/20 hover:bg-white/[0.035]"
                    }`}
                  >

                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-cyan-300" />
                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
                              {track.category}
                            </p>

                            <h3 className="mt-1 text-lg font-black text-white leading-tight">
                              {track.title}
                            </h3>
                          </div>

                          {completed && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                          )}

                        </div>

                        <p className="mt-2 text-sm leading-relaxed text-slate-400">
                          {track.subtitle}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          {track.duration}
                        </p>

                      </div>

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

          <div className="space-y-5">

            <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6 md:p-7">

              <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <ActiveIcon className="w-6 h-6 text-cyan-300" />
                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
                    {activeTrack.category}
                  </p>

                  <h2 className="mt-2 text-2xl md:text-3xl font-black">
                    {activeTrack.title}
                  </h2>

                  <p className="mt-3 text-slate-300 leading-relaxed">
                    {activeTrack.context}
                  </p>

                </div>

              </div>

            </section>

            {inScenario && activeScenario && (
              <section className="rounded-[1.75rem] border border-fuchsia-400/15 bg-slate-950/65 p-6">

                <div className="flex items-center justify-between gap-4 mb-5">

                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300/70">
                      Escena {currentStep} de {activeTrack.steps.length}
                    </p>

                    <h3 className="mt-1 text-xl font-black">
                      ¿Qué harías?
                    </h3>
                  </div>

                  <AlertTriangle className="w-5 h-5 text-fuchsia-300" />

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">

                  <p className="text-slate-200 leading-relaxed">
                    {activeScenario.situation}
                  </p>

                </div>

                <p className="mt-6 font-black text-lg">
                  {activeScenario.question}
                </p>

                <div className="mt-4 grid gap-3">

                  {activeScenario.options.map(
                    (option, index) => (
                      <button
                        type="button"
                        key={`${activeTrack.id}-${currentStep}-${index}`}
                        onClick={() => {
                          setSelectedOption(index);
                          setFeedbackVisible(false);
                        }}
                        className={`rounded-2xl border p-4 text-left transition ${
                          selectedOption === index
                            ? "border-cyan-400/40 bg-cyan-500/10"
                            : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-sm md:text-base text-white leading-relaxed">
                          {option.text}
                        </span>
                      </button>
                    )
                  )}

                </div>

                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={() =>
                    setFeedbackVisible(true)
                  }
                  className="mt-5 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 font-bold text-cyan-300 hover:bg-cyan-500/20 transition disabled:opacity-40"
                >
                  Ver qué podría pasar
                </button>

                {feedbackVisible &&
                  selectedOption !== null && (
                    <div
                      className={`mt-5 rounded-2xl border p-5 ${
                        activeScenario.options[
                          selectedOption
                        ].recommended
                          ? "border-emerald-400/20 bg-emerald-500/10"
                          : "border-amber-400/20 bg-amber-500/10"
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        {activeScenario.options[
                          selectedOption
                        ].recommended ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                        ) : (
                          <Brain className="w-5 h-5 text-amber-300" />
                        )}

                        <p className="font-black">
                          {activeScenario.options[
                            selectedOption
                          ].recommended
                            ? "Respuesta más constructiva"
                            : "Hay una alternativa más útil"}
                        </p>

                      </div>

                      <p className="mt-3 text-sm md:text-base text-slate-200 leading-relaxed">
                        {
                          activeScenario.options[
                            selectedOption
                          ].feedback
                        }
                      </p>

                      <button
                        type="button"
                        disabled={saving}
                        onClick={continueScenario}
                        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
                      >
                        {saving
                          ? "Guardando..."
                          : currentStep <
                            activeTrack.steps.length
                          ? "Continuar escenario"
                          : "Ver cierre"}

                        <ArrowRight className="w-4 h-4" />
                      </button>

                    </div>
                  )}

              </section>
            )}

            {inConclusion && (
              <>
                <section className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/[0.07] p-6">

                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-300" />

                    <h3 className="text-xl font-black">
                      Cierre del escenario
                    </h3>
                  </div>

                  <p className="mt-4 text-slate-200 leading-relaxed">
                    {activeTrack.conclusion}
                  </p>

                  <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-slate-950/30 p-4">

                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                      Idea para llevarte
                    </p>

                    <p className="mt-2 font-black text-emerald-100">
                      {activeTrack.takeaway}
                    </p>

                  </div>

                </section>

                <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 p-6">

                  {progress[
                    activeTrack.id
                  ]?.completed ? (
                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-full border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-300" />
                      </div>

                      <div>
                        <p className="font-black text-emerald-300">
                          Escenario completado
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          Tu progreso está registrado en Psyqus.
                        </p>
                      </div>

                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-black">
                        Terminaste la práctica
                      </h3>

                      <p className="mt-2 text-sm text-slate-400">
                        Guarda este escenario como completado.
                      </p>

                      <button
                        type="button"
                        onClick={markComplete}
                        disabled={saving}
                        className="mt-5 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-slate-950 hover:bg-emerald-300 transition disabled:opacity-50"
                      >
                        {saving
                          ? "Guardando..."
                          : "Completar escenario"}
                      </button>
                    </>
                  )}

                </section>
              </>
            )}

          </div>

        </div>

      </section>

    </main>
  );
}
