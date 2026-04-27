"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BotonReportePDF from "@/components/BotonReportePDF";
import {
  AlertTriangle,
  BarChart3,
  FileText,
  LogOut,
  MessageSquareWarning,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";

type ResultadoEncuesta = {
  id?: string | number;
  user_id?: string | null;
  puntaje_total: number;
  created_at?: string | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  dimensiones?: Record<string, number> | null;
};

type Interaccion = {
  id?: string | number;
  user_id?: string | null;
  tipo?: string | null;
  mensaje?: string | null;
  respuesta?: string | null;
  resumen_riesgo?: string | null;
  created_at?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function inferRiskByScore(score?: number) {
  if (typeof score !== "number") return "bajo";
  if (score >= 50) return "alto";
  if (score >= 30) return "medio";
  return "bajo";
}

function getRiskColor(level?: string | null) {
  const value = (level || "").toLowerCase();

  if (value === "alto") {
    return {
      badge: "bg-red-500/10 text-red-300 border-red-500/20",
      text: "text-red-300",
    };
  }

  if (value === "medio") {
    return {
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      text: "text-amber-300",
    };
  }

  return {
    badge: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    text: "text-emerald-300",
  };
}

function shortText(text?: string | null, max = 180) {
  const clean = (text || "").trim();
  if (!clean) return "Sin contenido legible.";
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max)}...`;
}

export default function PanelPsicologoPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [surveyResults, setSurveyResults] = useState<ResultadoEncuesta[]>([]);
  const [interacciones, setInteracciones] = useState<Interaccion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = sessionStorage.getItem("psicologo_auth");

    if (!auth) {
      router.replace("/psicologo");
      return;
    }

    loadData();
  }, [router]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [surveyResponse, interaccionesResponse] = await Promise.all([
        supabase
          .from("resultados_encuestas")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),

        supabase
          .from("interacciones_psyqus")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30),
      ]);

      if (surveyResponse.error) {
        console.error("Error resultados_encuestas:", surveyResponse.error);
      }

      if (interaccionesResponse.error) {
        console.error("Error interacciones_psyqus:", interaccionesResponse.error);
      }

      setSurveyResults((surveyResponse.data || []) as ResultadoEncuesta[]);
      setInteracciones((interaccionesResponse.data || []) as Interaccion[]);

      if (surveyResponse.error && interaccionesResponse.error) {
        setError("No pude cargar datos del panel profesional.");
      }
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al cargar el panel.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("psicologo_auth");
    router.push("/psicologo");
  }

  const computed = useMemo(() => {
    const surveyWithRisk = surveyResults.map((item) => ({
      ...item,
      riesgo_final: item.riesgo || inferRiskByScore(item.puntaje_total),
    }));

    const surveyHigh = surveyWithRisk.filter(
      (x) => x.riesgo_final === "alto"
    ).length;

    const surveyMedium = surveyWithRisk.filter(
      (x) => x.riesgo_final === "medio"
    ).length;

    const surveyLow = surveyWithRisk.filter(
      (x) => x.riesgo_final === "bajo"
    ).length;

    const avgScore =
      surveyResults.length > 0
        ? Math.round(
            surveyResults.reduce(
              (sum, item) => sum + (item.puntaje_total || 0),
              0
            ) / surveyResults.length
          )
        : 0;

    return {
      surveyHigh,
      surveyMedium,
      surveyLow,
      avgScore,
    };
  }, [surveyResults]);

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,63,94,0.08),transparent_24%),radial-gradient(circle_at_center,rgba(168,85,247,0.08),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:40px_40px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-orange-300 font-semibold mb-4">
                <Shield className="w-4 h-4" />
                Área profesional
              </div>

              <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                Panel del psicólogo
              </h1>

              <p className="mt-3 max-w-3xl text-slate-300">
                Revisión de encuestas, mensajes del buzón e interacciones de IA.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadData}
                className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                Actualizar panel
              </button>

              <BotonReportePDF
                empresa="Empresa evaluada"
                resultados={surveyResults}
                mensajes={interacciones}
              />

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 hover:bg-red-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
                Cerrar acceso
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-5 text-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
            <Users className="w-6 h-6 text-cyan-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Evaluaciones
            </p>
            <p className="mt-2 text-3xl font-black">{surveyResults.length}</p>
          </div>

          <div className="rounded-[1.5rem] border border-red-500/10 bg-slate-950/60 p-5">
            <AlertTriangle className="w-6 h-6 text-red-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Riesgo alto
            </p>
            <p className="mt-2 text-3xl font-black text-red-300">
              {computed.surveyHigh}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-fuchsia-500/10 bg-slate-950/60 p-5">
            <MessageSquareWarning className="w-6 h-6 text-fuchsia-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Interacciones
            </p>
            <p className="mt-2 text-3xl font-black text-fuchsia-300">
              {interacciones.length}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-500/10 bg-slate-950/60 p-5">
            <TrendingUp className="w-6 h-6 text-emerald-300 mb-3" />
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Promedio
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-300">
              {computed.avgScore}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          <div className="rounded-[1.5rem] border border-red-500/10 bg-red-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-red-300 mb-2">
              Alto
            </p>
            <p className="text-3xl font-black text-red-300">
              {computed.surveyHigh}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Evaluaciones recientes que requieren atención prioritaria.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-amber-500/10 bg-amber-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-300 mb-2">
              Medio
            </p>
            <p className="text-3xl font-black text-amber-300">
              {computed.surveyMedium}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Señales preventivas que pueden atenderse antes de escalar.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-500/10 bg-emerald-500/10 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300 mb-2">
              Bajo
            </p>
            <p className="text-3xl font-black text-emerald-300">
              {computed.surveyLow}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              Indicadores estables dentro de las evaluaciones recientes.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-5 h-5 text-fuchsia-300" />
              <h2 className="text-2xl font-bold">Últimas evaluaciones</h2>
            </div>

            {loading ? (
              <div className="text-slate-400">Cargando evaluaciones...</div>
            ) : surveyResults.length === 0 ? (
              <div className="text-slate-400">
                No hay evaluaciones registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {surveyResults.slice(0, 8).map((item, index) => {
                  const level =
                    item.riesgo || inferRiskByScore(item.puntaje_total);
                  const color = getRiskColor(level);

                  return (
                    <div
                      key={item.id ?? `${item.created_at}-${index}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:justify-between">
                        <div className="flex-1">
                          <span
                            className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em] ${color.badge}`}
                          >
                            {level}
                          </span>

                          <p className="mt-3 text-sm leading-relaxed text-slate-300">
                            {item.interpretacion ||
                              "Sin interpretación registrada."}
                          </p>
                        </div>

                        <div className="md:w-40">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                            Puntaje
                          </p>
                          <p className={`mt-1 text-3xl font-black ${color.text}`}>
                            {item.puntaje_total}
                          </p>

                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mt-3">
                            Fecha
                          </p>
                          <p className="mt-1 text-sm text-slate-300">
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/60 p-6">
            <div className="flex items-center gap-3 mb-5">
              <BarChart3 className="w-5 h-5 text-cyan-300" />
              <h2 className="text-2xl font-bold">Mensajes e IA</h2>
            </div>

            {loading ? (
              <div className="text-slate-400">Cargando interacciones...</div>
            ) : interacciones.length === 0 ? (
              <div className="text-slate-400">No hay mensajes recientes.</div>
            ) : (
              <div className="space-y-4">
                {interacciones.slice(0, 12).map((item, index) => (
                  <div
                    key={item.id ?? `${item.created_at}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-cyan-300">
                        {item.tipo || "sin_tipo"}
                      </span>

                      <span className="text-xs text-slate-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mb-2">
                      Mensaje
                    </p>

                    <p className="text-sm leading-relaxed text-slate-200">
                      {shortText(item.mensaje)}
                    </p>

                    {item.respuesta && (
                      <>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500 mt-4 mb-2">
                          Respuesta IA
                        </p>

                        <p className="text-sm leading-relaxed text-slate-300">
                          {shortText(item.respuesta)}
                        </p>
                      </>
                    )}

                    <p className="text-xs text-slate-500 mt-4 break-all">
                      Usuario: {item.user_id || "Sin user_id"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 font-semibold text-white hover:bg-white/10 transition inline-block"
          >
            Volver al dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}