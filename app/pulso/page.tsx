"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  BatteryMedium,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  Moon,
  Sparkles,
} from "lucide-react";

type Pulso = {
  id: string;
  semana_inicio: string;
  energia: number;
  desconexion: number;
  apoyo: number;
  dificultad: string | null;
};

const dificultades = [
  "Carga de trabajo",
  "Concentración",
  "Descanso",
  "Relaciones",
  "Estrés o tensión",
  "Nada en particular",
  "Otro",
];

function getMondayLocal() {
  const today = new Date();

  const day = today.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + diff
  );

  const year = monday.getFullYear();

  const month = String(
    monday.getMonth() + 1
  ).padStart(2, "0");

  const date = String(
    monday.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function Scale({
  value,
  onChange,
  low,
  high,
}: {
  value: number | null;
  onChange: (value: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map(
          (number) => (
            <button
              key={number}
              type="button"
              onClick={() =>
                onChange(number)
              }
              className={`h-12 rounded-xl border font-black transition ${
                value === number
                  ? "border-cyan-300 bg-cyan-400 text-slate-950"
                  : "border-white/10 bg-white/[0.035] text-slate-300 hover:border-cyan-400/30"
              }`}
            >
              {number}
            </button>
          )
        )}
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-600">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  );
}

export default function PulsoPage() {
  const semanaInicio =
    useMemo(
      () => getMondayLocal(),
      []
    );

  const [energia, setEnergia] =
    useState<number | null>(null);

  const [
    desconexion,
    setDesconexion,
  ] =
    useState<number | null>(null);

  const [apoyo, setApoyo] =
    useState<number | null>(null);

  const [
    dificultad,
    setDificultad,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ===============================================
     BUSCAR PULSO DE ESTA SEMANA
  =============================================== */

  useEffect(() => {
    async function loadPulso() {
      try {
        const response =
          await fetch(
            `/api/pulso?semana=${semanaInicio}`,
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "No se pudo consultar el pulso."
          );
        }

        const data =
          await response.json();

        const pulso =
          data?.pulso as
            | Pulso
            | null;

        if (pulso) {
          setEnergia(
            pulso.energia
          );

          setDesconexion(
            pulso.desconexion
          );

          setApoyo(
            pulso.apoyo
          );

          setDificultad(
            pulso.dificultad ||
              ""
          );

          setSaved(true);
        }
      } catch (err) {
        console.error(err);

        setError(
          "No pudimos cargar tu pulso semanal."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPulso();
  }, [semanaInicio]);

  const completo =
    energia !== null &&
    desconexion !== null &&
    apoyo !== null;

  async function guardarPulso() {
    if (
      !completo ||
      saving
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          "/api/pulso",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              semana_inicio:
                semanaInicio,

              energia,

              desconexion,

              apoyo,

              dificultad:
                dificultad ||
                null,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "No se pudo guardar."
        );
      }

      setSaved(true);
    } catch (err) {
      console.error(err);

      setError(
        "No pudimos guardar tu pulso. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />

          Cargando...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.13),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_28%)]" />

      <section className="relative max-w-3xl mx-auto px-5 md:px-6 py-7 md:py-10">

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition mb-8"
        >
          <ArrowLeft className="w-4 h-4" />

          Volver al inicio
        </Link>

        {/* HEADER */}

        <header className="mb-8">

          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.24em] font-black text-cyan-300">
            <Sparkles className="w-4 h-4" />

            Psyqus · Pulso semanal
          </div>

          <h1 className="mt-5 text-4xl md:text-6xl font-black tracking-tight">

            ¿Cómo estuvo tu{" "}

            <span className="text-cyan-300">
              semana?
            </span>

          </h1>

          <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-400">

            Tres preguntas rápidas para conocer
            cómo viviste esta semana de trabajo.

          </p>

          <p className="mt-2 text-xs text-slate-600">

            No es una evaluación psicológica,
            diagnóstico ni cuestionario NOM-035.

          </p>

        </header>

        <div className="space-y-4">

          {/* ENERGÍA */}

          <section className="rounded-[1.7rem] border border-white/10 bg-slate-950/65 p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center shrink-0">

                <BatteryMedium className="w-5 h-5 text-cyan-300" />

              </div>

              <div className="flex-1">

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Energía
                </p>

                <h2 className="mt-1 text-lg font-black">

                  ¿Cómo estuvo tu energía
                  esta semana?

                </h2>

                <div className="mt-5">

                  <Scale
                    value={energia}
                    onChange={(value) => {
                      setEnergia(
                        value
                      );

                      setSaved(
                        false
                      );
                    }}
                    low="Muy baja"
                    high="Muy buena"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* DESCONEXIÓN */}

          <section className="rounded-[1.7rem] border border-white/10 bg-slate-950/65 p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl border border-violet-400/20 bg-violet-500/10 flex items-center justify-center shrink-0">

                <Moon className="w-5 h-5 text-violet-300" />

              </div>

              <div className="flex-1">

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Desconexión
                </p>

                <h2 className="mt-1 text-lg font-black">

                  ¿Pudiste desconectarte del
                  trabajo al terminar?

                </h2>

                <div className="mt-5">

                  <Scale
                    value={
                      desconexion
                    }
                    onChange={(value) => {
                      setDesconexion(
                        value
                      );

                      setSaved(
                        false
                      );
                    }}
                    low="Nunca"
                    high="Siempre"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* APOYO */}

          <section className="rounded-[1.7rem] border border-white/10 bg-slate-950/65 p-6">

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center shrink-0">

                <HeartHandshake className="w-5 h-5 text-emerald-300" />

              </div>

              <div className="flex-1">

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Apoyo
                </p>

                <h2 className="mt-1 text-lg font-black">

                  ¿Te sentiste apoyado por
                  tu equipo?

                </h2>

                <div className="mt-5">

                  <Scale
                    value={apoyo}
                    onChange={(value) => {
                      setApoyo(
                        value
                      );

                      setSaved(
                        false
                      );
                    }}
                    low="Nada"
                    high="Mucho"
                  />

                </div>

              </div>

            </div>

          </section>

          {/* DIFICULTAD */}

          <section className="rounded-[1.7rem] border border-white/10 bg-slate-950/65 p-6">

            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
              Esta semana
            </p>

            <h2 className="mt-1 text-lg font-black">

              ¿Qué fue lo más difícil?

            </h2>

            <p className="mt-2 text-sm text-slate-500">

              Esta pregunta es opcional.

            </p>

            <div className="mt-5 flex flex-wrap gap-2">

              {dificultades.map(
                (item) => {

                  const selected =
                    dificultad ===
                    item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setDificultad(
                          item
                        );

                        setSaved(
                          false
                        );
                      }}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        selected
                          ? "border-cyan-300 bg-cyan-400 text-slate-950"
                          : "border-white/10 bg-white/[0.035] text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {item}
                    </button>
                  );
                }
              )}

            </div>

          </section>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {saved && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">

            <div className="flex items-start gap-3">

              <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 shrink-0" />

              <div>

                <p className="font-black text-emerald-200">
                  Pulso registrado
                </p>

                <p className="mt-1 text-sm text-slate-400">

                  Tus respuestas de esta semana
                  están guardadas.

                </p>

              </div>

            </div>

          </div>
        )}

        {/* GUARDAR */}

        <button
          type="button"
          disabled={
            !completo ||
            saving
          }
          onClick={
            guardarPulso
          }
          className="mt-6 w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >

          {saving
            ? "Guardando..."
            : saved
            ? "Pulso guardado ✓"
            : "Registrar mi semana"}

        </button>

        <p className="mt-4 text-center text-xs text-slate-600">

          Toma menos de un minuto.

        </p>

      </section>

    </main>
  );
}
