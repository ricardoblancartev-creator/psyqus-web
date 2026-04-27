"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Mail, Send, Shield } from "lucide-react";

export default function BuzonPage() {
  const { user } = useUser();
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDone(false);

    try {
      const clean = mensaje.trim();

      if (!clean) {
        setError("Escribe un mensaje.");
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from("interacciones_psyqus").insert([
        {
          user_id: user?.id ?? null,
          tipo: "buzon",
          mensaje: clean,
          respuesta: null,
          resumen_riesgo: "pendiente_revision",
        },
      ]);

      if (insertError) {
        console.error("Error Supabase Buzón:", insertError);
        setError(`No pude enviar el mensaje: ${insertError.message || "error desconocido"}`);
        setLoading(false);
        return;
      }

      setMensaje("");
      setDone(true);
    } catch (err) {
      console.error("Error general Buzón:", err);
      setError("Ocurrió un error al enviar tu mensaje.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.10),transparent_22%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-400/20 flex items-center justify-center">
              <Shield className="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-amber-300/80 font-semibold mb-2">
                Psyqus Safe Channel
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Buzón de Paz
              </h1>
              <p className="mt-3 text-slate-300 max-w-2xl">
                Este espacio envía tu mensaje directamente al panel del psicólogo.
                Aquí no responde un bot.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-amber-300" />
            <h2 className="text-2xl font-bold">Escribe tu mensaje</h2>
          </div>

          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={10}
            placeholder="Escribe aquí lo que quieras comunicar al área profesional..."
            className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400/30 resize-none"
          />

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
          {done && (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-emerald-200 text-sm">
              Tu mensaje fue enviado correctamente al panel del psicólogo.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 font-bold text-black hover:bg-amber-400 transition disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            {loading ? "Enviando..." : "Enviar al psicólogo"}
          </button>
        </form>
      </section>
    </main>
  );
}