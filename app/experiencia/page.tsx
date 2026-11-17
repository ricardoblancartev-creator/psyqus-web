"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import AvatarIlustrado, { type TipoAvatar } from "@/components/AvatarIlustrado";
import {
  DIMENSIONES_BIENESTAR,
  ESCALA_ASPECTO,
  dimensionPorClave,
  type ClaveDimension,
} from "@/lib/dimensiones-bienestar";
import {
  HeartPulse,
  MessageCircle,
  Wind,
  ShieldCheck,
  ClipboardList,
  Volume2,
  VolumeX,
  Send,
  Loader2,
  Play,
  ArrowLeft,
  Gamepad2,
} from "lucide-react";
import AvisoPrivacidad from "@/components/AvisoPrivacidad";

/*
  El avatar 3D (app/dashboard/components/Avatar3D.tsx) se conserva,
  pero la experiencia usa el acompañante ilustrado, con el mismo
  estilo cálido de los Shorts.
*/

const AVATARES: { tipo: TipoAvatar; texto: string }[] = [
  { tipo: "mujer", texto: "Mujer" },
  { tipo: "hombre", texto: "Hombre" },
  { tipo: "neutral", texto: "Sin género" },
];

/*
  Mapa de los 4 aspectos: la persona dice cómo está (1 a 5).
  Se guarda SOLO en su dispositivo (localStorage), no en la base.
*/
type MapaAspectos = Partial<Record<ClaveDimension, { valor: number; fecha: string }>>;
const CLAVE_MAPA = "psyqus_mapa_aspectos";

