import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { calificarCuestionarioII } from "@/lib/nom035-calificacion";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  CheckCircle2,
  ClipboardList,
  Gauge,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

/* =========================================================
   HELPERS NOM-035
========================================================= */

function normalizarPuesto(puesto: unknown) {
  return String(puesto || "")
    .trim()
    .toLocaleLowerCase("es-MX");
}

function aplicaClientes(item: any) {
  const puesto = normalizarPuesto(item.puesto);

  return (
    puesto.includes("oficial de caja") ||
    puesto.includes("oficial de cajas") ||
    puesto.includes("ejecutiva") ||
    puesto.includes("ejecutivo de cuenta") ||
    puesto.includes("gestor de cobranza") ||
    puesto.includes("une")
  );
}

function aplicaSubordinados(item: any) {
  const puesto = normalizarPuesto(item.puesto);

  return (
    puesto.includes("gerente general") ||
    puesto === "coordinador" ||
    puesto === "coordinadora"
  );
}

function respuestasAplicables(item: any) {
  const respuestas = {
    ...(item.respuestas || {}),
  };

  if (!aplicaClientes(item)) {
    delete respuestas["41"];
    delete respuestas["42"];
    delete respuestas["43"];
  }

  if (!aplicaSubordinados(item)) {
    delete respuestas["44"];
    delete respuestas["45"];
    delete respuestas["46"];
  }

  return respuestas;
}

function porcentaje(valor: number, total: number) {
  if (!total) return 0;

  return Math.round((valor / total) * 100);
}

function promedio(valores: number[]) {
  if (!valores.length) return null;

  const resultado =
    valores.reduce((acc, valor) => acc + valor, 0) /
    valores.length;

  return Math.round(resultado * 10) / 10;
}

/* =========================================================
   CENTRO PROFESIONAL
========================================================= */

