import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import ClimaOrganizacional from "./ClimaOrganizacional";
import {
  calificarCuestionarioI,
  calificarCuestionarioII,
  type NivelRiesgo,
} from "@/lib/nom035-calificacion";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  HeartPulse,
  Inbox,
  ShieldCheck,
  TrendingDown,
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
    puesto.includes("oficial de caja") ||
    puesto.includes("oficial de cajas") ||
    puesto.includes("ejecutiva") ||
    puesto.includes("ejecutivo de cuenta") ||
    puesto.includes("gestor de cobranza") ||
    puesto.includes("une")
  );
}

function aplicaSubordinados(
  item: any
) {
  const puesto =
    normalizarPuesto(item.puesto);

  return (
    puesto.includes("gerente general") ||
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

function lunesDe(
  fecha: Date
) {
  const day = fecha.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate() + diff
  );

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const date = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

function promedio(
  values: number[]
) {
  const validos = values.filter((value) =>
    Number.isFinite(value)
  );

  if (!validos.length) {
    return null;
  }

  return (
    Math.round(
      (validos.reduce((total, value) => total + value, 0) /
        validos.length) *
        10
    ) / 10
  );
}

function nombreCompleto(
  item: any
) {
  const texto = [item.nombre, item.apellido]
    .filter(Boolean)
    .join(" ")
    .trim();

  return texto || "Sin nombre";
}

function claveMiembro(
  item: any
) {
  return String(
    item.user_id ||
      `${item.nombre || ""}-${item.apellido || ""}`
  )
    .trim()
    .toLocaleLowerCase("es-MX");
}

const NIVELES: {
  nivel: NivelRiesgo;
  corto: string;
  barra: string;
  texto: string;
}[] = [
  { nivel: "Nulo o despreciable", corto: "Nulo", barra: "bg-emerald-400", texto: "text-emerald-300" },
  { nivel: "Bajo", corto: "Bajo", barra: "bg-teal-400", texto: "text-teal-300" },
  { nivel: "Medio", corto: "Medio", barra: "bg-amber-400", texto: "text-amber-300" },
  { nivel: "Alto", corto: "Alto", barra: "bg-orange-500", texto: "text-orange-300" },
  { nivel: "Muy alto", corto: "Muy alto", barra: "bg-rose-500", texto: "text-rose-300" },
];

const ELEVADOS: NivelRiesgo[] = ["Alto", "Muy alto"];

/* =========================================================
   PAGE
========================================================= */

export default async function PanelPsicologoPage() {
  /* =======================================================
     ACCESO PROFESIONAL
  ======================================================= */

  const { userId } = await auth();

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

  /*
   * Todas las lecturas usan SERVICE ROLE
   * (lib/supabase/supabaseAdmin, solo servidor)
   * después de validar el rol con Clerk.
   */

  const hoy = new Date();
  const semanaActual = lunesDe(hoy);
  const semanaAnterior = lunesDe(
    new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 7)
  );
  const haceSieteDias = new Date(
    hoy.getTime() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    nomRes,
    climaRes,
    pulsosRes,
    buzonRes,
    empleadosRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("nom035_evaluaciones")
      .select(
        "user_id, nombre, apellido, area, puesto, tipo_cuestionario, respuestas, created_at"
      ),
    supabaseAdmin
      .from("resultados_encuestas")
      .select("*")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("pulsos_semanales")
      .select("energia, desconexion, apoyo, dificultad, semana_inicio")
      .in("semana_inicio", [semanaActual, semanaAnterior]),
    supabaseAdmin
      .from("interacciones_psyqus")
      .select("created_at")
      .eq("tipo", "buzon")
      .order("created_at", { ascending: false }),
    supabaseAdmin
      .from("empleados")
      .select("user_id", { count: "exact", head: true }),
  ]);

  for (const [nombre, res] of [
    ["NOM-035", nomRes],
    ["clima", climaRes],
    ["pulso", pulsosRes],
    ["buzón", buzonRes],
    ["empleados", empleadosRes],
  ] as const) {
    if (res.error) {
      console.error(`Error leyendo ${nombre} en panel profesional:`, res.error);
    }
  }

  /* =======================================================
     NOM-035 · CUESTIONARIO II (estado general y áreas)
  ======================================================= */

  const nomData = nomRes.data || [];

  const evaluacionesII = nomData
    .filter((item: any) => item.tipo_cuestionario === "II")
    .map((item: any) => ({
      ...item,
      resultado: calificarCuestionarioII(respuestasAplicables(item)),
    }));

  const totalII = evaluacionesII.length;

  const conteoNiveles = NIVELES.map((n) => ({
    ...n,
    cantidad: evaluacionesII.filter(
      (item: any) => item.resultado.nivelFinal === n.nivel
    ).length,
  }));

  const elevados = conteoNiveles
    .filter((n) => ELEVADOS.includes(n.nivel))
    .reduce((total, n) => total + n.cantidad, 0);

  const porcentajeElevado = totalII
    ? Math.round((elevados / totalII) * 100)
    : 0;

  const nivelPredominante = totalII
    ? [...conteoNiveles].sort((a, b) => b.cantidad - a.cantidad)[0]
    : null;

  /* Áreas: cuántos evaluados, cuántos en riesgo alto o muy alto
     y la categoría que más aparece en niveles altos. */
  const areasMapa = new Map<
    string,
    { total: number; elevados: number; categorias: Record<string, number> }
  >();

  for (const item of evaluacionesII as any[]) {
    const area = String(item.area || "Sin área").trim() || "Sin área";
    const registro =
      areasMapa.get(area) || { total: 0, elevados: 0, categorias: {} };

    registro.total += 1;

    if (ELEVADOS.includes(item.resultado.nivelFinal)) {
      registro.elevados += 1;
    }

    for (const categoria of item.resultado.categorias || []) {
      if (ELEVADOS.includes(categoria.nivel)) {
        registro.categorias[categoria.nombre] =
          (registro.categorias[categoria.nombre] || 0) + 1;
      }
    }

    areasMapa.set(area, registro);
  }

  const areas = Array.from(areasMapa.entries())
    .map(([area, info]) => {
      const categoriaPrincipal =
        Object.entries(info.categorias).sort((a, b) => b[1] - a[1])[0]?.[0] ||
        null;

      return {
        area,
        total: info.total,
        elevados: info.elevados,
        porcentaje: info.total
          ? Math.round((info.elevados / info.total) * 100)
          : 0,
        categoriaPrincipal,
      };
    })
    .sort(
      (a, b) =>
        b.porcentaje - a.porcentaje ||
        b.elevados - a.elevados ||
        a.area.localeCompare(b.area, "es-MX")
    );

  const areaPrioritaria = areas.find((a) => a.elevados > 0) || null;

  /* =======================================================
     CASOS A DAR SEGUIMIENTO
     Guía I con criterios de valoración clínica, o
     Guía II con nivel final Alto o Muy alto.
  ======================================================= */

  const casosMapa = new Map<
    string,
    {
      nombre: string;
      area: string;
      puesto: string;
      motivos: { texto: string; tono: "rose" | "orange" | "violet" }[];
      prioridad: number;
    }
  >();

  function agregarCaso(
    item: any,
    motivo: { texto: string; tono: "rose" | "orange" | "violet" },
    prioridad: number
  ) {
    const clave = claveMiembro(item);
    const caso = casosMapa.get(clave) || {
      nombre: nombreCompleto(item),
      area: String(item.area || "Sin área"),
      puesto: String(item.puesto || "Sin puesto"),
      motivos: [],
      prioridad: 0,
    };

    caso.motivos.push(motivo);
    caso.prioridad = Math.max(caso.prioridad, prioridad);
    casosMapa.set(clave, caso);
  }

  for (const item of nomData as any[]) {
    if (item.tipo_cuestionario !== "I") continue;

    const resultado = calificarCuestionarioI(item.respuestas || {});

    if (resultado.requiereValoracionClinica) {
      agregarCaso(
        item,
        { texto: "Guía I: requiere valoración clínica", tono: "violet" },
        3
      );
    }
  }

  for (const item of evaluacionesII as any[]) {
    if (item.resultado.nivelFinal === "Muy alto") {
      agregarCaso(item, { texto: "Riesgo muy alto", tono: "rose" }, 2);
    } else if (item.resultado.nivelFinal === "Alto") {
      agregarCaso(item, { texto: "Riesgo alto", tono: "orange" }, 1);
    }
  }

  const casos = Array.from(casosMapa.values()).sort(
    (a, b) =>
      b.prioridad - a.prioridad ||
      b.motivos.length - a.motivos.length ||
      a.nombre.localeCompare(b.nombre, "es-MX")
  );

  const casosGuiaI = casos.filter((c) =>
    c.motivos.some((m) => m.tono === "violet")
  ).length;

  /* =======================================================
     PULSO SEMANAL Y BUZÓN
  ======================================================= */

  const pulsos = pulsosRes.data || [];
  const pulsosSemana = pulsos.filter(
    (p: any) => p.semana_inicio === semanaActual
  );
  const pulsosPrevios = pulsos.filter(
    (p: any) => p.semana_inicio === semanaAnterior
  );

  const indicadoresPulso = [
    {
      clave: "energia",
      titulo: "Energía",
      pregunta: "¿Cómo estuvo tu energía esta semana?",
    },
    {
      clave: "desconexion",
      titulo: "Desconexión",
      pregunta: "¿Pudiste desconectarte del trabajo al terminar?",
    },
    {
      clave: "apoyo",
      titulo: "Apoyo del equipo",
      pregunta: "¿Te sentiste apoyado por tu equipo?",
    },
  ].map((ind) => {
    const actual = promedio(
      pulsosSemana.map((p: any) => Number(p[ind.clave]))
    );
    const previo = promedio(
      pulsosPrevios.map((p: any) => Number(p[ind.clave]))
    );

    return {
      ...ind,
      actual,
      cambio:
        actual !== null && previo !== null
          ? Math.round((actual - previo) * 10) / 10
          : null,
    };
  });

  const totalEmpleados = empleadosRes.count ?? null;
  const participacion =
    totalEmpleados && totalEmpleados > 0
      ? Math.round((pulsosSemana.length / totalEmpleados) * 100)
      : null;

  const dificultades = Object.entries(
    pulsosSemana.reduce((acc: Record<string, number>, p: any) => {
      const texto = String(p.dificultad || "").trim();

      if (texto && texto !== "Nada en particular") {
        acc[texto] = (acc[texto] || 0) + 1;
      }

      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const buzon = buzonRes.data || [];
  const buzonSemana = buzon.filter(
    (m: any) => m.created_at && m.created_at >= haceSieteDias
  ).length;
  const ultimoBuzon = buzon[0]?.created_at
    ? new Date(buzon[0].created_at).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })
    : null;

  const clima = climaRes.data || [];

  const fechaHoy = hoy.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        {/* ENCABEZADO */}
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Panel del psicólogo
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
                ¿Cómo está la organización?
              </h1>
              <p className="mt-2 text-sm capitalize text-slate-400">
                {fechaHoy}
              </p>
            </div>

            <Link
              href="/nom035-resultados"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-200"
            >
              Ver resultados NOM-035 completos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        {/* RESUMEN EN 4 TARJETAS */}
        <section
          aria-label="Resumen"
          className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <a
            href="#nom035"
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-cyan-400/40"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <ShieldCheck className="h-4 w-4 text-cyan-300" />
              Estado NOM-035
            </div>
            <p className="mt-3 text-3xl font-black">
              {totalII ? `${porcentajeElevado}%` : "—"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {totalII
                ? `en riesgo alto o muy alto, de ${totalII} evaluados`
                : "Aún no hay evaluaciones de la Guía II"}
            </p>
          </a>

          <a
            href="#casos"
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-rose-400/40"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <AlertTriangle className="h-4 w-4 text-rose-300" />
              Casos a dar seguimiento
            </div>
            <p className="mt-3 text-3xl font-black">{casos.length}</p>
            <p className="mt-1 text-sm text-slate-400">
              {casosGuiaI
                ? `${casosGuiaI} con Guía I que requiere valoración clínica`
                : "personas con riesgo alto o Guía I positiva"}
            </p>
          </a>

          <a
            href="#areas"
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-amber-400/40"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Building2 className="h-4 w-4 text-amber-300" />
              Área que atender primero
            </div>
            <p className="mt-3 truncate text-2xl font-black">
              {areaPrioritaria ? areaPrioritaria.area : "Ninguna por ahora"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {areaPrioritaria
                ? `${areaPrioritaria.elevados} de ${areaPrioritaria.total} en riesgo alto o muy alto`
                : "Ningún área tiene personas en riesgo alto"}
            </p>
          </a>

          <a
            href="#pulso"
            className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 transition hover:border-emerald-400/40"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <HeartPulse className="h-4 w-4 text-emerald-300" />
              Pulso y buzón
            </div>
            <p className="mt-3 text-3xl font-black">
              {pulsosSemana.length}
              <span className="text-lg font-bold text-slate-400">
                {" "}
                pulsos
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {buzonSemana} solicitudes de ayuda en los últimos 7 días
            </p>
          </a>
        </section>

        {/* 1. ESTADO GENERAL NOM-035 */}
        <section id="nom035" className="mb-10 scroll-mt-6">
          <SectionTitle
            numero="1"
            titulo="Estado general NOM-035"
            explicacion="Resultado final de la Guía de Referencia II de cada persona evaluada, con la calificación oficial."
          />

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            {totalII ? (
              <>
                <p className="text-lg leading-relaxed text-slate-200">
                  De <strong className="text-white">{totalII} personas evaluadas</strong>,
                  el nivel más frecuente es{" "}
                  <strong className={nivelPredominante?.texto}>
                    {nivelPredominante?.corto.toLowerCase()}
                  </strong>
                  .{" "}
                  {elevados > 0 ? (
                    <>
                      <strong className="text-white">{elevados}</strong>{" "}
                      {elevados === 1 ? "persona está" : "personas están"} en
                      riesgo alto o muy alto ({porcentajeElevado}%).
                    </>
                  ) : (
                    "Nadie está en riesgo alto o muy alto."
                  )}
                </p>

                <div
                  className="mt-6 flex h-5 w-full overflow-hidden rounded-full bg-slate-800"
                  role="img"
                  aria-label="Distribución de niveles de riesgo"
                >
                  {conteoNiveles
                    .filter((n) => n.cantidad > 0)
                    .map((n) => (
                      <div
                        key={n.nivel}
                        className={n.barra}
                        style={{ width: `${(n.cantidad / totalII) * 100}%` }}
                      />
                    ))}
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                  {conteoNiveles.map((n) => (
                    <div
                      key={n.nivel}
                      className="rounded-xl bg-slate-950/60 px-4 py-3"
                    >
                      <dt className="flex items-center gap-2 text-sm text-slate-400">
                        <span className={`h-2.5 w-2.5 rounded-full ${n.barra}`} />
                        {n.corto}
                      </dt>
                      <dd className="mt-1 text-2xl font-black tabular-nums">
                        {n.cantidad}
                        <span className="ml-1 text-sm font-semibold text-slate-500">
                          ({Math.round((n.cantidad / totalII) * 100)}%)
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p className="text-slate-400">
                Todavía no hay evaluaciones de la Guía II registradas.
              </p>
            )}
          </div>
        </section>

        {/* 2. CASOS A DAR SEGUIMIENTO */}
        <section id="casos" className="mb-10 scroll-mt-6">
          <SectionTitle
            numero="2"
            titulo="Casos a dar seguimiento"
            explicacion="Personas con Guía I que alcanza los criterios de valoración clínica, o con riesgo final alto o muy alto en la Guía II. Primero los más urgentes."
          />

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
            {casos.length ? (
              <ul className="divide-y divide-white/5">
                {casos.map((caso, index) => (
                  <li
                    key={`${caso.nombre}-${index}`}
                    className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-white">{caso.nombre}</p>
                      <p className="text-sm text-slate-400">
                        {caso.area} · {caso.puesto}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {caso.motivos.map((motivo) => (
                        <span
                          key={motivo.texto}
                          className={
                            motivo.tono === "violet"
                              ? "rounded-full border border-violet-400/40 bg-violet-500/10 px-3 py-1 text-xs font-bold text-violet-200"
                              : motivo.tono === "rose"
                                ? "rounded-full border border-rose-400/40 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-200"
                                : "rounded-full border border-orange-400/40 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-200"
                          }
                        >
                          {motivo.texto}
                        </span>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-5 text-slate-400">
                No hay casos que cumplan los criterios de seguimiento.
              </p>
            )}

            <div className="border-t border-white/5 bg-slate-950/40 px-6 py-3 text-sm text-slate-400">
              El detalle de respuestas de cada persona está en{" "}
              <Link
                href="/nom035-resultados"
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Resultados NOM-035
              </Link>
              .
            </div>
          </div>
        </section>

        {/* 3. ÁREAS QUE ATENDER */}
        <section id="areas" className="mb-10 scroll-mt-6">
          <SectionTitle
            numero="3"
            titulo="Áreas que atender"
            explicacion="Porcentaje de personas de cada área con riesgo alto o muy alto, y la categoría de la NOM-035 que más se repite en niveles altos."
          />

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            {areas.length ? (
              <ul className="space-y-5">
                {areas.map((a) => (
                  <li key={a.area}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="font-bold text-white">
                        {a.area}
                        <span className="ml-2 text-sm font-normal text-slate-500">
                          {a.total} {a.total === 1 ? "persona" : "personas"}
                          {a.total < 3 ? " · pocas respuestas" : ""}
                        </span>
                      </p>
                      <p className="text-sm tabular-nums text-slate-300">
                        <strong
                          className={
                            a.porcentaje >= 40
                              ? "text-rose-300"
                              : a.porcentaje >= 20
                                ? "text-amber-300"
                                : "text-emerald-300"
                          }
                        >
                          {a.porcentaje}%
                        </strong>{" "}
                        en riesgo alto
                      </p>
                    </div>

                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={
                          a.porcentaje >= 40
                            ? "h-full bg-rose-500"
                            : a.porcentaje >= 20
                              ? "h-full bg-amber-400"
                              : "h-full bg-emerald-400"
                        }
                        style={{ width: `${Math.max(a.porcentaje, 2)}%` }}
                      />
                    </div>

                    {a.categoriaPrincipal && (
                      <p className="mt-2 text-sm text-slate-400">
                        Lo que más pesa:{" "}
                        <span className="font-semibold text-slate-200">
                          {a.categoriaPrincipal}
                        </span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">
                Aún no hay evaluaciones con área registrada.
              </p>
            )}
          </div>
        </section>

        {/* 4. PULSO Y BUZÓN */}
        <section id="pulso" className="mb-10 scroll-mt-6">
          <SectionTitle
            numero="4"
            titulo="Pulso semanal y buzón"
            explicacion="Promedio de esta semana en una escala de 1 a 5, donde 5 es lo mejor, comparado con la semana anterior."
          />

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex items-center gap-2 font-bold">
                  <Users className="h-4 w-4 text-cyan-300" />
                  {pulsosSemana.length}{" "}
                  {pulsosSemana.length === 1 ? "persona respondió" : "personas respondieron"}{" "}
                  esta semana
                </p>
                {participacion !== null && (
                  <p className="text-sm text-slate-400">
                    {participacion}% de {totalEmpleados} registrados
                  </p>
                )}
              </div>

              {pulsosSemana.length ? (
                <ul className="mt-6 space-y-5">
                  {indicadoresPulso.map((ind) => (
                    <li key={ind.clave}>
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-white">{ind.titulo}</p>
                          <p className="text-sm text-slate-500">{ind.pregunta}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 tabular-nums">
                          {ind.cambio !== null && ind.cambio !== 0 && (
                            <span
                              className={
                                ind.cambio > 0
                                  ? "inline-flex items-center gap-1 text-sm font-semibold text-emerald-300"
                                  : "inline-flex items-center gap-1 text-sm font-semibold text-rose-300"
                              }
                            >
                              {ind.cambio > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              {ind.cambio > 0 ? "+" : ""}
                              {ind.cambio}
                            </span>
                          )}
                          <span className="text-2xl font-black">
                            {ind.actual ?? "—"}
                            <span className="text-sm font-semibold text-slate-500">/5</span>
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={
                            (ind.actual ?? 0) >= 4
                              ? "h-full bg-emerald-400"
                              : (ind.actual ?? 0) >= 3
                                ? "h-full bg-amber-400"
                                : "h-full bg-rose-500"
                          }
                          style={{ width: `${((ind.actual ?? 0) / 5) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-slate-400">
                  Nadie ha respondido el pulso esta semana.
                </p>
              )}

              {dificultades.length > 0 && (
                <div className="mt-6 border-t border-white/5 pt-5">
                  <p className="text-sm font-semibold text-slate-300">
                    Lo más difícil esta semana
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {dificultades.map(([texto, cantidad]) => (
                      <span
                        key={texto}
                        className="rounded-full bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
                      >
                        {texto}{" "}
                        <strong className="tabular-nums text-white">{cantidad}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
              <p className="flex items-center gap-2 font-bold">
                <Inbox className="h-4 w-4 text-amber-300" />
                Buzón: pedir ayuda
              </p>
              <p className="mt-5 text-4xl font-black tabular-nums">{buzonSemana}</p>
              <p className="text-sm text-slate-400">
                solicitudes en los últimos 7 días
              </p>
              <dl className="mt-5 space-y-2 border-t border-white/5 pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Total recibidas</dt>
                  <dd className="font-semibold tabular-nums">{buzon.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Última</dt>
                  <dd className="font-semibold">{ultimoBuzon || "—"}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* CLIMA ORGANIZACIONAL (DETALLE) */}
        <section id="clima" className="mb-10 scroll-mt-6">
          <SectionTitle
            numero="5"
            titulo="Clima organizacional"
            explicacion="Resultados de la encuesta de clima, para consultar con más detalle."
          />

          {clima.length ? (
            <ClimaOrganizacional resultados={clima} />
          ) : (
            <p className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-slate-400">
              Aún no hay encuestas de clima registradas.
            </p>
          )}
        </section>

        <footer className="flex items-center gap-2 border-t border-white/5 pt-6 text-sm text-slate-500">
          <ClipboardList className="h-4 w-4" />
          Psyqus orienta y ordena la información; las decisiones clínicas corresponden al profesional.
        </footer>
      </div>
    </main>
  );
}

function SectionTitle({
  numero,
  titulo,
  explicacion,
}: {
  numero: string;
  titulo: string;
  explicacion: string;
}) {
  return (
    <div className="mb-4 flex gap-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-sm font-black text-cyan-300">
        {numero}
      </span>
      <div>
        <h2 className="text-xl font-black md:text-2xl">{titulo}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
          {explicacion}
        </p>
      </div>
    </div>
  );
}
