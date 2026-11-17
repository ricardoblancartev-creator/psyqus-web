"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Gamepad2, Play, Trophy } from "lucide-react";
import { DATOS_OPCIONES, JUEGOS, leerRecords, type IdJuego, type RecordJuego } from "@/lib/juegos";
import JuegoOpciones from "@/components/juegos/JuegoOpciones";
import RespiraBola from "@/components/juegos/RespiraBola";
import Memorama from "@/components/juegos/Memorama";

/*
  APRENDER — minijuegos de salud mental y sana convivencia.
  Reemplaza a los cursos (que siguen en /psicoeducacion/cursos).
  Se puede abrir un juego directo con /psicoeducacion#respira, #hechos, etc.
*/

function textoRecord(r?: RecordJuego) {
  if (!r) return null;
  if (r.unidad === "%") return `Mejor: ${r.mejor}%`;
  if (r.unidad === "movimientos") return `Mejor: ${r.mejor} movimientos`;
  return `Mejor: ${r.mejor} aciertos`;
}

export default function AprenderPage() {
  const [activo, setActivo] = useState<IdJuego | null>(null);
  const [records, setRecords] = useState<ReturnType<typeof leerRecords>>({});

  // Los récords y el #juego solo existen en el navegador: se leen después de montar.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      setRecords(leerRecords());
      const hash = window.location.hash.slice(1);
      if (JUEGOS.some((j) => j.id === hash)) setActivo(hash as IdJuego);
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  function abrir(id: IdJuego | null) {
    setActivo(id);
    setRecords(leerRecords());
    window.history.replaceState(null, "", id ? `#${id}` : window.location.pathname);
    window.scrollTo({ top: 0 });
  }

  const juego = JUEGOS.find((j) => j.id === activo);
  const [destacado, ...resto] = JUEGOS;

  if (juego) {
    return (
      <main className="min-h-screen px-5 py-7 text-white md:py-10">
        <div className="mx-auto max-w-2xl">
          <button onClick={() => abrir(null)} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Todos los juegos
          </button>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: juego.color }}>
              {juego.categoria} · {juego.aspecto}
            </p>
            <h1 className="mt-1 text-3xl font-black">{juego.titulo}</h1>
            <p className="mt-2 text-sm text-slate-400">{juego.descripcion}</p>
            <div className="mt-6 border-t border-white/10 pt-6">
              {juego.id === "respira" ? (
                <RespiraBola onSalir={() => abrir(null)} />
              ) : juego.id === "memorama" ? (
                <Memorama color={juego.color} onSalir={() => abrir(null)} />
              ) : (
                <JuegoOpciones id={juego.id} datos={DATOS_OPCIONES[juego.id]} color={juego.color} onSalir={() => abrir(null)} />
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-7 text-white md:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            <Gamepad2 className="h-4 w-4" />
            Aprender jugando
          </p>
          <h1 className="mt-4 text-3xl font-black md:text-5xl">
            Juegos cortos para sentirte mejor <span className="text-cyan-300">y convivir mejor</span>
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">De 1 a 3 minutos cada uno. Sin calificaciones: solo tú ves tus récords.</p>
        </header>

        {/* Destacado: la bola de respiración */}
        <button
          onClick={() => abrir(destacado.id)}
          className="group mb-6 flex w-full flex-col items-center gap-6 overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-950/80 to-slate-950 p-6 text-left transition hover:border-cyan-400/50 sm:flex-row md:p-8"
        >
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
            <div className="absolute h-32 w-32 animate-[psq-bola_7s_ease-in-out_infinite] rounded-full bg-cyan-500/25 blur-2xl" />
            <div className="h-24 w-24 animate-[psq-bola_7s_ease-in-out_infinite] rounded-full bg-gradient-to-br from-cyan-200 via-cyan-500 to-fuchsia-500 shadow-[0_0_60px_rgba(34,211,238,0.5)]" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              {destacado.categoria} · {destacado.minutos} min
            </p>
            <h2 className="mt-1 text-2xl font-black md:text-3xl">{destacado.titulo}</h2>
            <p className="mt-2 text-slate-300">{destacado.descripcion}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 font-bold text-slate-950">
                <Play className="h-4 w-4" />
                Jugar
              </span>
              {textoRecord(records[destacado.id]) && (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                  <Trophy className="h-4 w-4" />
                  {textoRecord(records[destacado.id])}
                </span>
              )}
            </div>
          </div>
          <style>{`@keyframes psq-bola { 0%,100% { transform: scale(0.8); } 45%,60% { transform: scale(1.15); } }
            @media (prefers-reduced-motion: reduce) { [class*="psq-bola"] { animation: none !important; } }`}</style>
        </button>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resto.map((j) => (
            <button
              key={j.id}
              onClick={() => abrir(j.id)}
              className="flex flex-col rounded-[1.6rem] border border-white/10 bg-slate-950/60 p-5 text-left transition hover:bg-white/[0.04]"
              style={{ borderTopColor: j.color, borderTopWidth: 3 }}
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="rounded-full px-2.5 py-1 font-semibold text-slate-950" style={{ background: j.color }}>
                  {j.categoria}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  {j.minutos} min
                </span>
              </div>
              <h2 className="mt-4 text-xl font-black">{j.titulo}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{j.descripcion}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="font-semibold" style={{ color: j.color }}>
                  Jugar →
                </span>
                <span className="text-xs text-slate-500">{textoRecord(records[j.id]) ?? `Aspecto ${j.aspecto.toLowerCase()}`}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-8 text-xs text-slate-500">
          Juegos de bienestar general. No son una evaluación ni sustituyen atención psicológica o médica.
        </p>
      </div>
    </main>
  );
}
