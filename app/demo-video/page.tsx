"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ClipboardList,
  Shield,
  BarChart3,
  MessageSquare,
  GraduationCap,
  Wind,
  CheckCircle2,
  Sparkles,
  UserRound,
  BookOpen,
  Stethoscope,
  Lock,
  Activity,
} from "lucide-react";

const scenes = [
  {
    title: "Psyqus",
    subtitle: "Bienestar laboral convertido en datos accionables",
    text: "Una plataforma para evaluar, interpretar y acompañar el bienestar organizacional bajo enfoque NOM-035.",
    icon: Brain,
    color: "cyan",
  },
  {
    title: "El problema",
    subtitle: "Las empresas suelen detectar el desgaste demasiado tarde",
    text: "Estrés, conflictos, rotación, baja comunicación y riesgos psicosociales pueden crecer en silencio dentro de la organización.",
    icon: Activity,
    color: "red",
  },
  {
    title: "Evaluación NOM-035",
    subtitle: "Medición digital del riesgo psicosocial",
    text: "El colaborador responde una encuesta estructurada para identificar señales de riesgo, carga laboral, liderazgo, comunicación y ambiente.",
    icon: ClipboardList,
    color: "cyan",
  },
  {
    title: "Resultados personales",
    subtitle: "Cada usuario ve solo su propia lectura",
    text: "Psyqus genera puntaje, nivel de riesgo, interpretación personalizada y mapa de calor individual.",
    icon: BarChart3,
    color: "emerald",
  },
  {
    title: "Asistente IA",
    subtitle: "Orientación inmediata y registro de interacciones relevantes",
    text: "La IA acompaña al usuario con respuestas claras sobre bienestar, tensión laboral y clima organizacional.",
    icon: Sparkles,
    color: "fuchsia",
  },
  {
    title: "Buzón de Paz",
    subtitle: "Canal directo y confidencial",
    text: "El colaborador puede enviar mensajes sensibles al área profesional sin tener que exponerse públicamente.",
    icon: MessageSquare,
    color: "amber",
  },
  {
    title: "Panel del psicólogo",
    subtitle: "Seguimiento profesional",
    text: "El especialista puede revisar evaluaciones, mensajes del buzón, interacciones de IA y focos de atención.",
    icon: Stethoscope,
    color: "rose",
  },
  {
    title: "Psicoeducación",
    subtitle: "Aprendizaje para mejorar el clima laboral",
    text: "Módulos sobre comunicación, prevención, ambiente sano y formas más saludables de relacionarse en el trabajo.",
    icon: BookOpen,
    color: "emerald",
  },
  {
    title: "Entrenamiento",
    subtitle: "Lecciones guiadas y prácticas",
    text: "Rutas interactivas para fortalecer liderazgo, comunicación, prevención y cultura organizacional.",
    icon: GraduationCap,
    color: "teal",
  },
  {
    title: "Mindfulness",
    subtitle: "Respiración, descanso y autocuidado",
    text: "Herramientas simples para regular estrés, mejorar sueño, meditar y construir hábitos de bienestar.",
    icon: Wind,
    color: "violet",
  },
  {
    title: "Perfil integral",
    subtitle: "Estilo personal + modelo BPSE",
    text: "Test de estilo personal y lectura bio-psico-social-espiritual para entender mejor la experiencia del colaborador.",
    icon: UserRound,
    color: "indigo",
  },
  {
    title: "Privacidad y trazabilidad",
    subtitle: "Información ordenada para tomar mejores decisiones",
    text: "Psyqus separa la experiencia personal del usuario y el seguimiento profesional autorizado.",
    icon: Lock,
    color: "cyan",
  },
  {
    title: "Psyqus para empresas",
    subtitle: "Evaluar, prevenir y acompañar",
    text: "Una solución para convertir el bienestar laboral en información clara, accionable y útil para la organización.",
    icon: CheckCircle2,
    color: "emerald",
  },
];

