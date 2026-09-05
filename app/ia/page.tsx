"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  HeartHandshake,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Wind,
} from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type Starter = {
  label: string;
  prompt: string;
};

const starters: Starter[] = [
  {
    label: "Estoy muy saturado",
    prompt:
      "Estoy muy saturado por el trabajo. Ayúdame a ordenar qué puedo hacer ahora.",
  },
  {
    label: "No dejo de pensar en algo",
    prompt:
      "Hay una situación del trabajo a la que sigo dándole vueltas. Ayúdame a ordenarla.",
  },
  {
    label: "Tuve un conflicto",
    prompt:
      "Tuve un conflicto en el trabajo y quiero pensar cómo abordarlo de manera más clara.",
  },
  {
    label: "Necesito concentrarme",
    prompt:
      "Me está costando concentrarme. Ayúdame a recuperar el enfoque para continuar con mi trabajo.",
  },
];

const initialMessage: ChatMessage = {
  role: "assistant",
  content:
    "Hola. Soy el Orientador de bienestar de Psyqus. Puedo ayudarte a ordenar una situación, encontrar una herramienta práctica o pensar cuál podría ser tu siguiente paso. ¿Qué está pasando hoy?",
};

export default function IAPage() {
  const { user } = useUser();

  const [messages, setMessages] = useState<ChatMessage[]>([
    initialMessage,
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [saveWarning, setSaveWarning] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(clean: string) {
    if (!clean || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: clean,
      },
    ];

    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setChatError("");
    setSaveWarning("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "orientador_bienestar",
          messages: nextMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Error HTTP ${response.status}`
        );
      }

      const data = await response.json();

      if (
        !data ||
        typeof data.reply !== "string" ||
        !data.reply.trim()
      ) {
        throw new Error(
          "La API no devolvió una respuesta válida."
        );
      }

      const reply = data.reply.trim();

      const updatedMessages: ChatMessage[] = [
        ...nextMessages,
        {
          role: "assistant",
          content: reply,
        },
      ];

      setMessages(updatedMessages);

      if (user?.id) {
        const { error } = await supabase
          .from("interacciones_psyqus")
          .insert([
            {
              user_id: user.id,
              tipo: "ia",
              mensaje: clean,
              respuesta: reply,
              resumen_riesgo: null,
            },
          ]);

        if (error) {
          console.error(
            "No se pudo guardar la interacción:",
            error
          );

          setSaveWarning(
            "La conversación funcionó, pero esta interacción no pudo registrarse en Psyqus."
          );
        }
      }
    } catch (error) {
      console.error("Error en Orientador Psyqus:", error);

      setChatError(
        "El Orientador no pudo responder en este momento. Tu mensaje no recibió una respuesta de IA."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();

    const clean = input.trim();

    if (!clean) return;

    await sendMessage(clean);
  }

  function resetConversation() {
    if (loading) return;

    setMessages([initialMessage]);
    setInput("");
    setChatError("");
    setSaveWarning("");
  }

  const hasConversation = messages.length > 1;

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.11),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.11),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-7 md:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-7"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-fuchsia-300/80 font-semibold">
            <Sparkles className="w-4 h-4" />
            Psyqus · Orientación
          </div>

          <h1 className="mt-4 text-4xl md:text-6xl font-black tracking-tight">
            Orientador de{" "}
            <span className="text-fuchsia-300">
              bienestar
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-lg text-slate-300 leading-relaxed">
            Un espacio para ordenar lo que está pasando,
            explorar alternativas y encontrar herramientas
            útiles dentro de Psyqus.
          </p>
        </header>

        <div className="grid lg:grid-cols-[0.68fr_1.32fr] gap-6">
          <aside className="space-y-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="w-11 h-11 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-fuchsia-300" />
              </div>

              <h2 className="mt-4 text-lg font-black">
                ¿Para qué sirve?
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Puede ayudarte a ordenar una situación,
                preparar una conversación, comprender
                conceptos generales de bienestar y encontrar
                un siguiente paso práctico.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />

                <h2 className="font-black">
                  Sus límites
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">
                <p>
                  No realiza diagnósticos psicológicos o
                  médicos.
                </p>

                <p>
                  No sustituye psicoterapia, atención médica
                  ni una evaluación profesional.
                </p>

                <p>
                  No es un servicio de emergencias.
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-cyan-400/15 bg-cyan-500/[0.05] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                También puedes
              </p>

              <div className="mt-4 space-y-2">
                <Link
                  href="/mindfulness"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 hover:bg-white/[0.07] transition"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <Wind className="w-4 h-4 text-cyan-300" />
                    Usar una herramienta rápida
                  </span>

                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/psicoeducacion"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 hover:bg-white/[0.07] transition"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <BookOpen className="w-4 h-4 text-cyan-300" />
                    Aprender algo práctico
                  </span>

                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>

                <Link
                  href="/entrenamiento"
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 hover:bg-white/[0.07] transition"
                >
                  <span className="flex items-center gap-3 text-sm font-semibold">
                    <HeartHandshake className="w-4 h-4 text-cyan-300" />
                    Practicar una situación
                  </span>

                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </Link>
              </div>
            </div>
          </aside>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 backdrop-blur-xl overflow-hidden">
            <div className="border-b border-white/10 p-5 md:p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl border border-fuchsia-400/20 bg-fuchsia-500/10 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-fuchsia-300" />
                  </div>

                  <span className="absolute -right-1 -bottom-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950" />
                </div>

                <div>
                  <p className="font-black">
                    Orientador Psyqus
                  </p>

                  <p className="text-xs text-slate-500">
                    Orientación general con IA
                  </p>
                </div>
              </div>

              {hasConversation && (
                <button
                  type="button"
                  onClick={resetConversation}
                  disabled={loading}
                  className="text-xs font-semibold text-slate-500 hover:text-white transition disabled:opacity-50"
                >
                  Nueva conversación
                </button>
              )}
            </div>

            <div className="h-[480px] md:h-[540px] overflow-y-auto p-5 md:p-6">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const assistant =
                    message.role === "assistant";

                  return (
                    <div
                      key={`${message.role}-${index}`}
                      className={`flex ${
                        assistant
                          ? "justify-start"
                          : "justify-end"
                      }`}
                    >
                      <div
                        className={`max-w-[88%] md:max-w-[78%] rounded-2xl px-4 py-3 ${
                          assistant
                            ? "border border-fuchsia-400/15 bg-fuchsia-500/[0.08]"
                            : "border border-cyan-400/15 bg-cyan-500/[0.09]"
                        }`}
                      >
                        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">
                          {assistant
                            ? "Psyqus"
                            : "Tú"}
                        </p>

                        <p className="text-sm md:text-[15px] leading-relaxed text-slate-100 whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-fuchsia-400/15 bg-fuchsia-500/[0.08] px-4 py-3">
                      <Loader2 className="w-4 h-4 text-fuchsia-300 animate-spin" />

                      <span className="text-sm text-slate-400">
                        Pensando...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            {!hasConversation && (
              <div className="border-t border-white/10 px-5 md:px-6 pt-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mb-3">
                  Puedes empezar por aquí
                </p>

                <div className="flex flex-wrap gap-2">
                  {starters.map((starter) => (
                    <button
                      type="button"
                      key={starter.label}
                      onClick={() =>
                        sendMessage(starter.prompt)
                      }
                      disabled={loading}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-slate-300 hover:border-fuchsia-400/20 hover:bg-fuchsia-500/10 hover:text-white transition disabled:opacity-50"
                    >
                      {starter.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatError && (
              <div className="mx-5 md:mx-6 mt-4 rounded-xl border border-red-400/20 bg-red-500/10 p-3">
                <p className="text-sm text-red-200">
                  {chatError}
                </p>
              </div>
            )}

            {saveWarning && (
              <div className="mx-5 md:mx-6 mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-200">
                  {saveWarning}
                </p>
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="p-5 md:p-6"
            >
              <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-2 focus-within:border-fuchsia-400/30 transition">
                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      const clean = input.trim();

                      if (clean) {
                        void sendMessage(clean);
                      }
                    }
                  }}
                  rows={2}
                  disabled={loading}
                  placeholder="Cuéntame qué está pasando..."
                  className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none disabled:opacity-60"
                />

                <button
                  type="submit"
                  disabled={
                    loading || !input.trim()
                  }
                  aria-label="Enviar mensaje"
                  className="w-11 h-11 rounded-xl bg-fuchsia-400 flex items-center justify-center text-slate-950 hover:bg-fuchsia-300 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-600">
                La IA puede equivocarse. No utilices este
                espacio como sustituto de atención profesional
                o de servicios de emergencia.
              </p>
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
