"use client";

import {
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  BookOpen,
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
} from "lucide-react";

const Avatar3D = dynamic(
  () => import("../dashboard/components/Avatar3D"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center text-sm text-slate-400">
        Preparando personaje…
      </div>
    ),
  }
);

type Avatar = "mujer" | "hombre";

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
    nombre: "Tomar un curso",
    ruta: "/psicoeducacion",
    Icono: BookOpen,
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
  const [avatar, setAvatar] = useState<Avatar>("mujer");
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

    if (opcion.ruta === "/ia") {
      setSeleccion(null);
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

  function volverAOpciones() {
    detenerVoz();
    setChatAbierto(false);
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

            <Avatar3D
              avatar={avatar}
              hablando={hablando}
            />

            <div className="mt-4 flex justify-center gap-3">
              {(["mujer", "hombre"] as Avatar[]).map(
                (tipo) => (
                  <button
                    key={tipo}
                    type="button"
                    onClick={() => {
                      detenerVoz();
                      setAvatar(tipo);
                    }}
                    className={`rounded-xl px-5 py-3 capitalize transition ${
                      avatar === tipo
                        ? "bg-cyan-400 text-slate-950"
                        : "bg-white/10 hover:bg-white/15"
                    }`}
                    aria-pressed={avatar === tipo}
                  >
                    {tipo}
                  </button>
                )
              )}
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
            ) : (
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