export default async function PsicologoPanelPage() {
  /* =======================================================
     SEGURIDAD
  ======================================================= */

  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  const role = user?.privateMetadata?.role;

  const isProfessional =
    role === "admin" || role === "psicologo";

  if (!isProfessional) {
    redirect("/dashboard");
  }

  /* =======================================================
     SUPABASE AUTENTICADO
  ======================================================= */

  const token = await getToken();

  const supabaseAuthed = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => token,
    }
  );

  /* =======================================================
     NOM-035
  ======================================================= */

  const {
    data: nomData,
    error: nomError,
  } = await supabaseAuthed
    .from("nom035_evaluaciones")
    .select(
      `
        tipo_cuestionario,
        puntaje_total,
        area,
        puesto,
        respuestas
      `
    );

  if (nomError) {
    console.error(
      "Error leyendo NOM-035 en panel profesional:",
      nomError
    );
  }

  const cuestionariosII = (nomData || []).filter(
    (item: any) =>
      item.tipo_cuestionario === "II"
  );

  const evaluacionesNom =
    cuestionariosII.map((item: any) => ({
      ...item,
      resultado: calificarCuestionarioII(
        respuestasAplicables(item)
      ),
    }));

  const totalNom = evaluacionesNom.length;

  const niveles = {
    nulo: evaluacionesNom.filter(
      (item: any) =>
        item.resultado.nivelFinal ===
        "Nulo o despreciable"
    ).length,

    bajo: evaluacionesNom.filter(
      (item: any) =>
        item.resultado.nivelFinal === "Bajo"
    ).length,

    medio: evaluacionesNom.filter(
      (item: any) =>
        item.resultado.nivelFinal === "Medio"
    ).length,

    alto: evaluacionesNom.filter(
      (item: any) =>
        item.resultado.nivelFinal === "Alto"
    ).length,

    muyAlto: evaluacionesNom.filter(
      (item: any) =>
        item.resultado.nivelFinal === "Muy alto"
    ).length,
  };

  const casosElevados =
    niveles.alto + niveles.muyAlto;

  /* =======================================================
     ENCUESTA INTERNA / CLIMA
  ======================================================= */

  const {
    data: climaData,
    error: climaError,
  } = await supabaseAuthed
    .from("resultados_encuestas")
    .select(
      `
        user_id,
        puntaje_total,
        created_at,
        riesgo
      `
    );

  if (climaError) {
    console.error(
      "Error leyendo encuesta interna:",
      climaError
    );
  }

  const totalClima = climaData?.length || 0;

  const climaConRiesgoRegistrado =
    (climaData || []).filter(
      (item: any) =>
        typeof item.riesgo === "string" &&
        item.riesgo.trim().length > 0
    ).length;

  /* =======================================================
     PULSO SEMANAL

     Si las políticas RLS aún no permiten lectura profesional
     agregada, no mostramos datos inventados.
  ======================================================= */

  const {
    data: pulsosData,
    error: pulsosError,
  } = await supabaseAuthed
    .from("pulsos_semanales")
    .select(
      `
        energia,
        desconexion,
        apoyo,
        semana_inicio
      `
    )
    .order("semana_inicio", {
      ascending: false,
    });

  if (pulsosError) {
    console.error(
      "Error leyendo pulsos agregados:",
      pulsosError
    );
  }

  const pulsosDisponibles = !pulsosError;

  const totalPulsos =
    pulsosDisponibles
      ? pulsosData?.length || 0
      : null;

  const promedioEnergia =
    pulsosDisponibles
      ? promedio(
          (pulsosData || []).map(
            (item: any) => item.energia
          )
        )
      : null;

  const promedioDesconexion =
    pulsosDisponibles
      ? promedio(
          (pulsosData || []).map(
            (item: any) => item.desconexion
          )
        )
      : null;

  const promedioApoyo =
    pulsosDisponibles
      ? promedio(
          (pulsosData || []).map(
            (item: any) => item.apoyo
          )
        )
      : null;

  /* =======================================================
     BUZÓN
  ======================================================= */

  const {
    data: buzonData,
    error: buzonError,
  } = await supabaseAuthed
    .from("interacciones_psyqus")
    .select(
      `
        tipo,
        resumen_riesgo
      `
    )
    .eq("tipo", "buzon");

  if (buzonError) {
    console.error(
      "Error leyendo buzón:",
      buzonError
    );
  }

  const buzonDisponible = !buzonError;

  const totalMensajesBuzon =
    buzonDisponible
      ? buzonData?.length || 0
      : null;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* FONDO */}

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.09),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.10),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.04] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-7 md:py-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-black text-emerald-300">
                  Psyqus Professional
                </p>

                <h1 className="text-3xl md:text-4xl font-black">
                  Centro Profesional
                </h1>
              </div>
            </div>

            <p className="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-slate-400">
              Información para comprender,
              prevenir y dar seguimiento al
              bienestar psicosocial de la
              organización.
            </p>
          </div>

          <Link
            href="/nom035-resultados"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3.5 text-sm font-black text-slate-950 hover:bg-emerald-300 transition"
          >
            Abrir NOM-035
            <ArrowRight className="w-4 h-4" />
          </Link>
        </header>

        {/* =================================================
            INDICADORES PRINCIPALES
        ================================================= */}

        <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
            <Users className="w-5 h-5 text-cyan-300" />

            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
              Evaluaciones NOM-035 II
            </p>

            <p className="mt-2 text-4xl font-black">
              {nomError ? "—" : totalNom}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Registros analizados
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
            <ClipboardList className="w-5 h-5 text-fuchsia-300" />

            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
              Evaluaciones internas
            </p>

            <p className="mt-2 text-4xl font-black">
              {climaError ? "—" : totalClima}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Respuestas registradas
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
            <Activity className="w-5 h-5 text-cyan-300" />

            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
              Pulsos registrados
            </p>

            <p className="mt-2 text-4xl font-black">
              {pulsosDisponibles
                ? totalPulsos
                : "—"}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Seguimiento periódico
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
            <MessageCircle className="w-5 h-5 text-amber-300" />

            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-slate-500">
              Buzón
            </p>

            <p className="mt-2 text-4xl font-black">
              {buzonDisponible
                ? totalMensajesBuzon
                : "—"}
            </p>

            <p className="mt-2 text-xs text-slate-600">
              Mensajes registrados
            </p>
          </div>
        </section>

        {/* =================================================
            PANORAMA NOM-035
        ================================================= */}

        <section className="mb-8 rounded-[2rem] border border-emerald-400/15 bg-slate-950/70 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-300">
                <BarChart3 className="w-5 h-5" />

                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  NOM-035
                </p>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-black">
                Panorama psicosocial
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                Distribución calculada a partir
                de las respuestas registradas
                del Cuestionario II mediante el
                motor de calificación de Psyqus.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Alto o muy alto
              </p>

              <p className="mt-2 text-3xl font-black">
                {nomError
                  ? "—"
                  : casosElevados}
              </p>

              {!nomError && (
                <p className="mt-1 text-sm text-slate-500">
                  {porcentaje(
                    casosElevados,
                    totalNom
                  )}
                  % del total
                </p>
              )}
            </div>
          </div>

          {nomError ? (
            <div className="mt-7 rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5">
              <p className="text-sm text-amber-200">
                El panel no pudo consultar los
                registros NOM-035 con la sesión
                profesional actual.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-5">
              {[
                {
                  label: "Nulo o despreciable",
                  value: niveles.nulo,
                },
                {
                  label: "Bajo",
                  value: niveles.bajo,
                },
                {
                  label: "Medio",
                  value: niveles.medio,
                },
                {
                  label: "Alto",
                  value: niveles.alto,
                },
                {
                  label: "Muy alto",
                  value: niveles.muyAlto,
                },
              ].map((nivel) => {
                const pct = porcentaje(
                  nivel.value,
                  totalNom
                );

                return (
                  <div key={nivel.label}>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <p className="text-sm font-semibold text-slate-200">
                        {nivel.label}
                      </p>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                          {nivel.value}
                        </span>

                        <span className="w-12 text-right text-sm font-black">
                          {pct}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2.5 rounded-full overflow-hidden bg-white/5">
                      <div
                        className="h-full bg-emerald-300 rounded-full"
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Link
            href="/nom035-resultados"
            className="mt-8 inline-flex items-center gap-2 text-sm font-black text-emerald-300 hover:text-emerald-200 transition"
          >
            Ver análisis NOM-035 completo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* =================================================
            SEGUIMIENTO CONTINUO
        ================================================= */}

        <section className="mb-8 grid xl:grid-cols-2 gap-6">
          <div className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-300" />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-cyan-300">
                  Seguimiento
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Pulso semanal
                </h2>
              </div>
            </div>

            {pulsosDisponibles ? (
              <>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Lectura agregada de los pulsos
                  disponibles para la sesión
                  profesional.
                </p>

                <div className="mt-6 grid sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Energía
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {promedioEnergia ?? "—"}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      promedio / 5
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Desconexión
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {promedioDesconexion ??
                        "—"}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      promedio / 5
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-slate-500">
                      Apoyo
                    </p>

                    <p className="mt-2 text-2xl font-black">
                      {promedioApoyo ?? "—"}
                    </p>

                    <p className="text-[11px] text-slate-600">
                      promedio / 5
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-sm leading-relaxed text-slate-400">
                  El acceso profesional agregado
                  a los pulsos todavía no está
                  disponible para esta sesión.
                  No se muestran estadísticas
                  sustitutas.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              ENCUESTA INTERNA
          ================================================= */}

          <div className="rounded-[2rem] border border-fuchsia-400/15 bg-slate-950/70 p-6 md:p-8">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-fuchsia-300" />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] font-black text-fuchsia-300">
                  Evaluación interna
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Clima y seguimiento
                </h2>
              </div>
            </div>

            {climaError ? (
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                <p className="text-sm text-slate-400">
                  No fue posible consultar las
                  evaluaciones internas con esta
                  sesión.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Registros
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {totalClima}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Con clasificación
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {climaConRiesgoRegistrado}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-slate-600">
                  Esta sección utiliza únicamente
                  las clasificaciones ya
                  registradas en
                  resultados_encuestas.
                </p>
              </>
            )}
          </div>
        </section>

        {/* =================================================
            GESTIÓN
        ================================================= */}

        <section className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-cyan-300" />

            <div>
              <h2 className="text-2xl font-black">
                Gestión profesional
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Accesos para análisis, seguimiento
                y apoyo.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/nom035-resultados"
              className="group rounded-[1.6rem] border border-emerald-400/15 bg-emerald-500/[0.04] p-6 hover:bg-emerald-500/[0.08] transition"
            >
              <ShieldCheck className="w-6 h-6 text-emerald-300" />

              <h3 className="mt-5 text-lg font-black">
                NOM-035
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Revisa cuestionarios, puntuaciones,
                categorías, dominios y detalle
                técnico.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-emerald-300 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/panel-psicologo"
              className="group rounded-[1.6rem] border border-amber-400/15 bg-amber-500/[0.04] p-6 hover:bg-amber-500/[0.08] transition"
            >
              <HeartHandshake className="w-6 h-6 text-amber-300" />

              <h3 className="mt-5 text-lg font-black">
                Seguimiento humano
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Accede al espacio utilizado para
                revisión y seguimiento profesional.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-amber-300 group-hover:translate-x-1 transition" />
            </Link>

            <div className="rounded-[1.6rem] border border-cyan-400/15 bg-cyan-500/[0.04] p-6">
              <Gauge className="w-6 h-6 text-cyan-300" />

              <h3 className="mt-5 text-lg font-black">
                Inteligencia organizacional
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Aquí integraremos la evolución de
                pulsos, participación y acciones
                preventivas conforme existan datos
                reales suficientes.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4" />
                Sin métricas simuladas
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 pt-6 pb-3">
          <p className="text-xs text-slate-600">
            Psyqus · Centro Profesional ·
            Información basada en registros
            disponibles en la plataforma.
          </p>
        </footer>
      </section>
    </main>
  );
}
