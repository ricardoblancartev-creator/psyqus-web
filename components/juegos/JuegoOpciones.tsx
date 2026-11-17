"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
import { guardarResultado, revolver, type IdJuego, type JuegoOpcionesDatos, type Opcion } from "@/lib/juegos";

/*
  Motor común de los juegos de "elige y aprende por qué":
  ¿Hecho o interpretación?, Ponle nombre, ¿Cómo lo dirías? y Cambia el pensamiento.
*/
export default function JuegoOpciones({
  id,
  datos,
  color,
  onSalir,
}: {
  id: IdJuego;
  datos: JuegoOpcionesDatos;
  color: string;
  onSalir: () => void;
}) {
  const preparar = () =>
    revolver(datos.rondas).map((r) => ({
      ...r,
      // "Hecho / Interpretación" se queda en orden fijo; lo demás se revuelve
      opciones: r.opciones.length > 2 ? revolver(r.opciones) : r.opciones,
    }));

  const [rondas, setRondas] = useState(preparar);
  const [i, setI] = useState(0);
  const [elegida, setElegida] = useState<Opcion | null>(null);
  const [aciertos, setAciertos] = useState(0);
  const [fin, setFin] = useState<{ record: boolean } | null>(null);

  const ronda = rondas[i];

  function elegir(o: Opcion) {
    if (elegida) return;
    setElegida(o);
    if (o.correcta) setAciertos((a) => a + 1);
  }

  function siguiente() {
    if (i + 1 >= rondas.length) {
      const total = aciertos;
      setFin({ record: guardarResultado(id, total, "aciertos") });
      return;
    }
    setI(i + 1);
    setElegida(null);
  }

  function reiniciar() {
    setRondas(preparar());
    setI(0);
    setElegida(null);
    setAciertos(0);
    setFin(null);
  }

  if (fin) {
    return (
      <div className="text-center">
        <Trophy className="mx-auto h-12 w-12" style={{ color }} />
        <p className="mt-4 text-4xl font-black">
          {aciertos} de {rondas.length}
        </p>
        {fin.record && <p className="mt-1 text-sm font-semibold text-emerald-300">¡Nuevo récord!</p>}
        <div className="mx-auto mt-6 max-w-lg rounded-2xl border border-white/10 bg-white/5 p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color }}>
            Lo que te llevas
          </p>
          <p className="mt-2 leading-relaxed text-slate-200">{datos.cierre}</p>
        </div>
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
      <div className="mb-5 flex items-center justify-between gap-3 text-sm text-slate-400">
        <span>
          {i + 1} de {rondas.length}
        </span>
        <span className="tabular-nums">Aciertos: {aciertos}</span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all" style={{ width: `${(i / rondas.length) * 100}%`, background: color }} />
      </div>

      <p className="text-sm text-slate-400">{datos.pregunta}</p>
      <p className="mt-2 text-2xl font-bold leading-snug md:text-3xl">{ronda.situacion}</p>

      <div className={`mt-6 grid gap-3 ${ronda.opciones.length === 2 ? "grid-cols-2" : ""}`}>
        {ronda.opciones.map((o) => {
          const mostrar = elegida !== null;
          const esta = elegida === o;
          const estilo = !mostrar
            ? "border-white/10 bg-white/5 hover:bg-white/10"
            : o.correcta
              ? "border-emerald-400/60 bg-emerald-500/15"
              : esta
                ? "border-red-400/60 bg-red-500/15"
                : "border-white/5 bg-white/[0.02] opacity-60";
          return (
            <button
              key={o.texto}
              type="button"
              disabled={mostrar}
              onClick={() => elegir(o)}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-4 text-left font-semibold transition ${estilo}`}
            >
              <span>
                {o.texto}
                {mostrar && o.etiqueta && <span className="ml-2 text-xs font-normal text-slate-400">({o.etiqueta})</span>}
              </span>
              {mostrar && o.correcta && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" />}
              {mostrar && esta && !o.correcta && <XCircle className="h-5 w-5 shrink-0 text-red-300" />}
            </button>
          );
        })}
      </div>

      {elegida && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-900/80 p-4" role="status">
          <p className={`font-bold ${elegida.correcta ? "text-emerald-300" : "text-amber-300"}`}>
            {elegida.correcta ? "¡Bien!" : "Casi."}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-200">{ronda.explicacion}</p>
          <button onClick={siguiente} className="mt-4 w-full rounded-xl py-3 font-bold text-slate-950" style={{ background: color }}>
            {i + 1 >= rondas.length ? "Ver resultado" : "Siguiente"}
          </button>
        </div>
      )}
    </div>
  );
}
