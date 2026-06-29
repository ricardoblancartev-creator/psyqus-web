import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import SignOutAction from "@/components/SignOutAction";
import MapaDeCalor from "@/app/dashboard/components/MapaDeCalor";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutGrid,
  LineChart,
  Shield,
  Sparkles,
  Stethoscope,
  UserRound,
} from "lucide-react";

const modules = [
{
  href: "/encuesta",
  title: "Clima Organizacional",
  description: "Evaluación interna de ambiente laboral, bienestar y percepción del equipo.",
  icon: ClipboardList,
  accent:
    "from-cyan-500/20 to-cyan-500/5 border-cyan-400/20 text-cyan-300",
  badge: "Clima",
},
{
  href: "/nom035",
  title: "NOM-035 Oficial",
  description: "Cuestionario I y II para identificación de factores de riesgo psicosocial.",
  icon: Shield,
  accent:
    "from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-300",
  badge: "Oficial",
},

  {
    href: "/ia",
    title: "Asistente IA",
    description: "Orientación emocional y apoyo sobre clima laboral.",
    icon: Sparkles,
    accent:
      "from-fuchsia-500/20 to-fuchsia-500/5 border-fuchsia-400/20 text-fuchsia-300",
    badge: "Live",
  },
  {
    href: "/buzon",
    title: "Buzón de Paz",
    description: "Canal confidencial y directo al panel profesional.",
    icon: Shield,
    accent:
      "from-amber-500/20 to-amber-500/5 border-amber-400/20 text-amber-300",
    badge: "Seguro",
  },
  {
    href: "/psicoeducacion",
    title: "Psicoeducación",
    description: "Lecciones que se descubren paso a paso.",
    icon: BookOpen,
    accent:
      "from-emerald-500/20 to-emerald-500/5 border-emerald-400/20 text-emerald-300",
    badge: "Nuevo",
  },
  {
    href: "/entrenamiento",
    title: "Entrenamiento",
    description: "Rutas por estaciones y misiones prácticas.",
    icon: GraduationCap,
    accent:
      "from-teal-500/20 to-teal-500/5 border-teal-400/20 text-teal-300",
    badge: "Lab",
  },
  {
    href: "/mindfulness",
    title: "Mindfulness",
    description: "Respiración guiada, sueño, meditación y hábitos de bienestar.",
    icon: Brain,
    accent:
      "from-violet-500/20 to-violet-500/5 border-violet-400/20 text-violet-300",
    badge: "Wellness",
  },
  {
    href: "/resultados",
    title: "Resultados",
    description: "Lectura de evaluaciones, interpretación e historial.",
    icon: LineChart,
    accent:
      "from-sky-500/20 to-sky-500/5 border-sky-400/20 text-sky-300",
    badge: "Panel",
  },
  {
    href: "/perfil",
    title: "Perfil integral",
    description: "Test de estilo personal y modelo BPSE.",
    icon: UserRound,
    accent:
      "from-indigo-500/20 to-indigo-500/5 border-indigo-400/20 text-indigo-300",
    badge: "Insight",
  },
  {
    href: "/panel-psicologo",
    title: "Panel Psicólogo",
    description: "Seguimiento clínico y lectura profesional.",
    icon: Stethoscope,
    accent:
      "from-rose-500/20 to-rose-500/5 border-rose-400/20 text-rose-300",
    badge: "Pro",
  },
  {
    href: "/nom035-resultados",
    title: "Resultados NOM-035",
    description: "Consulta resultados oficiales por cuestionario, área y puesto.",
    icon: LineChart,
    accent:
      "from-teal-500/20 to-teal-500/5 border-teal-400/20 text-teal-300",
    badge: "NOM-035",
  }
];

type Resultado = {
  user_id?: string | null;
  puntaje_total?: number | null;
  created_at?: string | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  dimensiones?: Record<string, number> | null;
};

function riskFromScore(score?: number | null) {
  if (typeof score !== "number") return "bajo";
  if (score >= 50) return "alto";
  if (score >= 30) return "medio";
  return "bajo";
}

function riskStyles(level?: string | null) {
  const risk = (level || "").toLowerCase();

  if (risk === "alto") {
    return {
      label: "Riesgo alto",
      text: "text-red-300",
      badge: "border-red-500/20 bg-red-500/10 text-red-300",
      box: "border-red-500/20 bg-red-500/10",
      glow: "shadow-[0_0_40px_rgba(239,68,68,0.12)]",
    };
  }

  if (risk === "medio") {
    return {
      label: "Riesgo medio",
      text: "text-amber-300",
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      box: "border-amber-500/20 bg-amber-500/10",
      glow: "shadow-[0_0_40px_rgba(245,158,11,0.12)]",
    };
  }

  return {
    label: "Riesgo bajo",
    text: "text-emerald-300",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    box: "border-emerald-500/20 bg-emerald-500/10",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.12)]",
  };
}

