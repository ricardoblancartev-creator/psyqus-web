"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { guardarResultado } from "@/lib/juegos";

/*
  Respira con la bola: la misma bola de respiración de Herramientas rápidas
  (/mindfulness), convertida en juego.
  Ritmo 4-4-6: inhala 4 s, sostén 4 s, exhala 6 s. 4 ciclos ≈ 1 minuto.
  Mantén presionado mientras la bola crece o se sostiene; suelta mientras se encoge.
  La puntuación es el % de tiempo que vas sincronizado.
*/

type Fase = "listo" | "inhala" | "sostén" | "exhala";
const FASES: { fase: Exclude<Fase, "listo">; seg: number }[] = [
  { fase: "inhala", seg: 4 },
  { fase: "sostén", seg: 4 },
  { fase: "exhala", seg: 6 },
];
const CICLOS = 4;
const CICLO = FASES.reduce((s, f) => s + f.seg, 0);
const TOTAL = CICLO * CICLOS;
const PASO = 100; // ms

function faseEn(t: number) {
  let r = t % CICLO;
  for (const f of FASES) {
    if (r < f.seg) return { fase: f.fase, resta: Math.ceil(f.seg - r) };
    r -= f.seg;
  }
  return { fase: "exhala" as const, resta: 0 };
}

export default function RespiraBola({ onSalir }: { onSalir: () => void }) {
  const [t, setT] = useState(0); // segundos transcurridos
  const [jugando, setJugando] = useState(false);
  const [presionado, setPresionado] = useState(false);
  const [fin, setFin] = useState<{ pct: number; record: boolean } | null>(null);
  const bien = useRef(0);
  const ticks = useRef(0);
  const presRef = useRef(false);

  const { fase, resta } = jugando || t > 0 ? faseEn(t) : { fase: "listo" as Fase, resta: 0 };

  function presionar(v: boolean) {
    presRef.current = v;
    setPresionado(v);
  }

  useEffect(() => {
    if (!jugando) return;
    const id = window.setInterval(() => {
      setT((prev) => {
        const nuevo = prev + PASO / 1000;
        const f = faseEn(prev).fase;
        const debePresionar = f === "inhala" || f === "sostén";
        ticks.current += 1;
        if (presRef.current === debePresionar) bien.current += 1;
        if (nuevo >= TOTAL) {
          window.clearInterval(id);
          const pct = Math.round((bien.current / Math.max(1, ticks.current)) * 100);
          setJugando(false);
          setFin({ pct, record: guardarResultado("respira", pct, "%") });
          return TOTAL;
        }
        return nuevo;
      });
    }, PASO);
    return () => window.clearInterval(id);
  }, [jugando]);

  // Barra espaciadora = presionar
  useEffect(() => {
    const abajo = (e: KeyboardEvent) => {
      if (e.code === "Space" && jugando) {
        e.preventDefault();
        presionar(true);
      }
    };
    const arriba = (e: KeyboardEvent) => {
      if (e.code === "Space") presionar(false);
    };
    window.addEventListener("keydown", abajo);
    window.addEventListener("keyup", arriba);
    return () => {
      window.removeEventListener("keydown", abajo);
      window.removeEventListener("keyup", arriba);
    };
  }, [jugando]);

  function empezar() {
    bien.current = 0;
    ticks.current = 0;
    setT(0);
    setFin(null);
    setJugando(true);
  }

  const grande = fase === "inhala" || fase === "sostén";
  const transform = fase === "listo" ? "scale(0.9)" : grande ? "scale(1.32)" : "scale(0.76)";
  const duracion = fase === "inhala" ? "4000ms" : fase === "exhala" ? "6000ms" : "350ms";
  const orbe = { transform, transitionProperty: "transform", transitionDuration: duracion, transitionTimingFunction: "ease-in-out" };
  const sincronizado = jugando && presionado === grande;

  if (fin) {
    return (
      <div className="text-center">
        <Trophy className="mx-auto h-12 w-12 text-cyan-300" />
        <p className="mt-4 text-5xl font-black">{fin.pct}%</p>
        <p className="mt-1 text-slate-400">de sincronía con tu respiración</p>
        {fin.record && <p className="mt-1 text-sm font-semibold text-emerald-300">¡Nuevo récord!</p>}
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Lo que te llevas</p>
          <p className="mt-2 leading-relaxed text-slate-200">
            Exhalar más lento de lo que inhalas le dice a tu cuerpo que puede bajar el ritmo. Úsalo antes de una junta
            difícil o cuando sientas que todo va muy rápido.
          </p>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={empezar} className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 font-bold text-slate-950">
            <RotateCcw className="h-4 w-4" />
            Jugar otra vez
          </button>
          <button onClick={onSalir} className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10">
            Elegir otro juego
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex h-[300px] items-center justify-center overflow-hidden md:h-[340px]">
        <div className="relative flex h-[210px] w-[210px] items-center justify-center">
          <div className="absolute h-[210px] w-[210px] rounded-full border border-cyan-300/20" style={orbe} />
          <div className="absolute h-[175px] w-[175px] rounded-full bg-cyan-500/20 blur-3xl" style={orbe} />
          <div
            className="relative h-[145px] w-[145px] rounded-full bg-gradient-to-br from-cyan-200 via-cyan-500 to-fuchsia-500 shadow-[0_0_90px_rgba(34,211,238,0.55)]"
            style={orbe}
          />
          <div
            className={`absolute h-3 w-3 rounded-full transition-colors ${
              !jugando ? "bg-white" : sincronizado ? "bg-emerald-300 shadow-[0_0_25px_#6ee7b7]" : "bg-amber-300 shadow-[0_0_25px_#fcd34d]"
            }`}
          />
        </div>
      </div>

      <h3 className="text-4xl font-black capitalize text-cyan-300 md:text-5xl">{fase === "listo" ? "¿Listo?" : fase}</h3>
      <p className="mt-2 text-slate-400">
        {jugando
          ? `${resta} s · ${grande ? "mantén presionado" : "suelta"} · ciclo ${Math.min(CICLOS, Math.floor(t / CICLO) + 1)} de ${CICLOS}`
          : "Mantén presionado mientras la bola crece o se sostiene. Suelta cuando se encoja."}
      </p>

      {jugando ? (
        <button
          type="button"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            presionar(true);
          }}
          onPointerUp={() => presionar(false)}
          onPointerCancel={() => presionar(false)}
          onContextMenu={(e) => e.preventDefault()}
          className={`mx-auto mt-7 block w-full max-w-sm select-none rounded-3xl py-6 text-lg font-black transition [touch-action:none] ${
            presionado ? "scale-[0.98] bg-cyan-300 text-slate-950" : "bg-white/10 text-white"
          }`}
        >
          {presionado ? "Inhalando…" : "Mantén presionado aquí"}
        </button>
      ) : (
        <button onClick={empezar} className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-8 py-3 font-black text-slate-950 hover:bg-cyan-300">
          <Play className="h-4 w-4" />
          Empezar (1 min)
        </button>
      )}
      <p className="mt-3 text-xs text-slate-500">En computadora también puedes usar la barra espaciadora.</p>
    </div>
  );
}
