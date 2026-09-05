"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  Info,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function BuzonPage() {
  const { user } = useUser();

  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const clean = mensaje.trim();

    if (!clean || loading) {
      if (!clean) {
        setError("Escribe un mensaje antes de enviarlo.");
      }

      return;
    }

    setLoading(true);
    setError("");
    setDone(false);

    try {
      if (!user?.id) {
        setError(
          "No pudimos identificar tu sesión. Vuelve a iniciar sesión e inténtalo de nuevo."
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("interacciones_psyqus")
        .insert([
          {
            user_id: user.id,
            tipo: "buzon",
            mensaje: clean,
            respuesta: null,
            resumen_riesgo: null,
          },
        ]);

      if (insertError) {
        console.error(
          "Error Supabase en Pedir ayuda:",
          insertError
        );

        setError(
          "No pudimos enviar tu mensaje en este momento. Inténtalo nuevamente."
        );

        return;
      }

      setMensaje("");
      setDone(true);
    } catch (err) {
      console.error(
        "Error general en Pedir ayuda:",
        err
      );

      setError(
        "Ocurrió un error al enviar tu mensaje. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.10),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-5xl mx-auto px-5 md:px-6 py-7 md:py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>

        <header className="max-w-3xl mb-9">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-amber-300 font-semibold">
            <HeartHandshake className="w-4 h-4" />
            Psyqus · Apoyo humano
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Pedir
            <span className="text-amber-300"> ayuda</span>
          </h1>

          <p className="mt-5 text-lg md:text-xl text-slate-300 leading-relaxed">
            Si prefieres comunicar una situación a una persona
            en lugar de hablar con la IA, puedes dejar aquí tu mensaje.
          </p>
        </header>

        <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-6">
          <aside className="space-y-4">
            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="w-11 h-11 rounded-xl border border-amber-400/20 bg-amber-500/10 flex items-center justify-center">
                <UserRound className="w-5 h-5 text-amber-300" />
              </div>

              <h2 className="mt-4 text-lg font-black">
                Este canal no es IA
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Tu mensaje queda registrado como una solicitud
                de apoyo dentro de Psyqus para su revisión humana.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />

                <h2 className="font-black">
                  Importante
                </h2>
              </div>

              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-400">
                <p>
                  Este espacio no es un servicio de emergencias.
                </p>

                <p>
                  No garantiza una respuesta inmediata.
                </p>

                <p>
                  No compartas información que no sea necesaria
                  para explicar la situación.
                </p>
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-cyan-400/15 bg-cyan-500/[0.05] p-5">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />

                <p className="text-sm leading-relaxed text-slate-400">
                  Si existe peligro inmediato para ti o para otra
                  persona, busca ayuda presencial o servicios de
                  emergencia de tu localidad.
                </p>
              </div>
            </div>
          </aside>

          <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/65 backdrop-blur-xl overflow-hidden">
            <div className="border-b border-white/10 p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border border-amber-400/20 bg-amber-500/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-amber-300" />
                </div>

                <div>
                  <h2 className="text-xl md:text-2xl font-black">
                    Cuéntanos qué está pasando
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Escribe únicamente lo que consideres necesario.
                  </p>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-7"
            >
              <label
                htmlFor="mensaje-ayuda"
                className="text-sm font-semibold text-slate-300"
              >
                Tu mensaje
              </label>

              <textarea
                id="mensaje-ayuda"
                value={mensaje}
                onChange={(event) => {
                  setMensaje(event.target.value);

                  if (error) {
                    setError("");
                  }

                  if (done) {
                    setDone(false);
                  }
                }}
                rows={10}
                maxLength={3000}
                disabled={loading}
                placeholder="Describe brevemente la situación o el tipo de apoyo que necesitas..."
                className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400/30 resize-none disabled:opacity-60"
              />

              <div className="mt-2 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-600">
                  Máximo 3000 caracteres
                </p>

                <p className="text-xs text-slate-600">
                  {mensaje.length}/3000
                </p>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4">
                  <p className="text-sm text-red-200">
                    {error}
                  </p>
                </div>
              )}

              {done && (
                <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />

                    <div>
                      <p className="font-bold text-emerald-200">
                        Mensaje enviado
                      </p>

                      <p className="mt-1 text-sm leading-relaxed text-slate-300">
                        Tu solicitud quedó registrada correctamente
                        en Psyqus.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  loading || !mensaje.trim()
                }
                className="mt-6 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 font-black text-slate-950 hover:bg-amber-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading
                  ? "Enviando..."
                  : "Enviar solicitud"}
              </button>
            </form>
          </section>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5">
          <p className="text-sm leading-relaxed text-slate-500">
            Psyqus distingue este canal del Orientador de bienestar:
            aquí no se genera una respuesta automática con inteligencia
            artificial.
          </p>
        </div>
      </section>
    </main>
  );
}