function formatDate(date?: string | null) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function nextStepSuggestion(risk?: string | null) {
  const normalized = (risk || "").toLowerCase();

  if (normalized === "alto") {
    return "Tu lectura actual sugiere priorizar acompañamiento, escucha y apoyo profesional. No conviene normalizar este nivel de desgaste.";
  }

  if (normalized === "medio") {
    return "Tu mejor siguiente paso es intervenir temprano: fortalecer comunicación, revisar carga y aprovechar los módulos de Psyqus.";
  }

  return "Tu estado general parece estable. Lo ideal es sostener hábitos preventivos y seguir fortaleciendo bienestar y comunicación.";
}

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) redirect("/sign-in");

  const firstName = user?.firstName || "Usuario";
  const email = user?.emailAddresses?.[0]?.emailAddress || "Sin correo";

  const surveyRes = await supabase
    .from("resultados_encuestas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestSurvey = (surveyRes.data?.[0] || null) as Resultado | null;
  const surveyRisk =
    latestSurvey?.riesgo || riskFromScore(latestSurvey?.puntaje_total);
  const surveyRiskUI = riskStyles(surveyRisk);

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.13),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-8 shadow-[0_0_70px_rgba(0,255,255,0.04)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/20 bg-black/40 shrink-0 shadow-[0_0_25px_rgba(34,211,238,0.10)]">
                <Image
                  src="/logo.jpg"
                  alt="Psyqus"
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 font-semibold mb-2">
                  Psyqus System
                </p>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                  Dashboard
                </h1>
                <p className="mt-3 text-slate-300 text-sm md:text-base max-w-2xl">
                  Bienvenido,{" "}
                  <span className="text-cyan-300 font-semibold">{firstName}</span>.
                  Este espacio está centrado en tu evaluación, tu lectura personal
                  y tus siguientes pasos dentro de Psyqus.
                </p>
                <p className="mt-2 text-sm text-slate-500 italic">{email}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:items-end">
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.10)]">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-semibold text-emerald-300 uppercase tracking-[0.25em]">
                  Sistema activo
                </span>
              </div>

              <SignOutAction />
            </div>
          </div>
        </div>

          <div className="grid xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-8">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 hover:border-cyan-400/15 transition">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-cyan-300" />
                <h2 className="text-2xl font-bold">Tu última evaluación</h2>
              </div>

            {latestSurvey ? (
              <>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] ${surveyRiskUI.badge}`}
                  >
                    {surveyRiskUI.label}
                  </span>
                  <span className="text-sm text-slate-400">
                    {formatDate(latestSurvey.created_at)}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 mb-5">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Puntaje
                    </p>
                    <p className={`mt-2 text-4xl font-black ${surveyRiskUI.text}`}>
                      {latestSurvey.puntaje_total ?? "-"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Riesgo
                    </p>
                    <p
                      className={`mt-2 text-2xl font-black uppercase ${surveyRiskUI.text}`}
                    >
                      {surveyRisk}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Estado
                    </p>
                    <p className="mt-2 text-2xl font-black text-cyan-300">
                      Procesado
                    </p>
                  </div>
                </div>

                <Link
                  href="/resultados"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                >
                  Ver resultados completos
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-slate-300">
                  Aún no hay una evaluación registrada para mostrarte.
                </p>
                <Link
                  href="/encuesta"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
                >
                  Completar evaluación
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div
              className={`rounded-[1.75rem] border p-6 ${surveyRiskUI.box} ${surveyRiskUI.glow}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className={`w-5 h-5 ${surveyRiskUI.text}`} />
                <h2 className={`text-2xl font-bold ${surveyRiskUI.text}`}>
                  Tu interpretación personal
                </h2>
              </div>

<div className={`rounded-3xl border p-6 border-cyan-500/20 bg-cyan-500/10`}>
  <h2 className="text-2xl font-black mb-4">Interpretación general IA</h2>
  <p className="text-slate-200 leading-relaxed">{nextStepSuggestion(surveyRisk)}</p>
</div>


            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6 hover:border-cyan-400/15 transition">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <h2 className="text-2xl font-bold">Siguiente paso sugerido</h2>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {nextStepSuggestion(surveyRisk)}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/psicoeducacion"
                  className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
                >
                  Ir a Psicoeducación
                </Link>

                <Link
                  href="/mindfulness"
                  className="rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3 text-sm font-semibold text-violet-300 hover:bg-violet-500/20 transition"
                >
                  Ir a Mindfulness
                </Link>

                <Link
                  href="/buzon"
                  className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  Abrir Buzón de Paz
                </Link>
              </div>
            </div>
          </div>
        </div>

        {latestSurvey?.dimensiones && (
          <div className="mb-8 rounded-[1.75rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 hover:border-fuchsia-400/15 transition">
            <div className="flex items-center gap-3 mb-5">
              <Brain className="w-5 h-5 text-fuchsia-300" />
              <h2 className="text-2xl font-bold">Mapa de calor personal</h2>
            </div>

            <MapaDeCalor data={latestSurvey.dimensiones} />
          </div>
        )}

        <div className="mb-5 flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-cyan-300" />
          <div>
            <h2 className="text-2xl font-bold">Módulos</h2>
            <p className="text-slate-400 text-sm mt-1">
              Acceso rápido a las funciones principales de Psyqus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group rounded-[1.75rem] border bg-gradient-to-br ${module.accent} bg-slate-950/50 p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_0_45px_rgba(34,211,238,0.08)]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300">
                    {module.badge}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-white">
                  {module.title}
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  {module.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                  Abrir módulo
                  <ArrowRight className="w-4 h-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
        </div>
      </section>
    </main>
  );
}