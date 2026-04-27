"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Brain, Send, Sparkles } from "lucide-react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function IAPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola. Soy el asistente de Psyqus. Puedes contarme cómo te sientes en el trabajo y trataré de orientarte con respeto y claridad.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const clean = input.trim();
    if (!clean || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "ia_general",
          messages: nextMessages,
        }),
      });

      const data = await res.json();
      const reply =
        typeof data?.reply === "string"
          ? data.reply
          : "No pude responder en este momento.";

      const updatedMessages: ChatMessage[] = [
        ...nextMessages,
        { role: "assistant", content: reply },
      ];

      setMessages(updatedMessages);

      await supabase.from("interacciones_psyqus").insert([
        {
          user_id: user?.id ?? null,
          tipo: "ia",
          mensaje: clean,
          respuesta: reply,
          resumen_riesgo: "pendiente_revision",
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Ocurrió un error al responder. Intenta otra vez en un momento.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.10),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-400/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-fuchsia-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-fuchsia-300/80 font-semibold mb-2">
                Psyqus AI Layer
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Asistente IA
              </h1>
              <p className="mt-3 text-slate-300 max-w-3xl">
                Este espacio sí responde. Además, lo relevante puede ser revisado
                por el panel del psicólogo.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center gap-3 mb-5">
            <Brain className="w-5 h-5 text-fuchsia-300" />
            <h2 className="text-2xl font-bold">Conversación</h2>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
            {messages.map((message, idx) => (
              <div
                key={`${message.role}-${idx}`}
                className={`rounded-2xl p-4 border ${
                  message.role === "assistant"
                    ? "border-fuchsia-400/20 bg-fuchsia-500/10"
                    : "border-cyan-400/20 bg-cyan-500/10"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.24em] mb-2 text-slate-300">
                  {message.role === "assistant" ? "Psyqus IA" : "Tú"}
                </p>
                <p className="text-sm leading-relaxed text-white">{message.content}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="mt-6 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe cómo te sientes o qué está pasando..."
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-400/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-5 py-3 font-bold text-black hover:bg-fuchsia-400 transition disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {loading ? "..." : "Enviar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}