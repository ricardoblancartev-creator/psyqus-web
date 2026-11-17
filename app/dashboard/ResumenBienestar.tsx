import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import SignOutAction from "@/components/SignOutAction";
import PerfilBienestar from "@/components/PerfilBienestar";
import MapaDeCalor from "@/app/dashboard/components/MapaDeCalor";
import { calificarCuestionarioII } from "@/lib/nom035-calificacion";

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Gamepad2,
  HeartHandshake,
  MessageCircle,
  Moon,
  Shield,
  Stethoscope,
  UserRound,
  Users,
  Wind,
} from "lucide-react";

/* =========================================================
   TIPOS
========================================================= */

type Resultado = {
  user_id?: string | null;
  puntaje_total?: number | null;
  created_at?: string | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  dimensiones?: Record<string, number> | null;
};

/* =========================================================
   HELPERS
========================================================= */

function riskStyles(level?: string | null) {
  const risk = String(level || "")
    .trim()
    .toLocaleLowerCase("es-MX");

  if (risk === "muy alto") {
    return {
      label: "Riesgo muy alto",
      text: "text-red-300",
      badge:
        "border-red-500/20 bg-red-500/10 text-red-300",
    };
  }

  if (risk === "alto") {
    return {
      label: "Riesgo alto",
      text: "text-orange-300",
      badge:
        "border-orange-500/20 bg-orange-500/10 text-orange-300",
    };
  }

  if (risk === "medio") {
    return {
      label: "Riesgo medio",
      text: "text-amber-300",
      badge:
        "border-amber-500/20 bg-amber-500/10 text-amber-300",
    };
  }

  if (risk === "bajo") {
    return {
      label: "Riesgo bajo",
      text: "text-emerald-300",
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    };
  }

  if (
    risk === "nulo" ||
    risk === "nulo o despreciable"
  ) {
    return {
      label: "Nulo o despreciable",
      text: "text-emerald-300",
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    };
  }

  return {
    label: "Sin clasificación registrada",
    text: "text-slate-300",
    badge:
      "border-white/10 bg-white/5 text-slate-300",
  };
}