function leerMapa(): MapaAspectos {
  try {
    const crudo = window.localStorage.getItem(CLAVE_MAPA);
    return crudo ? (JSON.parse(crudo) as MapaAspectos) : {};
  } catch {
    return {};
  }
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const opciones = [
  {
    nombre: "Quiero hablar",
    ruta: "/ia",
    Icono: MessageCircle,
  },
  {
    nombre: "Jugar y aprender",
    ruta: "/psicoeducacion",
    Icono: Gamepad2,
  },
  {
    nombre: "Relajarme",
    ruta: "/mindfulness",
    Icono: Wind,
  },
  {
    nombre: "Ver Shorts",
    ruta: "/shorts",
    Icono: Play,
  },
  {
    nombre: "Cómo me siento",
    ruta: "/pulso",
    Icono: HeartPulse,
  },
  {
    nombre: "Buzón privado",
    ruta: "/buzon",
    Icono: ShieldCheck,
  },
  {
    nombre: "Evaluación NOM-035",
    ruta: "/encuesta",
    Icono: ClipboardList,
  },
];

export default function ExperienciaPage() {
  const [avatar, setAvatar] = useState<TipoAvatar>("mujer");
  const [aspecto, setAspecto] = useState<ClaveDimension | null>(null);
  const [chatAspecto, setChatAspecto] = useState<ClaveDimension | null>(null);
  const [mapa, setMapa] = useState<MapaAspectos>({});
  const [hablando, setHablando] = useState(false);
  const [voz, setVoz] = useState(false);

  const [chatAbierto, setChatAbierto] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pendiente, setPendiente] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [seleccion, setSeleccion] = useState<
    (typeof opciones)[number] | null
  >(null);

  const [mensaje, setMensaje] = useState(
    "Hola, soy tu acompañante de Psyqus. ¿Qué te gustaría hacer hoy?"
  );

  const vozRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(
    null
  );
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setMapa(leerMapa());
    try {
      const guardado = window.localStorage.getItem("psyqus_avatar");
      if (guardado === "mujer" || guardado === "hombre" || guardado === "neutral") {
        setAvatar(guardado);
      }
    } catch {
      /* sin almacenamiento local: se usa el avatar por defecto */
    }
  }, []);

  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      speechRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (chatAbierto) {
      chatEndRef.current?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [messages, pendiente, chatAbierto]);

  useEffect(() => {
    if (chatAbierto && !loading) {
      inputRef.current?.focus();
    }
  }, [chatAbierto, loading]);

  function detenerVoz() {
    speechRef.current = null;
    window.speechSynthesis?.cancel();
    setHablando(false);
  }

  function decir(texto: string) {
    detenerVoz();

    if (
      !vozRef.current ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const audio = new SpeechSynthesisUtterance(texto);

    audio.lang = "es-MX";
    audio.rate = 0.95;

    speechRef.current = audio;

    audio.onstart = () => {
      if (speechRef.current === audio) {
        setHablando(true);
      }
    };

    const terminar = () => {
      if (speechRef.current === audio) {
        speechRef.current = null;
        setHablando(false);
      }
    };

    audio.onend = terminar;
    audio.onerror = terminar;

    window.speechSynthesis.speak(audio);
  }

  function alternarVoz() {
    detenerVoz();

    vozRef.current = !vozRef.current;
    setVoz(vozRef.current);

    if (vozRef.current && !loading) {
      decir(mensaje);
    }
  }

  function elegir(opcion: (typeof opciones)[number]) {
    if (requestRef.current) return;

    setError("");

    setAspecto(null);

    if (opcion.ruta === "/ia") {
      setSeleccion(null);
      setChatAspecto(null);
      setChatAbierto(true);

      const texto = messages.length
        ? "Podemos continuar nuestra conversación aquí."
        : "Cuéntame qué está pasando. Podemos hablar aquí mismo.";

      setMensaje(texto);
      decir(texto);
      return;
    }

    setChatAbierto(false);
    setSeleccion(opcion);

    const texto = `Vamos a ${opcion.nombre.toLowerCase()}. Presiona continuar cuando estés listo.`;

    setMensaje(texto);
    decir(texto);
  }

  function elegirAspecto(clave: ClaveDimension) {
    if (requestRef.current) return;
    const d = dimensionPorClave(clave);
    if (!d) return;
    setChatAbierto(false);
    setSeleccion(null);
    setError("");
    setAspecto(clave);
    const texto = `${d.nombre}: ${d.abarca} Cuéntame, ¿cómo estás en este aspecto?`;
    setMensaje(texto);
    decir(texto);
  }

  function calificarAspecto(clave: ClaveDimension, valor: number) {
    const nuevo: MapaAspectos = {
      ...mapa,
      [clave]: { valor, fecha: new Date().toISOString() },
    };
    setMapa(nuevo);
    try {
      window.localStorage.setItem(CLAVE_MAPA, JSON.stringify(nuevo));
    } catch {
      /* sin almacenamiento local: el mapa vive solo en esta visita */
    }
  }

  /** Abre el chat enfocado en un aspecto; el acompañante hace la pregunta elegida. */
  function platicarAspecto(clave: ClaveDimension, pregunta?: string) {
    const d = dimensionPorClave(clave);
    if (!d || requestRef.current) return;
    const primera = pregunta ?? d.preguntas[0];
    const texto = `Hablemos de tu aspecto ${d.nombre.toLowerCase()}. ${primera}`;
    setAspecto(null);
    setSeleccion(null);
    setError("");
    setChatAspecto(clave);
    setMessages([{ role: "assistant", content: texto }]);
    setChatAbierto(true);
    setMensaje(texto);
    decir(texto);
  }

  function volverAOpciones() {
    detenerVoz();
    setChatAbierto(false);
    setAspecto(null);
    setSeleccion(null);
    setError("");
    setMensaje("¿Qué te gustaría hacer ahora?");
  }

  async function enviar(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const texto = input.trim();

    if (!texto || requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;

    const nuevos: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: texto,
      },
    ];

    detenerVoz();
    setLoading(true);
    setError("");
    setInput("");
    setPendiente(texto);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: nuevos.slice(-16),
          mode: "avatar",
          aspecto: chatAspecto ?? undefined,
        }),
        signal: controller.signal,
      });

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error === "AI_NOT_CONFIGURED"
            ? "El orientador aún no está configurado. Intenta más tarde."
            : "No pude obtener una respuesta. Intenta enviar tu mensaje de nuevo."
        );
      }

      if (
        typeof data?.reply !== "string" ||
        !data.reply.trim()
      ) {
        throw new Error(
          "La respuesta llegó vacía. Intenta enviar tu mensaje de nuevo."
        );
      }

      if (controller.signal.aborted) return;

      const reply = data.reply.trim();

      setMessages([
        ...nuevos,
        {
          role: "assistant",
          content: reply,
        },
      ]);

      setMensaje(reply);
      decir(reply);
    } catch (err) {
      if (controller.signal.aborted) return;

      setInput(texto);

      setError(
        err instanceof Error
          ? err.message
          : "No fue posible conectar. Intenta de nuevo."
      );
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = null;
        setPendiente("");
        setLoading(false);
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] p-5 text-white md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs tracking-widest text-cyan-400">
              PSYQUS
            </p>

            <h1 className="mt-2 text-2xl font-bold md:text-3xl">
              Tu espacio de bienestar
            </h1>
          </div>

          <Link
            href="/dashboard"
            className="shrink-0 rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
          >
            Volver
          </Link>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-cyan-950 to-slate-950 p-4 text-center md:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                {hablando
                  ? "Hablando contigo"
                  : loading
                    ? "Preparando respuesta"
                    : "Tu acompañante"}
              </p>

              <button
                type="button"
                onClick={alternarVoz}
                className="rounded-xl bg-white/10 p-3 transition hover:bg-white/15"
                aria-label={
                  voz
                    ? "Desactivar voz"
                    : "Activar voz"
                }
                aria-pressed={voz}
              >
                {voz ? (
                  <Volume2 className="h-5 w-5" />
                ) : (
                  <VolumeX className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="mt-4">
              <AvatarIlustrado
                avatar={avatar}
                hablando={hablando}
                valores={Object.fromEntries(
                  Object.entries(mapa).map(([k, v]) => [k, v?.valor ?? null])
                )}
                seleccionada={aspecto ?? chatAspecto}
                onElegir={elegirAspecto}
              />
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2" role="group" aria-label="Elige cómo se ve tu acompañante">
              {AVATARES.map(({ tipo, texto }) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => {
                    detenerVoz();
                    setAvatar(tipo);
                    try {
                      window.localStorage.setItem("psyqus_avatar", tipo);
                    } catch {
                      /* sin almacenamiento local */
                    }
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm transition ${
                    avatar === tipo
                      ? "bg-cyan-400 font-semibold text-slate-950"
                      : "bg-white/10 hover:bg-white/15"
                  }`}
                  aria-pressed={avatar === tipo}
                >
                  {texto}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs text-slate-400">
              {voz
                ? "Voz activada"
                : "Activa la bocina para escuchar las respuestas"}
            </p>
          </section>

          <section className="min-w-0 rounded-3xl border border-white/10 bg-slate-900/70 p-5 md:p-6">
            <div className="mb-6 rounded-2xl bg-cyan-400/10 p-5">
              <p className="mb-2 text-xs text-cyan-300">
                TU ACOMPAÑANTE
              </p>

              <p
                aria-live="polite"
                className="whitespace-pre-wrap break-words text-base leading-relaxed"
              >
                {loading
                  ? "Estoy preparando tu respuesta…"
                  : chatAbierto && messages.length > 0
                    ? "Sigamos conversando. Puedes escribir abajo."
                    : mensaje}
              </p>
            </div>

            {chatAbierto ? (
              <div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={volverAOpciones}
                  className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-300 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ver opciones
                </button>

                {chatAspecto && (
                  <p className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    Revisando:
                    <span
                      className="rounded-full px-3 py-1 font-semibold text-slate-950"
                      style={{ background: dimensionPorClave(chatAspecto)?.color }}
                    >
                      {dimensionPorClave(chatAspecto)?.nombre}
                    </span>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => elegirAspecto(chatAspecto)}
                      className="text-cyan-300 underline-offset-2 hover:underline disabled:opacity-50"
                    >
                      Calificar este aspecto
                    </button>
                  </p>
                )}

                <div
                  role="log"
                  aria-label="Conversación con Psyqus"
                  className="mb-4 max-h-80 space-y-3 overflow-y-auto"
                >
                  {messages.map((item, index) => (
                    <div
                      key={index}
                      className={`rounded-2xl p-4 ${
                        item.role === "user"
                          ? "ml-6 bg-white/5"
                          : "mr-6 bg-cyan-400/10"
                      }`}
                    >
                      <p className="mb-1 text-xs text-slate-400">
                        {item.role === "user"
                          ? "Tú"
                          : "Psyqus"}
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}

                  {pendiente && (
                    <div className="ml-6 rounded-2xl bg-white/5 p-4">
                      <p className="mb-1 text-xs text-slate-400">
                        Tú
                      </p>

                      <p className="whitespace-pre-wrap break-words text-sm">
                        {pendiente}
                      </p>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {error && (
                  <p
                    role="alert"
                    className="mb-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-200"
                  >
                    {error}
                  </p>
                )}

                <AvisoPrivacidad variante="chat" className="mb-3" />

                <form
                  onSubmit={enviar}
                  className="space-y-3"
                >
                  <label
                    htmlFor="mensaje-psyqus"
                    className="text-sm text-slate-300"
                  >
                    Tu mensaje
                  </label>

                  <textarea
                    ref={inputRef}
                    id="mensaje-psyqus"
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    disabled={loading}
                    maxLength={4000}
                    rows={3}
                    placeholder="Cuéntame qué está pasando…"
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();

                        event.currentTarget.form?.requestSubmit();
                      }
                    }}
                    className="w-full resize-none rounded-2xl border border-white/15 bg-slate-950/70 p-4 text-sm focus:border-cyan-400 focus:outline-none disabled:opacity-50"
                  />

                  <button
                    type="submit"
                    disabled={
                      loading || !input.trim()
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 p-3 font-bold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}

                    {loading
                      ? "Preparando respuesta…"
                      : "Enviar"}
                  </button>
                </form>
              </div>
            ) : aspecto ? (
              <PanelAspecto
                clave={aspecto}
                valor={mapa[aspecto]?.valor ?? null}
                onCalificar={(v) => calificarAspecto(aspecto, v)}
                onPlaticar={(pregunta) => platicarAspecto(aspecto, pregunta)}
                onVolver={volverAOpciones}
              />
            ) : (
              <>
              <MapaBienestar mapa={mapa} onElegir={elegirAspecto} />
              <div className="grid grid-cols-2 gap-3">
                {opciones.map((opcion) => {
                  const Icono = opcion.Icono;

                  return (
                    <button
                      key={opcion.ruta}
                      type="button"
                      onClick={() => elegir(opcion)}
                      className="min-h-24 rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-400/5"
                    >
                      <Icono className="mb-3 h-5 w-5 text-cyan-300" />

                      <span className="text-sm">
                        {opcion.nombre}
                      </span>
                    </button>
                  );
                })}
              </div>
              </>
            )}

            {seleccion && !chatAbierto && (
              <Link
                href={seleccion.ruta}
                className="mt-6 block rounded-xl bg-cyan-400 p-4 text-center font-bold text-slate-950 transition hover:bg-cyan-300"
              >
                Continuar a {seleccion.nombre}
              </Link>
            )}

            <p className="mt-6 text-xs leading-relaxed text-slate-400">
              Este acompañante no sustituye atención
              profesional ni modifica las evaluaciones
              oficiales.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   MAPA DE LOS 4 ASPECTOS
========================================================= */

function MapaBienestar({
  mapa,
  onElegir,
}: {
  mapa: MapaAspectos;
  onElegir: (clave: ClaveDimension) => void;
}) {
  const revisados = DIMENSIONES_BIENESTAR.filter((d) => mapa[d.clave]).length;

  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold">Tu mapa de bienestar</p>
        <p className="text-xs text-slate-400">{revisados} de 4 aspectos</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {DIMENSIONES_BIENESTAR.map((d) => {
          const v = mapa[d.clave]?.valor ?? null;
          return (
            <button
              key={d.clave}
              type="button"
              onClick={() => onElegir(d.clave)}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-left transition hover:bg-white/10"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: d.color }}>
                  {d.nombre}
                </span>
                <span className="text-xs tabular-nums text-slate-300">{v ? `${v}/5` : "Sin revisar"}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full" style={{ width: `${((v ?? 0) / 5) * 100}%`, background: d.color }} />
              </div>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        {revisados < 4
          ? "Toca cada aspecto (o su círculo) para ver cómo estás. Se guarda solo en este dispositivo."
          : "Ya revisaste los 4 aspectos. Puedes volver a calificarlos cuando quieras. Se guarda solo en este dispositivo."}
      </p>
    </div>
  );
}

/* =========================================================
   PANEL DE UN ASPECTO
========================================================= */

function PanelAspecto({
  clave,
  valor,
  onCalificar,
  onPlaticar,
  onVolver,
}: {
  clave: ClaveDimension;
  valor: number | null;
  onCalificar: (valor: number) => void;
  onPlaticar: (pregunta?: string) => void;
  onVolver: () => void;
}) {
  const d = dimensionPorClave(clave);
  if (!d) return null;

  return (
    <div>
      <button type="button" onClick={onVolver} className="mb-4 inline-flex items-center gap-2 text-sm text-cyan-300">
        <ArrowLeft className="h-4 w-4" />
        Ver opciones
      </button>

      <div className="rounded-2xl border p-5" style={{ borderColor: `${d.color}55`, background: `${d.color}12` }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: d.color }}>
          Aspecto
        </p>
        <h2 className="mt-1 text-2xl font-bold">{d.nombre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-200">
          <span className="font-semibold">Abarca: </span>
          {d.abarca}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {d.ejemplos.map((e) => (
            <span key={e} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
              {e}
            </span>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm font-semibold">¿Cómo estás hoy en este aspecto?</p>
      <div className="mt-2 grid grid-cols-5 gap-2" role="radiogroup" aria-label={`Cómo estás en lo ${d.nombre.toLowerCase()}`}>
        {ESCALA_ASPECTO.map((o) => (
          <button
            key={o.valor}
            type="button"
            role="radio"
            aria-checked={valor === o.valor}
            onClick={() => onCalificar(o.valor)}
            className={`rounded-xl px-1 py-3 text-center text-xs transition ${
              valor === o.valor ? "font-bold text-slate-950" : "bg-white/5 text-slate-300 hover:bg-white/10"
            }`}
            style={valor === o.valor ? { background: d.color } : undefined}
          >
            <span className="block text-lg font-bold">{o.valor}</span>
            {o.texto}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm font-semibold">Cuéntame cómo estás: elige una pregunta</p>
      <div className="mt-2 space-y-2">
        {d.preguntas.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPlaticar(p)}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm transition hover:border-cyan-400 hover:bg-cyan-400/5"
          >
            <MessageCircle className="h-4 w-4 shrink-0" style={{ color: d.color }} />
            {p}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPlaticar()}
        className="mt-4 w-full rounded-xl bg-cyan-400 p-3 font-bold text-slate-950 transition hover:bg-cyan-300"
      >
        Platicarlo con el acompañante
      </button>
    </div>
  );
}
