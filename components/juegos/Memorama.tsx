"use client";

import { useState } from "react";
import { Activity, Coffee, Droplet, MessageCircle, Moon, RotateCcw, Trophy, Wind, type LucideIcon } from "lucide-react";
import { PARES_MEMORAMA, guardarResultado, revolver } from "@/lib/juegos";

const ICONOS: Record<string, LucideIcon> = {
  dormir: Moon,
  moverte: Activity,
  respirar: Wind,
  platicar: MessageCircle,
  agua: Droplet,
  pausa: Coffee,
};

type Carta = { uid: number; par: (typeof PARES_MEMORAMA)[number] };

const nuevoMazo = (): Carta[] =>
  revolver(PARES_MEMORAMA.flatMap((p, i) => [{ uid: i * 2, par: p }, { uid: i * 2 + 1, par: p }]));

export default function Memorama({ color, onSalir }: { color: string; onSalir: () => void }) {
  const [mazo, setMazo] = useState(nuevoMazo);
  const [abiertas, setAbiertas] = useState<number[]>([]);
  const [encontrados, setEncontrados] = useState<string[]>([]);
  const [movimientos, setMovimientos] = useState(0);
  const [tip, setTip] = useState<string | null>(null);
  const [fin, setFin] = useState<{ record: boolean } | null>(null);

  function voltear(c: Carta) {
    if (abiertas.length === 2 || abiertas.includes(c.uid) || encontrados.includes(c.par.id)) return;
    const nuevas = [...abiertas, c.uid];
    setAbiertas(nuevas);
    if (nuevas.length < 2) return;

    const mov = movimientos + 1;
    setMovimientos(mov);
    const [a, b] = nuevas.map((u) => mazo.find((x) => x.uid === u)!);
    if (a.par.id === b.par.id) {
      const hechos = [...encontrados, a.par.id];
      setEncontrados(hechos);
      setTip(`${a.par.texto}: ${a.par.tip}`);
      setAbiertas([]);
      if (hechos.length === PARES_MEMORAMA.length) {
        setFin({ record: guardarResultado("memorama", mov, "movimientos", true) });
      }
    } else {
      window.setTimeout(() => setAbiertas([]), 900);
    }
  }

  function reiniciar() {
    setMazo(nuevoMazo());
    setAbiertas([]);
    setEncontrados([]);
    setMovimientos(0);
    setTip(null);
    setFin(null);
  }

  if (fin) {
    return (
      <div className="text-center">
        <Trophy className="mx-auto h-12 w-12" style={{ color }} />
        <p className="mt-4 text-4xl font-black">{movimientos} movimientos</p>
        {fin.record && <p className="mt-1 text-sm font-semibold text-emerald-300">¡Nuevo récord!</p>}
        <ul className="mx-auto mt-6 max-w-lg space-y-2 text-left">
          {PARES_MEMORAMA.map((p) => {
            const Icono = ICONOS[p.id];
            return (
              <li key={p.id} className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm">
                <Icono className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} />
                <span>
                  <b>{p.texto}:</b> <span className="text-slate-300">{p.tip}</span>
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button onClick={reiniciar} className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 font-bold text-slate-950" style={{ background: color }}>
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
    <div>
      <div className="mb-4 flex justify-between text-sm text-slate-400">
        <span>
          Pares: {encontrados.length} de {PARES_MEMORAMA.length}
        </span>
        <span className="tabular-nums">Movimientos: {movimientos}</span>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4">
        {mazo.map((c) => {
          const visible = abiertas.includes(c.uid) || encontrados.includes(c.par.id);
          const hecho = encontrados.includes(c.par.id);
          const Icono = ICONOS[c.par.id];
          return (
            <button
              key={c.uid}
              type="button"
              onClick={() => voltear(c)}
              aria-label={visible ? c.par.texto : "Carta boca abajo"}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-semibold transition ${
                visible ? "border-white/20 bg-white text-slate-900" : "border-white/10 bg-white/5 hover:bg-white/10"
              } ${hecho ? "opacity-70" : ""}`}
            >
              {visible ? (
                <>
                  <Icono className="h-7 w-7" style={{ color: hecho ? color : "#0f172a" }} />
                  {c.par.texto}
                </>
              ) : (
                <span className="text-2xl font-black" style={{ color }}>
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mx-auto mt-5 min-h-12 max-w-md text-center text-sm text-slate-300" role="status">
        {tip ?? "Voltea dos cartas iguales. Cada par te deja un tip."}
      </p>
    </div>
  );
}
