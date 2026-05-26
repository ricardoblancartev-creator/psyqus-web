"use client";

import { useEffect, useMemo, useState } from "react";
import { Brain } from "lucide-react";

type HabitKey =
  | "agua"
  | "caminar"
  | "respirar"
  | "meditar"
  | "dormir"
  | "pantallas";

const habitLabels: Record<HabitKey, string> = {
  agua: "Tomé suficiente agua hoy",
  caminar: "Caminé o me moví al menos 20 minutos",
  respirar: "Hice una pausa de respiración consciente",
  meditar: "Meditación breve o silencio consciente",
  dormir: "Preparé mejor mi sueño esta noche",
  pantallas: "Reduje pantallas antes de dormir",
};

const TOTAL_SECONDS = 60;

export default function MindfulnessPage() {
  const [running, setRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOTAL_SECONDS);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [phaseSeconds, setPhaseSeconds] = useState(4);

  const [habits, setHabits] = useState<Record<HabitKey, boolean>>({
    agua: false,
    caminar: false,
    respirar: false,
    meditar: false,
    dormir: false,
    pantallas: false,
  });

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });

      setPhaseSeconds((prev) => {
        if (prev > 1) return prev - 1;

        if (phase === "inhale") {
          setPhase("hold");
          return 4;
        }

        if (phase === "hold") {
          setPhase("exhale");
          return 6;
        }

        setPhase("inhale");
        return 4;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running, phase]);

  function toggleRun() {
    if (secondsLeft === 0) {
      resetBreathing();
      setRunning(true);
      return;
    }

    setRunning((prev) => !prev);
  }

  function resetBreathing() {
    setRunning(false);
    setSecondsLeft(TOTAL_SECONDS);
    setPhase("inhale");
    setPhaseSeconds(4);
  }

  function toggleHabit(key: HabitKey) {
    setHabits((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const completedHabits = useMemo(
    () => Object.values(habits).filter(Boolean).length,
    [habits]
  );

  const breathText =
    phase === "inhale" ? "Inhala" : phase === "hold" ? "Sostén" : "Exhala";

  const orbScale =
    phase === "inhale" ? "scale-[1.35]" : phase === "hold" ? "scale-[1.45]" : "scale-[0.72]";

  const duration =
    phase === "inhale" ? "duration-[4000ms]" : phase === "hold" ? "duration-[1200ms]" : "duration-[6000ms]";

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.10),transparent_24%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_26%)]" />

      <section className="relative max-w-6xl mx-auto px-6 py-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-6 mb-8">
          <div className="flex items-center gap-4">
            <Brain className="w-8 h-8 text-cyan-300" />
            <div>
              <h1 className="text-4xl font-black">Mindfulness</h1>
              <p className="text-slate-300">
                Regulación rápida del sistema nervioso
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 p-8 text-center">
          <h2 className="text-2xl mb-6 font-bold">Respiración guiada</h2>

          <div className="flex justify-center items-center h-[360px]">
            <div className="relative flex items-center justify-center">

              <div
                className={`absolute w-80 h-80 rounded-full border border-cyan-300/20 transition-all ${duration} ease-in-out ${orbScale}`}
              />

              <div
                className={`absolute w-72 h-72 rounded-full border border-fuchsia-300/10 transition-all ${duration} ease-in-out ${orbScale}`}
              />

              <div
                className={`absolute w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl transition-all ${duration} ease-in-out ${orbScale}`}
              />

              <div
                className={`relative w-44 h-44 rounded-full bg-gradient-to-br from-cyan-200 via-cyan-500 to-fuchsia-500 shadow-[0_0_120px_rgba(34,211,238,0.85)] transition-all ${duration} ease-in-out ${orbScale}`}
              >
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
              </div>

              <div className="absolute w-5 h-5 rounded-full bg-white shadow-[0_0_35px_white]" />
            </div>
          </div>

          <p className="text-5xl font-black text-cyan-300 mt-4">
            {breathText}
          </p>

          <p className="text-slate-300 mt-2">
            {phaseSeconds}s · {secondsLeft}s restantes
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={toggleRun}
              className="bg-cyan-500 px-6 py-3 rounded-xl font-bold text-black hover:bg-cyan-400 transition"
            >
              {running ? "Pausar" : "Iniciar"}
            </button>

            <button
              onClick={resetBreathing}
              className="border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10 transition"
            >
              Reiniciar
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3">
          {(Object.keys(habitLabels) as HabitKey[]).map((key) => (
            <button
              key={key}
              onClick={() => toggleHabit(key)}
              className={`p-4 rounded-xl border transition ${
                habits[key]
                  ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-200"
                  : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/10"
              }`}
            >
              {habitLabels[key]}
            </button>
          ))}
        </div>

        <div className="mt-6 text-emerald-300 font-bold text-xl">
          Hábitos completados: {completedHabits}/6
        </div>
      </section>
    </main>
  );
}