function formatDate(date?: string | null) {
  if (!date) {
    return "Sin fecha registrada";
  }

  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* =========================================================
   APLICABILIDAD HISTÓRICA NOM-035

   Los registros históricos no guardaron las preguntas filtro
   de los reactivos 41-46.

   Esto conserva el criterio retrospectivo ya utilizado por
   Psyqus y NO sustituye las preguntas filtro en evaluaciones
   nuevas.
========================================================= */

function normalizarPuestoDashboard(puesto: unknown) {
  return String(puesto || "")
    .trim()
    .toLocaleLowerCase("es-MX");
}

function aplicaClientesDashboard(item: any) {
  const puesto = normalizarPuestoDashboard(item.puesto);

  return (
    puesto.includes("oficial de caja") ||
    puesto.includes("oficial de cajas") ||
    puesto.includes("ejecutiva") ||
    puesto.includes("ejecutivo de cuenta") ||
    puesto.includes("gestor de cobranza") ||
    puesto.includes("une")
  );
}

function aplicaSubordinadosDashboard(item: any) {
  const puesto = normalizarPuestoDashboard(item.puesto);

  return (
    puesto.includes("gerente general") ||
    puesto === "coordinador" ||
    puesto === "coordinadora"
  );
}

function respuestasAplicablesDashboard(item: any) {
  const respuestas = {
    ...(item.respuestas || {}),
  };

  if (!aplicaClientesDashboard(item)) {
    delete respuestas["41"];
    delete respuestas["42"];
    delete respuestas["43"];
  }

  if (!aplicaSubordinadosDashboard(item)) {
    delete respuestas["44"];
    delete respuestas["45"];
    delete respuestas["46"];
  }

  return respuestas;
}

/* =========================================================
   DASHBOARD
========================================================= */

export default async function DashboardPage() {
  /* =======================================================
     AUTENTICACIÓN
  ======================================================= */

  const { userId, getToken } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();

  const role = user?.privateMetadata?.role;

  const isProfessional =
    role === "admin" || role === "psicologo";

  /* =======================================================
     SUPABASE + CLERK
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
     PERFIL DEL EMPLEADO
  ======================================================= */

  const {
    data: empleado,
    error: empleadoError,
  } = await supabaseAuthed
    .from("empleados")
    .select(
      "id, nombre, apellido, email, area, puesto"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (empleadoError) {
    console.error(
      "Error leyendo empleado:",
      empleadoError
    );

    /*
      Si la base no responde (por ejemplo, el proyecto de Supabase está
      pausado), NO mandamos a /onboarding: la persona sí tiene perfil.
    */
    return <ErrorCarga />;
  }

  if (!empleado) {
    redirect("/onboarding");
  }

  const firstName =
    empleado.nombre ||
    user?.firstName ||
    "Usuario";

  const email =
    empleado.email ||
    user?.emailAddresses?.[0]?.emailAddress ||
    "Sin correo";

  /* =======================================================
     ÚLTIMA EVALUACIÓN PERSONAL

     Solo mostramos información realmente registrada.
  ======================================================= */

  const {
    data: surveyData,
    error: surveyError,
  } = await supabaseAuthed
    .from("resultados_encuestas")
    .select(
      `
        user_id,
        puntaje_total,
        created_at,
        riesgo,
        interpretacion,
        dimensiones
      `
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(1);

  if (surveyError) {
    console.error(
      "Error leyendo evaluación personal:",
      surveyError
    );
  }

  const latestSurvey =
    (surveyData?.[0] || null) as Resultado | null;

  const surveyRisk =
    latestSurvey?.riesgo || null;

  const surveyRiskUI =
    riskStyles(surveyRisk);

    /* =======================================================
   PULSO SEMANAL REAL
======================================================= */

function getMondayLocalDashboard() {
  const today = new Date();

  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + diff
  );

  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const date = String(monday.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
}

const semanaActual = getMondayLocalDashboard();

const {
  data: pulsoSemanal,
  error: pulsoError,
} = await supabaseAuthed
  .from("pulsos_semanales")
  .select(
    `
      id,
      semana_inicio,
      energia,
      desconexion,
      apoyo,
      dificultad
    `
  )
  .eq("user_id", userId)
  .eq("semana_inicio", semanaActual)
  .maybeSingle();

if (pulsoError) {
  console.error(
    "Error leyendo pulso semanal:",
    pulsoError
  );
}

const pulsoCompletado = Boolean(pulsoSemanal);

/*
  Último pulso (de cualquier semana) para el perfil
  bio-psico-social-propósito. Se usa "*" porque la
  columna "sentido" puede no existir todavía; es la
  fila propia del usuario.
*/
const { data: ultimoPulso, error: ultimoPulsoError } = await supabaseAuthed
  .from("pulsos_semanales")
  .select("*")
  .eq("user_id", userId)
  .order("semana_inicio", { ascending: false })
  .limit(1)
  .maybeSingle();

if (ultimoPulsoError) {
  console.error(
    "Error leyendo último pulso:",
    ultimoPulsoError
  );
}


  /* =======================================================
     DATOS PROFESIONALES NOM-035
  ======================================================= */

  let totalOrganizacion = 0;

  let conteoNiveles = {
    nulo: 0,
    bajo: 0,
    medio: 0,
    alto: 0,
    muyAlto: 0,
  };

  let casosElevados = 0;
  let porcentajeElevado = 0;

  let resumenOrganizacional =
    "No existen evaluaciones del Cuestionario II registradas.";

  if (isProfessional) {
    const {
      data: nom035Data,
      error: nom035Error,
    } = await supabaseAdmin
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

    if (nom035Error) {
      console.error(
        "Error leyendo evaluaciones NOM-035:",
        nom035Error
      );
    }

    const cuestionarioII =
      (nom035Data || []).filter(
        (item: any) =>
          item.tipo_cuestionario === "II"
      );

    const evaluacionesCalculadas =
      cuestionarioII.map((item: any) => {
        const resultado =
          calificarCuestionarioII(
            respuestasAplicablesDashboard(item)
          );

        return {
          ...item,
          resultado,
        };
      });

    totalOrganizacion =
      evaluacionesCalculadas.length;

    const nivelesOrganizacion =
      evaluacionesCalculadas.map(
        ({ resultado }: any) =>
          resultado.nivelFinal
      );

    conteoNiveles = {
      nulo: nivelesOrganizacion.filter(
        (nivel) =>
          nivel === "Nulo o despreciable"
      ).length,

      bajo: nivelesOrganizacion.filter(
        (nivel) => nivel === "Bajo"
      ).length,

      medio: nivelesOrganizacion.filter(
        (nivel) => nivel === "Medio"
      ).length,

      alto: nivelesOrganizacion.filter(
        (nivel) => nivel === "Alto"
      ).length,

      muyAlto: nivelesOrganizacion.filter(
        (nivel) => nivel === "Muy alto"
      ).length,
    };

    casosElevados =
      conteoNiveles.alto +
      conteoNiveles.muyAlto;

    porcentajeElevado =
      totalOrganizacion > 0
        ? Math.round(
            (casosElevados /
              totalOrganizacion) *
              100
          )
        : 0;

    if (totalOrganizacion === 0) {
      resumenOrganizacional =
        "No existen evaluaciones del Cuestionario II registradas.";
    } else if (casosElevados > 0) {
      resumenOrganizacional =
        `${casosElevados} de ${totalOrganizacion} evaluaciones ` +
        `(${porcentajeElevado}%) se encuentran en nivel Alto o Muy alto.`;
    } else {
      resumenOrganizacional =
        `De ${totalOrganizacion} evaluaciones analizadas, ` +
        `ninguna se encuentra en nivel Alto o Muy alto.`;
    }
  }

  /* =======================================================
     ¿QUÉ NECESITAS HOY?

     Todos los destinos existen actualmente.
  ======================================================= */

  const necesidades = [
    {
      href: "/experiencia",
      title: "Hablar con Psyqus",
      description: "Cuéntale al acompañante qué está pasando.",
      icon: MessageCircle,
    },
    {
      href: "/mindfulness",
      title: "Calmarme",
      description: "Respiración o grounding en 1 minuto.",
      icon: Wind,
    },
    {
      href: "/psicoeducacion",
      title: "Aprender jugando",
      description: "Minijuegos de emociones y convivencia.",
      icon: Gamepad2,
    },
    {
      href: "/entrenamiento",
      title: "Resolver un conflicto",
      description: "Practica una conversación difícil.",
      icon: Users,
    },
    {
      href: "/mindfulness",
      title: "Cerrar mi jornada",
      description: "Desconéctate al terminar el día.",
      icon: Moon,
    },
    {
      href: "/buzon",
      title: "Hablar con alguien",
      description: "Pide apoyo de una persona.",
      icon: HeartHandshake,
    },
  ];

  /* =======================================================
     RENDER
     Orden: saludo → pulso → 4 aspectos → ¿qué necesitas? →
     evaluaciones → apoyo humano → (vista profesional).
  ======================================================= */

  return (
    <main className="relative min-h-screen bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_28%)]" />

      <div className="relative mx-auto max-w-5xl px-5 py-6 md:px-6 md:py-8">
        {/* SALUDO */}
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Mi bienestar</p>
            <h1 className="mt-1 text-3xl font-black md:text-4xl">Hola, {firstName}</h1>
            <p className="mt-1 text-xs text-slate-500">{email}</p>
          </div>
          <SignOutAction />
        </header>

        {isProfessional && (
          <div className="mb-6 flex flex-wrap gap-2 text-sm">
            <Link href="/panel-psicologo" className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-2 font-semibold text-rose-200 hover:bg-rose-500/20">
              Panel profesional
            </Link>
            <Link href="/nom035-resultados" className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-200 hover:bg-emerald-500/20">
              Resultados NOM-035
            </Link>
          </div>
        )}

        {/* PULSO SEMANAL */}
        <Link
          href="/pulso"
          className={`group mb-6 flex items-center justify-between gap-4 rounded-[1.6rem] border p-5 transition ${
            pulsoCompletado
              ? "border-emerald-400/20 bg-emerald-500/[0.06]"
              : "border-cyan-400/25 bg-cyan-500/[0.07] hover:bg-cyan-500/[0.11]"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                pulsoCompletado ? "bg-emerald-500/15" : "bg-cyan-500/15"
              }`}
            >
              {pulsoCompletado ? <CheckCircle2 className="h-6 w-6 text-emerald-300" /> : <Activity className="h-6 w-6 text-cyan-300" />}
            </div>
            <div>
              <p className="font-black">{pulsoCompletado ? "Tu pulso de esta semana está listo" : "¿Cómo estuvo tu semana?"}</p>
              <p className="text-sm text-slate-400">
                {pulsoCompletado ? "Puedes actualizarlo cuando quieras." : "Pulso semanal · menos de 1 minuto"}
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-black ${
              pulsoCompletado ? "text-emerald-300" : "bg-cyan-400 text-slate-950"
            }`}
          >
            {pulsoCompletado ? "Listo ✓" : "Responder"}
          </span>
        </Link>

        {/* LOS 4 ASPECTOS */}
        <PerfilBienestar pulso={ultimoPulso || null} />

        {/* ¿QUÉ NECESITAS HOY? */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-black">¿Qué necesitas hoy?</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {necesidades.map((opcion) => {
              const Icon = opcion.icon;
              return (
                <Link
                  key={opcion.title}
                  href={opcion.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-400/25 hover:bg-cyan-500/[0.06]"
                >
                  <Icon className="h-5 w-5 text-cyan-300" />
                  <p className="mt-3 font-bold">{opcion.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{opcion.description}</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* EVALUACIONES */}
        <section className="mb-8 rounded-[1.6rem] border border-white/10 bg-slate-950/65 p-5 md:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-xl font-black">Tus evaluaciones</h2>
            {latestSurvey && <span className="text-xs text-slate-500">Última: {formatDate(latestSurvey.created_at)}</span>}
          </div>

          {latestSurvey ? (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${surveyRiskUI.badge}`}>{surveyRiskUI.label}</span>
              {typeof latestSurvey.puntaje_total === "number" && (
                <span className="text-sm text-slate-400">Puntaje: {latestSurvey.puntaje_total}</span>
              )}
              <Link href="/resultados" className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
                Ver resultados <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Todavía no tienes una evaluación registrada.</p>
          )}

          {latestSurvey?.interpretacion && (
            <p className="mt-4 rounded-2xl bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300">{latestSurvey.interpretacion}</p>
          )}

          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              { href: "/encuesta", titulo: "Evaluación interna", Icon: ClipboardList, color: "text-cyan-300" },
              { href: "/nom035", titulo: "NOM-035", Icon: Shield, color: "text-emerald-300" },
              { href: "/perfil", titulo: "Mi perfil", Icon: UserRound, color: "text-indigo-300" },
            ].map(({ href, titulo, Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="group flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.06]"
              >
                <span className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  {titulo}
                </span>
                <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
              </Link>
            ))}
          </div>

          {latestSurvey?.dimensiones && Object.keys(latestSurvey.dimensiones).length > 0 && (
            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="mb-3 text-sm font-semibold text-slate-300">Dimensiones de tu última evaluación</p>
              <MapaDeCalor data={latestSurvey.dimensiones} />
            </div>
          )}
        </section>

        {/* APOYO HUMANO */}
        <section className="mb-8 flex flex-col gap-4 rounded-[1.6rem] border border-amber-400/15 bg-amber-500/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between md:p-6">
          <div>
            <p className="flex items-center gap-2 font-black text-amber-200">
              <HeartHandshake className="h-5 w-5" />
              ¿Prefieres hablar con una persona?
            </p>
            <p className="mt-1 text-sm text-slate-400">Envía una solicitud de apoyo para revisión humana.</p>
          </div>
          <Link href="/buzon" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-black text-slate-950 hover:bg-amber-300">
            Pedir ayuda <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* VISTA PROFESIONAL (solo admin / psicólogo) */}
        {isProfessional && (
          <section className="mb-8 rounded-[1.6rem] border border-emerald-400/15 bg-slate-950/70 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-300">
                  <Stethoscope className="h-4 w-4" />
                  Vista profesional
                </p>
                <h2 className="mt-2 text-xl font-black">Estado NOM-035 de la organización</h2>
                <p className="mt-1 text-sm text-slate-400">{resumenOrganizacional}</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-center">
                <p className="text-2xl font-black text-cyan-300">{totalOrganizacion}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Evaluaciones</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { nombre: "Nulo o despreciable", valor: conteoNiveles.nulo, color: "#6ee7b7" },
                { nombre: "Bajo", valor: conteoNiveles.bajo, color: "#a7f3d0" },
                { nombre: "Medio", valor: conteoNiveles.medio, color: "#fcd34d" },
                { nombre: "Alto", valor: conteoNiveles.alto, color: "#fb923c" },
                { nombre: "Muy alto", valor: conteoNiveles.muyAlto, color: "#f87171" },
              ].map((nivel) => {
                const porcentaje = totalOrganizacion > 0 ? Math.round((nivel.valor / totalOrganizacion) * 100) : 0;
                return (
                  <div key={nivel.nombre}>
                    <div className="mb-1 flex justify-between gap-4 text-sm">
                      <span className="text-slate-200">{nivel.nombre}</span>
                      <span className="tabular-nums text-slate-400">
                        {nivel.valor} · <b className="text-white">{porcentaje}%</b>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full" style={{ width: `${porcentaje}%`, background: nivel.color }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Alto o muy alto: {casosElevados} ({porcentajeElevado}% del total). Calificación según las Guías de Referencia de la NOM-035.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}

/** Aviso cuando la base de datos no responde (en vez de mandar a registrarse otra vez). */
function ErrorCarga() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-center text-white">
      <div className="max-w-md">
        <h1 className="text-2xl font-black">No pudimos cargar tus datos</h1>
        <p className="mt-3 text-slate-400">
          Nuestro servicio no respondió. Tu información está a salvo; intenta de nuevo en unos minutos.
        </p>
        <Link href="/mi-bienestar" className="mt-6 inline-block rounded-xl bg-cyan-400 px-6 py-3 font-black text-slate-950">
          Intentar de nuevo
        </Link>
      </div>
    </main>
  );
}
