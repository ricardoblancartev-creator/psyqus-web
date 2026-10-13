
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen, HeartPulse, MessageCircle,
  Wind, ShieldCheck, ClipboardList,
  Volume2, VolumeX
} from "lucide-react";

type Avatar = "mujer" | "hombre";

const opciones = [
  { nombre: "Quiero hablar", ruta: "/ia", Icono: MessageCircle },
  { nombre: "Tomar un curso", ruta: "/psicoeducacion", Icono: BookOpen },
  { nombre: "Relajarme", ruta: "/dashboard", Icono: Wind },
  { nombre: "Cómo me siento", ruta: "/pulso", Icono: HeartPulse },
  { nombre: "Buzón privado", ruta: "/buzon", Icono: ShieldCheck },
  { nombre: "Evaluación NOM-035", ruta: "/encuesta", Icono: ClipboardList },
];

export default function ExperienciaPage() {
  const [avatar, setAvatar] = useState<Avatar>("mujer");
  const [hablando, setHablando] = useState(false);
  const [voz, setVoz] = useState(false);
  const [seleccion, setSeleccion] = useState<(typeof opciones)[number] | null>(null);
  const [mensaje, setMensaje] = useState(
    "Hola, soy tu acompañante de Psyqus. ¿Qué te gustaría hacer hoy?"
  );

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  function decir(texto: string) {
    window.speechSynthesis?.cancel();
    if (!voz || !("speechSynthesis" in window)) {
      setHablando(false);
      return;
    }

    const audio = new SpeechSynthesisUtterance(texto);
    audio.lang = "es-MX";
    audio.rate = 0.95;
    audio.onstart = () => setHablando(true);
    audio.onend = () => setHablando(false);
    audio.onerror = () => setHablando(false);
    window.speechSynthesis.speak(audio);
  }

  function elegir(opcion: (typeof opciones)[number]) {
    setSeleccion(opcion);
    const texto = `Perfecto. Vamos a ${opcion.nombre.toLowerCase()}. Presiona continuar cuando estés listo.`;
    setMensaje(texto);
    decir(texto);
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <p className="text-cyan-400 text-xs tracking-widest">PSYQUS</p>
            <h1 className="text-3xl font-bold">Tu espacio de bienestar</h1>
          </div>
          <Link href="/dashboard" className="text-sm text-slate-300">
            Volver
          </Link>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-cyan-950 to-slate-950 p-6 text-center">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setHablando(false);
                  setVoz(!voz);
                }}
                className="rounded-xl bg-white/10 p-3"
                aria-label={voz ? "Desactivar voz" : "Activar voz"}
              >
                {voz ? <Volume2 /> : <VolumeX />}
              </button>
            </div>

            <div
              className="relative mx-auto my-10 h-72 w-56"
              role="img"
              aria-label={`Avatar ${avatar} animado`}
            >
              <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-28 w-52 rounded-t-full ${avatar === "mujer" ? "bg-violet-700" : "bg-cyan-800"}`} />
              <div className="absolute top-8 left-1/2 -translate-x-1/2 h-48 w-40 rounded-[45%] bg-gradient-to-br from-amber-200 via-amber-300 to-amber-600 shadow-2xl">
                <div className={`absolute -top-5 -left-2 h-20 w-44 rounded-t-full ${avatar === "mujer" ? "bg-stone-800" : "bg-slate-900"}`} />
                <div className="absolute top-24 left-8 h-4 w-5 rounded-full bg-slate-900 animate-pulse" />
                <div className="absolute top-24 right-8 h-4 w-5 rounded-full bg-slate-900 animate-pulse" />
                <div className="absolute top-36 left-[72px] h-7 w-3 rounded-full border-r-2 border-amber-800/50" />
                <div
                  className={`absolute top-40 left-14 w-12 rounded-full bg-rose-900 transition-all ${
                    hablando ? "h-6 animate-pulse" : "h-2"
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {(["mujer", "hombre"] as Avatar[]).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    setHablando(false);
                    setAvatar(tipo);
                  }}
                  className={`rounded-xl px-5 py-3 capitalize ${
                    avatar === tipo
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-white/10"
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <div className="mb-6 rounded-2xl bg-cyan-400/10 p-5">
              <p className="text-xs text-cyan-300 mb-2">TU ACOMPAÑANTE</p>
              <p aria-live="polite" className="text-lg">{mensaje}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {opciones.map(({ nombre, ruta, Icono }) => (
                <button
                  key={ruta}
                  onClick={() => elegir({ nombre, ruta, Icono })}
                  className="min-h-24 rounded-2xl border border-white/10 bg-white/5 p-4 text-left hover:border-cyan-400"
                >
                  <Icono className="mb-3 text-cyan-300" />
                  <span className="text-sm">{nombre}</span>
                </button>
              ))}
            </div>

            {seleccion && (
              <Link
                href={seleccion.ruta}
                className="mt-6 block rounded-xl bg-cyan-400 p-4 text-center font-bold text-slate-950"
              >
                Continuar a {seleccion.nombre}
              </Link>
            )}

            <p className="mt-6 text-xs text-slate-400">
              Este acompañante facilita el acceso a los módulos.
              No sustituye atención profesional ni modifica las evaluaciones oficiales.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

