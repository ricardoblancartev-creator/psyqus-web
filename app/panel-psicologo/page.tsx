import { createClient } from "@supabase/supabase-js";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import ClimaOrganizacional from "./ClimaOrganizacional";
import { calificarCuestionarioII } from "@/lib/nom035-calificacion";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  ClipboardList,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

function normalizarPuesto(
  puesto: unknown
) {
  return String(puesto || "")
    .trim()
    .toLocaleLowerCase("es-MX");
}

function aplicaClientes(
  item: any
) {
  const puesto =
    normalizarPuesto(item.puesto);

  return (
    puesto.includes(
      "oficial de caja"
    ) ||
    puesto.includes(
      "oficial de cajas"
    ) ||
    puesto.includes(
      "ejecutiva"
    ) ||
    puesto.includes(
      "ejecutivo de cuenta"
    ) ||
    puesto.includes(
      "gestor de cobranza"
    ) ||
    puesto.includes("une")
  );
}

function aplicaSubordinados(
  item: any
) {
  const puesto =
    normalizarPuesto(item.puesto);

  return (
    puesto.includes(
      "gerente general"
    ) ||
    puesto === "coordinador" ||
    puesto === "coordinadora"
  );
}

function respuestasAplicables(
  item: any
) {
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

function getMonday() {
  const now = new Date();

  const day = now.getDay();

  const diff =
    day === 0
      ? -6
      : 1 - day;

  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + diff
  );

  const year =
    monday.getFullYear();

  const month = String(
    monday.getMonth() + 1
  ).padStart(2, "0");

  const date = String(
    monday.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function promedio(
  values: number[]
) {
  if (!values.length) {
    return null;
  }

  return (
    Math.round(
      (values.reduce(
        (
          total,
          value
        ) => total + value,
        0
      ) /
        values.length) *
        10
    ) / 10
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function PanelPsicologoPage() {
  /* =======================================================
     ACCESO PROFESIONAL
  ======================================================= */

  const {
    userId,
    getToken,
  } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user =
    await currentUser();

  const role =
    user?.privateMetadata?.role;

  const isProfessional =
    role === "admin" ||
    role === "psicologo";

  if (!isProfessional) {
    redirect("/dashboard");
  }

  /* =======================================================
     SUPABASE AUTENTICADO
  ======================================================= */

  const token =
    await getToken();

  const supabaseAuthed =
    createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        accessToken: async () =>
          token,
      }
    );

  /*
   * Este cliente usa SERVICE ROLE.
   *
   * IMPORTANTE:
   * Este archivo es Server Component.
   * La clave NO se envía al navegador.
   *
   * Se utiliza aquí únicamente para
   * obtener agregados profesionales
   * del pulso después de validar el
   * rol del usuario con Clerk.
   */
  const supabaseAdmin =
    createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,
      process.env
        .SUPABASE_SERVICE_ROLE_KEY!
    );

  /* =======================================================
     NOM-035
  ======================================================= */

  const {
    data: nomData,
    error: nomError,
  } = await supabaseAuthed
    .from(
      "nom035_evaluaciones"
    )
    .select(
      `
        tipo_cuestionario,
        area,
        puesto,
        respuestas
      `
    );

  if (nomError) {
    console.error(
      "Error NOM-035:",
      nomError
    );
  }

  const cuestionarioII = (
    nomData || []
  ).filter(
    (item: any) =>
      item.tipo_cuestionario ===
      "II"
  );

  const resultadosNom =
    cuestionarioII.map(
      (item: any) => {
        const resultado =
          calificarCuestionarioII(
            respuestasAplicables(
              item
            )
          );

        return {
          ...item,
          resultado,
        };
      }
    );

  const totalNom =
    resultadosNom.length;

  const niveles = {
    nulo: resultadosNom.filter(
      (item: any) =>
        item.resultado
          .nivelFinal ===
        "Nulo o despreciable"
    ).length,

    bajo: resultadosNom.filter(
      (item: any) =>
        item.resultado
          .nivelFinal ===
        "Bajo"
    ).length,

    medio: resultadosNom.filter(
      (item: any) =>
        item.resultado
          .nivelFinal ===
        "Medio"
    ).length,

    alto: resultadosNom.filter(
      (item: any) =>
        item.resultado
          .nivelFinal ===
        "Alto"
    ).length,

    muyAlto:
      resultadosNom.filter(
        (item: any) =>
          item.resultado
            .nivelFinal ===
          "Muy alto"
      ).length,
  };

  const casosElevados =
    niveles.alto +
    niveles.muyAlto;

  const porcentajeElevado =
    totalNom > 0
      ? Math.round(
          (casosElevados /
            totalNom) *
            100
        )
      : 0;

  /* =======================================================
     CLIMA ORGANIZACIONAL
  ======================================================= */

  const {
    data: resultadosClima,
    error: climaError,
  } = await supabaseAuthed
    .from(
      "resultados_encuestas"
    )
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (climaError) {
    console.error(
      "Error clima:",
      climaError
    );
  }

  const clima =
    resultadosClima || [];

  const totalClima =
    clima.length;

  const totalAreas =
    new Set(
      clima.map(
        (item: any) =>
          item.area ||
          "Sin área"
      )
    ).size;

  /* =======================================================
     PULSO SEMANAL
  ======================================================= */

  const semanaActual =
    getMonday();

  const {
    data: pulsos,
    error: pulsoError,
  } = await supabaseAdmin
    .from(
      "pulsos_semanales"
    )
    .select(
      `
        energia,
        desconexion,
        apoyo,
        dificultad,
        semana_inicio
      `
    )
    .eq(
      "semana_inicio",
      semanaActual
    );

  if (pulsoError) {
    console.error(
      "Error pulso profesional:",
      pulsoError
    );
  }

  const pulseAccess =
    !pulsoError;

  const pulsosSemana =
    pulseAccess
      ? pulsos || []
      : [];

  const energiaPromedio =
    promedio(
      pulsosSemana.map(
        (item: any) =>
          Number(
            item.energia
          )
      )
    );

  const desconexionPromedio =
    promedio(
      pulsosSemana.map(
        (item: any) =>
          Number(
            item.desconexion
          )
      )
    );

  const apoyoPromedio =
    promedio(
      pulsosSemana.map(
        (item: any) =>
          Number(
            item.apoyo
          )
      )
    );

  /* =======================================================
     DIFICULTADES DEL PULSO
  ======================================================= */

  const dificultadesConteo =
    pulsosSemana.reduce(
      (
        acc: Record<
          string,
          number
        >,
        item: any
      ) => {
        const dificultad =
          String(
            item.dificultad ||
              ""
          ).trim();

        if (!dificultad) {
          return acc;
        }

        acc[dificultad] =
          (acc[dificultad] ||
            0) + 1;

        return acc;
      },
      {}
    );

  const dificultadesOrdenadas =
    Object.entries(
      dificultadesConteo
    ).sort(
      (a, b) =>
        b[1] - a[1]
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* FONDO */}

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.11),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_28%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-7 md:py-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>

          <div className="mt-6 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-cyan-300" />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-black text-cyan-300">
                    Psyqus Professional
                  </p>

                  <h1 className="text-3xl md:text-5xl font-black tracking-tight">
                    Centro
                    Profesional
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm md:text-base leading-relaxed text-slate-400">
                Información para
                evaluar, comprender y
                dar seguimiento al
                bienestar psicosocial
                de la organización.
              </p>
            </div>

            <Link
              href="/nom035-resultados"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3.5 text-sm font-black text-slate-950 hover:bg-cyan-200 transition"
            >
              Abrir NOM-035

              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* =================================================
            MENÚ INTERNO
        ================================================= */}

        <nav className="mb-8 overflow-x-auto">
          <div className="min-w-max inline-flex gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
            <a
              href="#panorama"
              className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950"
            >
              Panorama
            </a>

            <a
              href="#nom035"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              NOM-035
            </a>

            <a
              href="#pulso"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              Seguimiento
            </a>

            <a
              href="#clima"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5"
            >
              Clima
            </a>
          </div>
        </nav>

        {/* =================================================
            PANORAMA
        ================================================= */}

        <section
          id="panorama"
          className="mb-8 scroll-mt-6"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="w-5 h-5" />

              <p className="text-xs font-black uppercase tracking-[0.22em]">
                Panorama
              </p>
            </div>

            <h2 className="mt-2 text-2xl md:text-3xl font-black">
              Estado de la
              organización
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* NOM */}

            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />

              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-slate-500">
                NOM-035 II
              </p>

              <p className="mt-2 text-4xl font-black">
                {nomError
                  ? "—"
                  : totalNom}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                evaluaciones
                registradas
              </p>
            </div>

            {/* CLIMA */}

            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
              <ClipboardList className="w-5 h-5 text-fuchsia-300" />

              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-slate-500">
                Evaluación interna
              </p>

              <p className="mt-2 text-4xl font-black">
                {climaError
                  ? "—"
                  : totalClima}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                respuestas
                registradas
              </p>
            </div>

            {/* ÁREAS */}

            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
              <Users className="w-5 h-5 text-indigo-300" />

              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-slate-500">
                Áreas
              </p>

              <p className="mt-2 text-4xl font-black">
                {climaError
                  ? "—"
                  : totalAreas}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                representadas en
                clima
              </p>
            </div>

            {/* PULSO */}

            <div className="rounded-[1.7rem] border border-white/10 bg-slate-950/70 p-5">
              <Activity className="w-5 h-5 text-cyan-300" />

              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-slate-500">
                Pulso semanal
              </p>

              <p className="mt-2 text-4xl font-black">
                {pulseAccess
                  ? pulsosSemana.length
                  : "—"}
              </p>

              <p className="mt-2 text-xs text-slate-600">
                registros esta
                semana
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            NOM-035
        ================================================= */}

        <section
          id="nom035"
          className="mb-8 rounded-[2rem] border border-emerald-400/15 bg-slate-950/70 p-6 md:p-8 scroll-mt-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-300">
                <BarChart3 className="w-5 h-5" />

                <p className="text-xs font-black uppercase tracking-[0.22em]">
                  NOM-035
                </p>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-black">
                Panorama
                psicosocial
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-400 max-w-2xl">
                Distribución
                calculada con las
                respuestas reales
                del Cuestionario II
                registradas en
                Psyqus.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 min-w-[190px]">
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
                  {
                    porcentajeElevado
                  }
                  % del total
                </p>
              )}
            </div>
          </div>

          {nomError ? (
            <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-5">
              <p className="text-sm text-amber-200">
                No fue posible
                consultar las
                evaluaciones
                NOM-035 con esta
                sesión
                profesional.
              </p>
            </div>
          ) : (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                {
                  label:
                    "Nulo o despreciable",
                  value:
                    niveles.nulo,
                },
                {
                  label: "Bajo",
                  value:
                    niveles.bajo,
                },
                {
                  label: "Medio",
                  value:
                    niveles.medio,
                },
                {
                  label: "Alto",
                  value:
                    niveles.alto,
                },
                {
                  label:
                    "Muy alto",
                  value:
                    niveles.muyAlto,
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.label
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"
                  >
                    <p className="text-xs text-slate-500">
                      {
                        item.label
                      }
                    </p>

                    <p className="mt-3 text-3xl font-black">
                      {
                        item.value
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {totalNom >
                      0
                        ? Math.round(
                            (item.value /
                              totalNom) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </div>
                )
              )}
            </div>
          )}

          <Link
            href="/nom035-resultados"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300 transition"
          >
            Ver análisis completo

            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* =================================================
            PULSO SEMANAL
        ================================================= */}

        <section
          id="pulso"
          className="mb-8 rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-6 md:p-8 scroll-mt-6"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-cyan-300" />

            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-black text-cyan-300">
                Seguimiento
                continuo
              </p>

              <h2 className="mt-1 text-2xl md:text-3xl font-black">
                Pulso semanal
              </h2>
            </div>
          </div>

          {pulseAccess ? (
            <>
              <p className="mt-4 text-sm text-slate-400 max-w-3xl">
                Lectura agregada
                de los registros
                disponibles de esta
                semana. No
                corresponde a una
                evaluación NOM-035
                ni a un diagnóstico
                psicológico.
              </p>

              {/* MÉTRICAS */}

              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* PARTICIPACIÓN */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Participación
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {
                      pulsosSemana.length
                    }
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    pulsos
                    registrados
                  </p>
                </div>

                {/* ENERGÍA */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Energía
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {energiaPromedio ??
                      "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    promedio / 5
                  </p>
                </div>

                {/* DESCONEXIÓN */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Desconexión
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {desconexionPromedio ??
                      "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    promedio / 5
                  </p>
                </div>

                {/* APOYO */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    Apoyo
                  </p>

                  <p className="mt-2 text-3xl font-black">
                    {apoyoPromedio ??
                      "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    promedio / 5
                  </p>
                </div>
              </div>

              {/* =============================================
                  LO MÁS DIFÍCIL
              ============================================= */}

              {dificultadesOrdenadas.length >
                0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-cyan-300 font-black">
                        Señales de la
                        semana
                      </p>

                      <h3 className="mt-2 text-xl font-black">
                        Lo más difícil
                        esta semana
                      </h3>
                    </div>

                    <p className="text-xs text-slate-600">
                      Basado únicamente
                      en los pulsos
                      registrados.
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {dificultadesOrdenadas.map(
                      ([
                        dificultad,
                        cantidad,
                      ]) => {
                        const porcentaje =
                          pulsosSemana.length >
                          0
                            ? Math.round(
                                (cantidad /
                                  pulsosSemana.length) *
                                  100
                              )
                            : 0;

                        return (
                          <div
                            key={
                              dificultad
                            }
                            className="rounded-xl border border-white/10 bg-slate-950/50 p-4"
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-200">
                                  {
                                    dificultad
                                  }
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {
                                    porcentaje
                                  }
                                  % de los
                                  pulsos de
                                  esta semana
                                </p>
                              </div>

                              <div className="min-w-[48px] h-12 rounded-xl border border-cyan-400/15 bg-cyan-500/[0.06] flex items-center justify-center">
                                <span className="text-lg font-black text-cyan-300">
                                  {
                                    cantidad
                                  }
                                </span>
                              </div>
                            </div>

                            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div
                                className="h-full rounded-full bg-cyan-300 transition-all"
                                style={{
                                  width: `${porcentaje}%`,
                                }}
                              />
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              {/* SIN RESPUESTAS DE DIFICULTAD */}

              {pulsosSemana.length >
                0 &&
                dificultadesOrdenadas.length ===
                  0 && (
                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-sm text-slate-400">
                      Hay pulsos
                      registrados esta
                      semana, pero no se
                      registraron
                      respuestas en
                      “qué fue lo más
                      difícil”.
                    </p>
                  </div>
                )}

              {/* SIN PULSOS */}

              {pulsosSemana.length ===
                0 && (
                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                  <p className="text-sm text-slate-400">
                    Todavía no hay
                    pulsos registrados
                    durante la semana
                    actual.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-sm leading-relaxed text-slate-400">
                No fue posible
                consultar los
                agregados del pulso
                semanal. Psyqus no
                mostrará estadísticas
                sustitutas.
              </p>
            </div>
          )}
        </section>

        {/* =================================================
            CLIMA
        ================================================= */}

        <section
          id="clima"
          className="mb-8 scroll-mt-6"
        >
          <div className="mb-5">
            <div className="flex items-center gap-2 text-fuchsia-300">
              <Brain className="w-5 h-5" />

              <p className="text-xs font-black uppercase tracking-[0.22em]">
                Evaluación interna
              </p>
            </div>

            <h2 className="mt-2 text-2xl md:text-3xl font-black">
              Clima y experiencia
              laboral
            </h2>

            <p className="mt-2 text-sm text-slate-500 max-w-3xl">
              Análisis por
              pregunta, área y
              puesto utilizando
              únicamente las
              respuestas
              registradas en
              resultados_encuestas.
            </p>
          </div>

          {climaError ? (
            <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.05] p-5">
              <p className="text-sm text-amber-200">
                No fue posible
                consultar los
                resultados de la
                evaluación interna.
              </p>
            </div>
          ) : (
            <ClimaOrganizacional
              resultados={
                clima
              }
            />
          )}
        </section>

        {/* =================================================
            ACCIONES
        ================================================= */}

        <section className="mb-8 grid md:grid-cols-3 gap-4">
          {/* NOM */}

          <Link
            href="/nom035-resultados"
            className="group rounded-[1.7rem] border border-emerald-400/15 bg-emerald-500/[0.04] p-6 hover:bg-emerald-500/[0.08] transition"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-300" />

            <h3 className="mt-5 text-lg font-black">
              NOM-035 detallada
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Revisa
              colaboradores,
              puntuaciones,
              categorías,
              dominios y
              respuestas.
            </p>

            <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-emerald-300 group-hover:translate-x-1 transition" />
          </Link>

          {/* APOYO HUMANO */}

          <div className="rounded-[1.7rem] border border-amber-400/15 bg-amber-500/[0.04] p-6">
            <HeartHandshake className="w-6 h-6 text-amber-300" />

            <h3 className="mt-5 text-lg font-black">
              Apoyo humano
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              El Buzón se
              mantiene separado
              del Orientador de
              IA. Después
              conectaremos aquí
              la revisión
              profesional de
              mensajes reales.
            </p>
          </div>

          {/* INTELIGENCIA */}

          <div className="rounded-[1.7rem] border border-violet-400/15 bg-violet-500/[0.04] p-6">
            <MessageCircle className="w-6 h-6 text-violet-300" />

            <h3 className="mt-5 text-lg font-black">
              Inteligencia
              organizacional
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Aquí crecerá el
              análisis de
              evolución,
              participación y
              acciones conforme
              Psyqus acumule
              información real
              suficiente.
            </p>
          </div>
        </section>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="border-t border-white/10 pt-6 pb-3">
          <p className="text-xs text-slate-600">
            Psyqus · Centro
            Profesional ·
            Información basada
            en registros
            disponibles en la
            plataforma.
          </p>
        </footer>
      </section>
    </main>
  );
}