import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";

type ResultadoEncuesta = {
  id?: string | number;
  user_id?: string | null;
  puntaje_total: number;
  created_at?: string;
  riesgo?: string | null;
  interpretacion?: string | null;
  dimensiones?: Record<string, number> | null;
  respuestas?: Record<string, number> | null;
};

function getRiskVisual(riesgo?: string | null, puntaje?: number) {
  const level =
    riesgo ||
    (typeof puntaje === "number"
      ? puntaje >= 50
        ? "alto"
        : puntaje >= 30
        ? "medio"
        : "bajo"
      : "bajo");

  if (level === "alto") {
    return {
      label: "Riesgo alto",
      icon: ShieldAlert,
      className: "border-red-500/20 bg-red-500/10 text-red-200",
      accent: "text-red-300",
      bar: "from-red-400 to-rose-500",
      summary:
        "Se observan indicadores de tensión importante. Conviene priorizar seguimiento humano, revisión de liderazgo, carga y seguridad emocional.",
    };
  }

  if (level === "medio") {
    return {
      label: "Riesgo medio",
      icon: AlertTriangle,
      className: "border-amber-500/20 bg-amber-500/10 text-amber-100",
      accent: "text-amber-300",
      bar: "from-amber-400 to-orange-500",
      summary:
        "Hay focos de atención que pueden crecer si no se intervienen. El momento preventivo sigue abierto.",
    };
  }

  return {
    label: "Riesgo bajo",
    icon: CheckCircle2,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-100",
    accent: "text-emerald-300",
    bar: "from-emerald-400 to-cyan-500",
    summary:
      "La lectura general parece estable, aunque sigue siendo útil reforzar hábitos preventivos y monitoreo continuo.",
  };
}

function formatDate(date?: string) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeDimensiones(
  dimensiones?: Record<string, number> | null
): [string, number][] {
  if (!dimensiones || typeof dimensiones !== "object") return [];
  return Object.entries(dimensiones).sort((a, b) => b[1] - a[1]);
}

export default async function ResultadosPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { data, error } = await supabase
    .from("resultados_encuestas")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const resultados = (data || []) as ResultadoEncuesta[];
  const latest = resultados[0];

  if (error) {
    return (
      <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
        <div className="max-w-4xl mx-auto rounded-[2rem] border border-red-500/20 bg-red-500/10 p-6">
          <h1 className="text-3xl font-black text-red-300">Resultados</h1>
          <p className="mt-3 text-red-100">
            No pude leer tus resultados desde Supabase.
          </p>
          <pre className="mt-4 text-xs text-red-200 whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>
      </main>
    );
  }

  if (!latest) {
    return (
      <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
        <section className="relative max-w-5xl mx-auto px-6 py-10">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8">
            <h1 className="text-4xl font-black">Resultados</h1>
            <p className="mt-4 text-slate-300">
              Aún no tienes evaluaciones guardadas. Completa primero la encuesta.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const visual = getRiskVisual(latest.riesgo, latest.puntaje_total);
  const VisualIcon = visual.icon;
  const dimensiones = normalizeDimensiones(latest.dimensiones);
  const percent = Math.min(100, Math.round((latest.puntaje_total / 80) * 100));

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.11),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <ClipboardList className="w-7 h-7 text-cyan-300" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold mb-2">
                Psyqus Results Engine
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Mis resultados
              </h1>
              <p className="mt-3 text-slate-300 max-w-3xl">
                Aquí ves únicamente tus propias evaluaciones e interpretaciones.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="space-y-6">
            <div className={`rounded-[1.75rem] border p-6 ${visual.className}`}>
              <div className="flex items-center gap-3 mb-4">
                <VisualIcon className={`w-5 h-5 ${visual.accent}`} />
                <h2 className={`text-2xl font-bold ${visual.accent}`}>
                  {visual.label}
                </h2>
              </div>

              <p className="leading-relaxed">{visual.summary}</p>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Puntaje total
                  </p>
                  <p className="mt-2 text-4xl font-black text-white">
                    {latest.puntaje_total}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Riesgo
                  </p>
                  <p className="mt-2 text-3xl font-black uppercase text-white">
                    {latest.riesgo || visual.label.replace("Riesgo ", "")}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                    Fecha
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white leading-relaxed">
                    {formatDate(latest.created_at)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-300">Intensidad general</span>
                  <span className="text-white font-semibold">{percent}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${visual.bar}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-5 h-5 text-fuchsia-300" />
                <h3 className="text-2xl font-bold">Interpretación</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {latest.interpretacion || "Aún no hay interpretación guardada para este resultado."}
              </p>

              <div className="mt-8 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 text-xs text-cyan-200">
                <p>
                  Interpretación generada dentro del marco metodológico de Psyqus.
                </p>
                <p className="mt-1 opacity-80">
                  Revisión metodológica orientada por la Mtra. Esperanza Prieto,
                  especialista en NOM-035, cédula profesional XXXXX.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-cyan-300" />
                <h3 className="text-2xl font-bold">Historial personal</h3>
              </div>

              <div className="space-y-3">
                {resultados.map((item, index) => {
                  const rowVisual = getRiskVisual(item.riesgo, item.puntaje_total);
                  return (
                    <div
                      key={item.id ?? `${item.created_at}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          Evaluación #{resultados.length - index}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {formatDate(item.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-300">
                          {rowVisual.label}
                        </span>
                        <span className="text-2xl font-black text-cyan-300">
                          {item.puntaje_total}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-emerald-300" />
                <h3 className="text-2xl font-bold">Dimensiones dominantes</h3>
              </div>

              {dimensiones.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  Este resultado no trae dimensiones detalladas todavía.
                </p>
              ) : (
                <div className="space-y-4">
                  {dimensiones.map(([name, value]) => {
                    const barWidth = Math.min(100, Math.round((value / 12) * 100));
                    return (
                      <div
                        key={name}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-white">{name}</p>
                          <p className="text-xl font-black text-cyan-300">{value}</p>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
                <h3 className="text-2xl font-bold">Lectura breve</h3>
              </div>

              <p className="text-slate-300 leading-relaxed">
                {latest.riesgo === "alto"
                  ? "Tu resultado sugiere que conviene no dejar esto solo como dato. Sería útil apoyarte en recursos de escucha, acompañamiento y seguimiento."
                  : latest.riesgo === "medio"
                  ? "Tu lectura muestra una franja preventiva importante. Intervenir temprano puede ayudarte bastante."
                  : "Tu resultado es relativamente favorable, aunque sigue siendo valioso mantener hábitos de prevención y comunicación sana."}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}