function colorClasses(color: string) {
  const map: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    cyan: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-400/25",
      text: "text-cyan-300",
      glow: "shadow-[0_0_80px_rgba(34,211,238,0.16)]",
    },
    red: {
      bg: "bg-red-500/10",
      border: "border-red-400/25",
      text: "text-red-300",
      glow: "shadow-[0_0_80px_rgba(248,113,113,0.13)]",
    },
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/25",
      text: "text-emerald-300",
      glow: "shadow-[0_0_80px_rgba(52,211,153,0.14)]",
    },
    fuchsia: {
      bg: "bg-fuchsia-500/10",
      border: "border-fuchsia-400/25",
      text: "text-fuchsia-300",
      glow: "shadow-[0_0_80px_rgba(217,70,239,0.14)]",
    },
    amber: {
      bg: "bg-amber-500/10",
      border: "border-amber-400/25",
      text: "text-amber-300",
      glow: "shadow-[0_0_80px_rgba(245,158,11,0.14)]",
    },
    rose: {
      bg: "bg-rose-500/10",
      border: "border-rose-400/25",
      text: "text-rose-300",
      glow: "shadow-[0_0_80px_rgba(244,63,94,0.14)]",
    },
    teal: {
      bg: "bg-teal-500/10",
      border: "border-teal-400/25",
      text: "text-teal-300",
      glow: "shadow-[0_0_80px_rgba(45,212,191,0.14)]",
    },
    violet: {
      bg: "bg-violet-500/10",
      border: "border-violet-400/25",
      text: "text-violet-300",
      glow: "shadow-[0_0_80px_rgba(139,92,246,0.14)]",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      border: "border-indigo-400/25",
      text: "text-indigo-300",
      glow: "shadow-[0_0_80px_rgba(99,102,241,0.14)]",
    },
  };

  return map[color] || map.cyan;
}

export default function DemoVideoPage() {
  const [index, setIndex] = useState(0);
  const scene = scenes[index];
  const Icon = scene.icon;
  const colors = colorClasses(scene.color);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % scenes.length);
    }, 5200);

    return () => clearInterval(interval);
  }, []);

  const progress = useMemo(() => ((index + 1) / scenes.length) * 100, [index]);

  return (
    <main className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_26%),radial-gradient(circle_at_center,rgba(15,23,42,0.8),transparent_36%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          className="h-full bg-cyan-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <section className="relative min-h-screen max-w-7xl mx-auto px-8 py-10 flex flex-col">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.38em] text-cyan-300/80 font-bold">
              Psyqus · Demo institucional
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              Sistema de bienestar organizacional
            </h1>
          </div>

          <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full border border-emerald-400/20 bg-emerald-500/10">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.25em]">
              Sistema activo
            </span>
          </div>
        </header>

        <div className="flex-1 grid lg:grid-cols-[1fr_0.95fr] gap-10 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={scene.title}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.96 }}
              transition={{ duration: 0.7 }}
              className={`rounded-[2.5rem] border ${colors.border} ${colors.bg} ${colors.glow} backdrop-blur-xl p-10 min-h-[520px] flex flex-col justify-center`}
            >
              <motion.div
                initial={{ rotate: -8, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.8 }}
                className={`w-24 h-24 rounded-[2rem] border ${colors.border} bg-white/5 flex items-center justify-center mb-8`}
              >
                <Icon className={`w-12 h-12 ${colors.text}`} />
              </motion.div>

              <p className={`text-sm uppercase tracking-[0.28em] font-bold ${colors.text}`}>
                Escena {index + 1} / {scenes.length}
              </p>

              <h2 className="mt-5 text-6xl font-black tracking-tight leading-[0.95]">
                {scene.title}
              </h2>

              <h3 className={`mt-6 text-2xl font-bold ${colors.text}`}>
                {scene.subtitle}
              </h3>

              <p className="mt-6 text-xl leading-relaxed text-slate-200 max-w-3xl">
                {scene.text}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            {scenes.slice(0, 12).map((item, i) => {
              const ItemIcon = item.icon;
              const active = i === index;
              const c = colorClasses(item.color);

              return (
                <motion.div
                  key={item.title}
                  animate={{
                    opacity: active ? 1 : 0.42,
                    scale: active ? 1.03 : 1,
                    x: active ? -12 : 0,
                  }}
                  transition={{ duration: 0.4 }}
                  className={`rounded-3xl border ${
                    active ? `${c.border} ${c.bg}` : "border-white/10 bg-slate-950/45"
                  } p-4 flex items-center gap-4`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl border ${
                      active ? c.border : "border-white/10"
                    } bg-white/5 flex items-center justify-center shrink-0`}
                  >
                    <ItemIcon className={`w-6 h-6 ${active ? c.text : "text-slate-500"}`} />
                  </div>

                  <div>
                    <p className={`font-bold ${active ? "text-white" : "text-slate-400"}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {item.subtitle}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <footer className="grid md:grid-cols-4 gap-4 mt-4">
          {[
            ["Core", "NOM-035"],
            ["Seguimiento", "Panel profesional"],
            ["Prevención", "Psicoeducación"],
            ["Bienestar", "Mindfulness"],
          ].map(([label, value], i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.12 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-lg font-bold text-cyan-300">
                {value}
              </p>
            </motion.div>
          ))}
        </footer>
      </section>
    </main>
  );
}