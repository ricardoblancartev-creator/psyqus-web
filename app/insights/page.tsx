import { supabase } from "@/lib/supabase";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Brain,
  ChartNoAxesCombined,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

type ResultadoEncuesta = {
  id?: string | number;
  puntaje_total: number;
  created_at?: string | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  dimensiones?: Record<string, number> | null;
};

type BuzonMensaje = {
  id?: string | number;
  mensaje?: string | null;
  respuesta?: string | null;
  riesgo?: string | null;
  created_at?: string | null;
};

function inferRisk(score?: number | null) {
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
      bar: "from-red-400 to-rose-500",
    };
  }

  if (risk === "medio") {
    return {
      label: "Riesgo medio",
      text: "text-amber-300",
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-300",
      bar: "from-amber-400 to-orange-500",
    };
  }

  return {
    label: "Riesgo bajo",
    text: "text-emerald-300",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    bar: "from-emerald-400 to-cyan-500",
  };
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export default async function InsightsPage() {
  const [surveyRes, buzonRes] = await Promise.all([
    supabase
      .from("resultados_encuestas")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("buzon_mensajes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const surveyData = (surveyRes.data || []) as ResultadoEncuesta[];
  const buzonData = (buzonRes.data || []) as BuzonMensaje[];

  const surveyWithRisk = surveyData.map((item) => ({
    ...item,
    riesgo_final: (item.riesgo || inferRisk(item.puntaje_total)).toLowerCase(),
  }));

  const totalEvaluaciones = surveyWithRisk.length;
  const totalMensajes = buzonData.length;

  const riesgoAlto = surveyWithRisk.filter((x) => x.riesgo_final === "alto").length;
  const riesgoMedio = surveyWithRisk.filter((x) => x.riesgo_final === "medio").length;
  const riesgoBajo = surveyWithRisk.filter((x) => x.riesgo_final === "bajo").length;

  const promedio =
    totalEvaluaciones > 0
      ? Math.round(
          surveyWithRisk.reduce((sum, item) => sum + (item.puntaje_total || 0), 0) /
            totalEvaluaciones
        )
      : 0;

  const buzonCritico = buzonData.filter(
    (item) => (item.riesgo || "").toLowerCase() === "alto"
  ).length;

  const dimensionesMap: Record<string, number> = {};

  surveyWithRisk.forEach((item) => {
    if (item.dimensiones && typeof item.dimensiones === "object") {
      Object.entries(item.dimensiones).forEach(([key, value]) => {
        dimensionesMap[key] = (dimensionesMap[key] || 0) + Number(value || 0);
      });
    }
  });

  const topDimensiones = Object.entries(dimensionesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const dominantRisk =
    riesgoAlto >= riesgoMedio && riesgoAlto >= riesgoBajo
      ? "alto"
      : riesgoMedio >= riesgoBajo
      ? "medio"
      : "bajo";

  const dominantRiskUI = riskStyles(dominantRisk);

  const executiveSummary =
    dominantRisk === "alto"
      ? "El sistema muestra una concentración importante de señales de riesgo alto. La prioridad debería centrarse en intervención, seguimiento humano y revisión de liderazgo, carga y clima."
      : dominantRisk === "medio"
      ? "La lectura general muestra una franja preventiva sensible. El sistema aún tiene margen de mejora sin estar plenamente en crisis, pero requiere atención estratégica."
      : "La lectura general se mantiene relativamente estable. Aun así, la mejor práctica es sostener prevención, monitoreo y hábitos de comunicación saludable.";

  const mainDimension = topDimensiones[0]?.[0] || "Sin datos";

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center">
              <ChartNoAxesCombined className="w-7 h-7 text-cyan-300" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 font-semibold mb-2">
                Psyqus Executive Layer
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Insights
              </h1>
              <p className="mt-3 text-slate-300 max-w-3xl">
                Lectura ejecutiva del estado psicosocial, tendencias de riesgo y
                focos principales detectados por la plataforma.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <Users className="w-6 h-6 text-cyan-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Evaluaciones
            </p>
            <p className="mt-2 text-3xl font-black">{totalEvaluaciones}</p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-500/10 bg-slate-950/60 p-5">
            <ShieldCheck className="w-6 h-6 text-emerald-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Riesgo bajo
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-300">{riesgoBajo}</p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-500/10 bg-slate-950/60 p-5">
            <Brain className="w-6 h-6 text-amber-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Riesgo medio
            </p>
            <p className="mt-2 text-3xl font-black text-amber-300">{riesgoMedio}</p>
          </div>

          <div className="rounded-[1.5rem] border border-red-500/10 bg-slate-950/60 p-5">
            <AlertTriangle className="w-6 h-6 text-red-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Riesgo alto
            </p>
            <p className="mt-2 text-3xl font-black text-red-300">{riesgoAlto}</p>
          </div>

          <div className="rounded-[1.5rem] border border-fuchsia-500/10 bg-slate-950/60 p-5">
            <MessageSquareWarning className="w-6 h-6 text-fuchsia-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Buzón crítico
            </p>
            <p className="mt-2 text-3xl font-black text-fuchsia-300">{buzonCritico}</p>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1.08fr_0.92fr] gap-6 mb-8">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <h2 className="text-2xl font-bold">Lectura ejecutiva</h2>
            </div>

            <div className={`rounded-2xl border p-5 ${dominantRiskUI.badge}`}>
              <p className="text-xs uppercase tracking-[0.24em] opacity-80">
                Estado dominante
              </p>
              <p className={`mt-2 text-3xl font-black ${dominantRiskUI.text}`}>
                {dominantRiskUI.label}
              </p>
              <p className="mt-4 text-slate-100 leading-relaxed">
                {executiveSummary}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Promedio general
                </p>
                <p className="mt-2 text-4xl font-black text-cyan-300">{promedio}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Dimensión dominante
                </p>
                <p className="mt-2 text-xl font-black text-white">{mainDimension}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Mensajes totales
                </p>
                <p className="mt-2 text-4xl font-black text-fuchsia-300">{totalMensajes}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-300" />
              <h2 className="text-2xl font-bold">Distribución de riesgo</h2>
            </div>

            <div className="space-y-5">
              {[
                { label: "Bajo", value: riesgoBajo, total: totalEvaluaciones, styles: riskStyles("bajo") },
                { label: "Medio", value: riesgoMedio, total: totalEvaluaciones, styles: riskStyles("medio") },
                { label: "Alto", value: riesgoAlto, total: totalEvaluaciones, styles: riskStyles("alto") },
              ].map((item) => {
                const width = percent(item.value, item.total);
                return (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                      <span className={`text-sm font-bold ${item.styles.text}`}>
                        {item.value} · {width}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.styles.bar}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300 leading-relaxed">
                Esta lectura permite detectar si Psyqus está viendo una organización
                estable, preventivamente sensible o ya en una franja de riesgo alto.
              </p>
            </div>
          </div>
        </div>

        <div className="grid xl:grid-cols-[1fr_1fr] gap-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              <h2 className="text-2xl font-bold">Dimensiones dominantes</h2>
            </div>

            {topDimensiones.length === 0 ? (
              <p className="text-slate-400">
                Aún no hay suficientes evaluaciones con dimensiones detalladas.
              </p>
            ) : (
              <div className="space-y-4">
                {topDimensiones.map(([name, value]) => {
                  const width = Math.min(100, Math.round((value / 60) * 100));
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
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <Activity className="w-5 h-5 text-cyan-300" />
              <h2 className="text-2xl font-bold">Lectura estratégica</h2>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-relaxed text-slate-300">
                  {riesgoAlto > 0
                    ? "Ya hay casos en franja alta, así que el sistema necesita seguimiento más clínico y no solo preventivo."
                    : "No hay masa crítica de riesgo alto en este corte, lo cual da margen para enfoque preventivo y organizacional."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-relaxed text-slate-300">
                  {buzonCritico > 0
                    ? "El Buzón de Paz ya está captando casos sensibles; eso sugiere que la plataforma puede funcionar como canal real de alerta."
                    : "El buzón aún no refleja alta criticidad. Puede ser estabilidad real o subregistro; conviene observarlo."}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-relaxed text-slate-300">
                  La dimensión más cargada ahora es{" "}
                  <span className="text-cyan-300 font-semibold">{mainDimension}</span>.
                  Esa es la mejor pista para decidir si la intervención debe ir hacia
                  carga, liderazgo, reconocimiento, ambiente u otra zona.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}