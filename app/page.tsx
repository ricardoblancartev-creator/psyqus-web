"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Brain,
  Users,
  Building2,
  Send,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    empresa: "",
    nombre: "",
    telefono: "",
    email: "",
    rubro: "",
    empleados: "",
    mensaje: "",
  });

  function updateField(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: any) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/prospectos", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-10 items-center">

        {/* 🔥 TEXTO */}
        <div>
          <h1 className="text-5xl font-black leading-tight">
            ¿Tienes forma de comprobar el cumplimiento de la NOM-035?
          </h1>

          <p className="mt-6 text-xl text-slate-300">
            Psyqus te permite evaluar, documentar y dar seguimiento al bienestar
            psicosocial de tu empresa con evidencia clara, organizada y lista
            para cualquier revisión.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <Brain className="text-cyan-300 mb-2" />
              Salud mental
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <Users className="text-emerald-300 mb-2" />
              Prevención
            </div>

            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <ShieldCheck className="text-fuchsia-300 mb-2" />
              Evidencia legal
            </div>
          </div>

          <p className="mt-8 text-slate-400">
            La NOM-035 busca prevenir factores de riesgo psicosocial en el trabajo.
            Hoy, la salud mental del equipo es clave para evitar rotación, conflictos
            y problemas laborales.
          </p>
        </div>

        {/* 🔥 FORMULARIO */}
        <div className="bg-slate-950/70 p-8 rounded-2xl border border-white/10">

          {!success ? (
            <>
              <h2 className="text-3xl font-black mb-4">
                Solicita una cotización
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  name="empresa"
                  placeholder="Empresa"
                  required
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  name="nombre"
                  placeholder="Nombre"
                  required
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  name="telefono"
                  placeholder="Teléfono"
                  required
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  name="email"
                  placeholder="Correo"
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <input
                  name="rubro"
                  placeholder="Rubro"
                  required
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <select
                  name="empleados"
                  required
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-[#0f172a]"
                >
                  <option value="">Número de empleados</option>
                  <option>1-15</option>
                  <option>16-50</option>
                  <option>51-100</option>
                  <option>100+</option>
                </select>

                <textarea
                  name="mensaje"
                  placeholder="¿Qué te gustaría resolver?"
                  onChange={updateField}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10"
                />

                <button
                  disabled={loading}
                  className="w-full bg-cyan-500 py-4 rounded-xl font-black text-black"
                >
                  {loading ? "Enviando..." : "Solicitar cotización"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-10">
              <CheckCircle2 className="mx-auto mb-4 text-green-400" size={40} />
              <h2 className="text-2xl font-bold">
                Te contactaremos pronto
              </h2>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}