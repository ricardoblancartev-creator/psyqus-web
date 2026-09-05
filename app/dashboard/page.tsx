import { createClient } from "@supabase/supabase-js";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { supabase } from "@/lib/supabase";
import SignOutAction from "@/components/SignOutAction";
import MapaDeCalor from "@/app/dashboard/components/MapaDeCalor";
import { calificarCuestionarioII } from "@/lib/nom035-calificacion";

import {
  Activity,
  ArrowRight,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Focus,
  HeartHandshake,
  MessageCircle,
  Moon,
  Shield,
  Sparkles,
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
  }

  if (!empleado) {
    redirect("/onboarding");
  }

  const firstName =
    empleado.nombre ||
    user?.firstName ||
    "Usuario";

  const fullName =
    `${empleado.nombre || ""} ${
      empleado.apellido || ""
    }`.trim() ||
    user?.fullName ||
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
    } = await supabase
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
  href: "/ia",
  title: "Hablar con Psyqus",
  description:
    "Cuéntame qué está pasando y recibe orientación inmediata con IA.",
  icon: MessageCircle,
},

    {
      href: "/mindfulness",
      title: "Calmarme",
      description:
        "Haz una pausa breve con respiración o grounding.",
      icon: Wind,
    },
    {
      href: "/mindfulness",
      title: "Concentrarme",
      description:
        "Haz un reset breve y vuelve a una sola tarea.",
      icon: Focus,
    },
    {
      href: "/psicoeducacion",
      title: "Dormir mejor",
      description:
        "Aprende a cerrar la jornada y facilitar la desconexión.",
      icon: Moon,
    },
    {
      href: "/entrenamiento",
      title: "Resolver un conflicto",
      description:
        "Practica cómo abordar una situación laboral difícil.",
      icon: Users,
    },
    {
      href: "/psicoeducacion",
      title: "Dejar de sobrepensar",
      description:
        "Explora herramientas para ordenar pensamientos repetitivos.",
      icon: Brain,
    },
    {
      href: "/mindfulness",
      title: "Recuperarme del día",
      description:
        "Tómate unos minutos para cerrar una jornada pesada.",
      icon: BriefcaseBusiness,
    },
    {
      href: "/buzon",
      title: "Hablar con alguien",
      description:
        "Envía una solicitud para revisión humana dentro de Psyqus.",
      icon: HeartHandshake,
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* FONDO */}

      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.13),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.09),transparent_26%)]" />

      <div className="fixed inset-0 pointer-events-none opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-6 md:py-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="relative w-11 h-11 shrink-0">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl" />

                <Image
                  src="/logo.jpg"
                  alt="Psyqus"
                  width={44}
                  height={44}
                  className="relative w-11 h-11 object-contain mix-blend-screen"
                />
              </div>

              <div>
                <p className="font-black text-xl leading-none">
                  Psyqus
                </p>

                <p className="mt-1 text-[9px] uppercase tracking-[0.22em] text-cyan-300/70">
                  Bienestar para tu día de trabajo
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-white">
                  {fullName}
                </p>

                <p className="text-xs text-slate-500">
                  {email}
                </p>
              </div>

              <SignOutAction />
            </div>
          </div>
        </header>

        {/* =================================================
            NAVEGACIÓN PRINCIPAL
        ================================================= */}

        <nav className="mb-8 overflow-x-auto">
          <div className="min-w-max flex items-center gap-1 rounded-2xl border border-white/10 bg-slate-950/70 p-2">
            <Link
              href="/dashboard"
              className="rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950"
            >
              Inicio
            </Link>

            <Link
              href="/dashboard#mi-ruta"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              Mi ruta
            </Link>

            <Link
              href="/psicoeducacion"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              Aprender
            </Link>

            <Link
              href="/mindfulness"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
            >
              Herramientas
            </Link>

            <Link
              href="/buzon"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/10 transition"
            >
              Pedir ayuda
            </Link>

            {isProfessional && (
              <>
                <div className="h-5 w-px bg-white/10 mx-2" />

                <Link
                  href="/panel-psicologo"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-300 hover:bg-rose-500/10 transition"
                >
                  Panel profesional
                </Link>

                <Link
                  href="/nom035-resultados"
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10 transition"
                >
                  NOM-035
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* =================================================
            HERO / NECESIDADES
        ================================================= */}

        <section className="mb-8 rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_40%,rgba(34,211,238,0.12),transparent_32%)]" />

          <div className="relative p-6 md:p-10">
            <p className="text-sm text-cyan-300 font-semibold">
              Hola, {firstName}.
            </p>

            <h1 className="mt-2 text-4xl md:text-6xl font-black tracking-tight max-w-4xl">
              ¿Qué necesitas hoy?
            </h1>

            <p className="mt-4 text-base md:text-lg text-slate-400 max-w-3xl leading-relaxed">
              No necesitas saber qué módulo utilizar.
              Dinos qué necesitas y entra directamente
              a una herramienta de Psyqus.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {necesidades.map((opcion) => {
                const Icon = opcion.icon;

                return (
                  <Link
                    key={opcion.title}
                    href={opcion.href}
                    className="group rounded-[1.4rem] border border-white/10 bg-white/[0.035] p-5 hover:border-cyan-400/25 hover:bg-cyan-500/[0.06] transition"
                  >
                    <div className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-300" />
                    </div>

                    <p className="mt-4 font-black text-white">
                      {opcion.title}
                    </p>

                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      {opcion.description}
                    </p>

                    <ArrowRight className="mt-4 w-4 h-4 text-slate-600 transition group-hover:text-cyan-300 group-hover:translate-x-1" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================
    PULSO SEMANAL
================================================= */}

<section className="mb-8">
  <Link
    href="/pulso"
    className={`group block rounded-[2rem] border p-6 md:p-7 transition ${
      pulsoCompletado
        ? "border-emerald-400/20 bg-emerald-500/[0.06]"
        : "border-cyan-400/20 bg-cyan-500/[0.06] hover:border-cyan-400/35 hover:bg-cyan-500/[0.09]"
    }`}
  >
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${
            pulsoCompletado
              ? "border-emerald-400/20 bg-emerald-500/10"
              : "border-cyan-400/20 bg-cyan-500/10"
          }`}
        >
          {pulsoCompletado ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-300" />
          ) : (
            <Activity className="w-6 h-6 text-cyan-300" />
          )}
        </div>

        <div>
          <p
            className={`text-[10px] uppercase tracking-[0.22em] font-black ${
              pulsoCompletado
                ? "text-emerald-300"
                : "text-cyan-300"
            }`}
          >
            Pulso semanal
          </p>

          <h2 className="mt-1 text-xl md:text-2xl font-black">
            {pulsoCompletado
              ? "Tu pulso de esta semana está listo"
              : "¿Cómo estuvo tu semana?"}
          </h2>

          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            {pulsoCompletado
              ? "Ya registraste tu energía, desconexión y apoyo de esta semana."
              : "Registra cómo estuvo tu energía, desconexión y apoyo. Toma menos de un minuto."}
          </p>
        </div>
      </div>

      <div
        className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black shrink-0 ${
          pulsoCompletado
            ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
            : "bg-cyan-400 text-slate-950"
        }`}
      >
        {pulsoCompletado ? "Completado ✓" : "Responder"}

        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  </Link>
</section>


        {/* =================================================
            TU RUTA
        ================================================= */}

        <section
          id="mi-ruta"
          className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 md:p-8 scroll-mt-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-fuchsia-300">
                <Sparkles className="w-5 h-5" />

                <p className="text-xs font-black uppercase tracking-[0.22em]">
                  Mi ruta
                </p>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-black">
                Tu recorrido dentro de Psyqus
              </h2>

              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-400">
                Aquí aparecerán rutas personalizadas cuando
                Psyqus cuente con reglas y datos suficientes
                para generarlas de forma transparente.
              </p>

              <p className="mt-2 text-xs text-slate-600">
                Por ahora no generamos recomendaciones personales
                automáticas ni inferencias psicológicas sobre ti.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:min-w-[280px]">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Mientras tanto
              </p>

              <p className="mt-2 font-bold">
                Elige lo que necesitas hoy
              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Puedes utilizar Aprender, Práctica,
                Herramientas o el Orientador cuando lo necesites.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            EXPERIENCIA PSYQUS
        ================================================= */}

        <section className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <Sparkles className="w-5 h-5 text-cyan-300" />

            <div>
              <h2 className="text-2xl font-black">
                Tu espacio Psyqus
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Aprende, practica, utiliza herramientas o busca apoyo.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/psicoeducacion"
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 hover:border-fuchsia-400/20 hover:bg-fuchsia-500/[0.05] transition"
            >
              <BookOpen className="w-6 h-6 text-fuchsia-300" />

              <h3 className="mt-4 font-black text-lg">
                Aprender
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Microcursos breves para situaciones reales
                del trabajo.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-fuchsia-300 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/entrenamiento"
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 hover:border-amber-400/20 hover:bg-amber-500/[0.05] transition"
            >
              <HeartHandshake className="w-6 h-6 text-amber-300" />

              <h3 className="mt-4 font-black text-lg">
                Práctica
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Simula conversaciones y situaciones laborales
                antes de enfrentarlas.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-amber-300 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/mindfulness"
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 hover:border-cyan-400/20 hover:bg-cyan-500/[0.05] transition"
            >
              <Wind className="w-6 h-6 text-cyan-300" />

              <h3 className="mt-4 font-black text-lg">
                Herramientas
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Ejercicios rápidos para regularte, enfocarte
                o cerrar tu jornada.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-cyan-300 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              href="/ia"
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 hover:border-violet-400/20 hover:bg-violet-500/[0.05] transition"
            >
              <MessageCircle className="w-6 h-6 text-violet-300" />

              <h3 className="mt-4 font-black text-lg">
                Orientador
              </h3>

              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                Ordena una situación y piensa tu siguiente
                paso con orientación general de IA.
              </p>

              <ArrowRight className="mt-5 w-4 h-4 text-slate-600 group-hover:text-violet-300 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </section>

        {/* =================================================
            EVALUACIONES - SECUNDARIAS
        ================================================= */}

        <section className="mb-8 grid xl:grid-cols-2 gap-6">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5">
              <ClipboardList className="w-5 h-5 text-cyan-300" />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">
                  Seguimiento
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Tu última evaluación
                </h2>
              </div>
            </div>

            {latestSurvey ? (
              <>
                <div className="flex flex-wrap gap-3 items-center">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${surveyRiskUI.badge}`}
                  >
                    {surveyRiskUI.label}
                  </span>

                  <span className="text-sm text-slate-500">
                    {formatDate(
                      latestSurvey.created_at
                    )}
                  </span>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Puntaje registrado
                    </p>

                    <p className="mt-2 text-3xl font-black">
                      {typeof latestSurvey.puntaje_total ===
                      "number"
                        ? latestSurvey.puntaje_total
                        : "Sin dato"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Clasificación
                    </p>

                    <p
                      className={`mt-2 text-lg font-black ${surveyRiskUI.text}`}
                    >
                      {surveyRisk ||
                        "Sin clasificación registrada"}
                    </p>
                  </div>
                </div>

                {latestSurvey.interpretacion && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Interpretación registrada
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                      {latestSurvey.interpretacion}
                    </p>
                  </div>
                )}

                <Link
                  href="/resultados"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition"
                >
                  Ver resultados
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-slate-300">
                  Todavía no existe una evaluación personal
                  registrada.
                </p>

                <Link
                  href="/encuesta"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300"
                >
                  Ir a evaluaciones
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 md:p-8">
            <h2 className="text-2xl font-black">
              Evaluaciones
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Los instrumentos de evaluación son una parte
              de Psyqus, no toda tu experiencia en la plataforma.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/encuesta"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-cyan-300" />
                  </div>

                  <div>
                    <p className="font-bold">
                      Evaluación interna
                    </p>

                    <p className="text-xs text-slate-500">
                      Instrumento de Psyqus
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/nom035"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-emerald-400/20 bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-emerald-300" />
                  </div>

                  <div>
                    <p className="font-bold">
                      NOM-035
                    </p>

                    <p className="text-xs text-slate-500">
                      Cuestionarios disponibles
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-300 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/perfil"
                className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl border border-indigo-400/20 bg-indigo-500/10 flex items-center justify-center">
                    <UserRound className="w-5 h-5 text-indigo-300" />
                  </div>

                  <div>
                    <p className="font-bold">
                      Mi perfil
                    </p>

                    <p className="text-xs text-slate-500">
                      Información personal dentro de Psyqus
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-300 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            DIMENSIONES REALES
        ================================================= */}

        {latestSurvey?.dimensiones &&
          Object.keys(latestSurvey.dimensiones)
            .length > 0 && (
            <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/65 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <Activity className="w-5 h-5 text-fuchsia-300" />

                <div>
                  <h2 className="text-2xl font-black">
                    Dimensiones de tu evaluación
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Esta visualización utiliza únicamente
                    información registrada en tu última evaluación.
                  </p>
                </div>
              </div>

              <MapaDeCalor
                data={latestSurvey.dimensiones}
              />
            </section>
          )}

        {/* =================================================
            VISTA PROFESIONAL
        ================================================= */}

        {isProfessional && (
          <section className="mb-8 rounded-[2rem] border border-emerald-400/15 bg-slate-950/70 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-emerald-300">
                  <Stethoscope className="w-5 h-5" />

                  <p className="text-xs font-black uppercase tracking-[0.22em]">
                    Vista profesional
                  </p>
                </div>

                <h2 className="mt-3 text-3xl font-black">
                  Estado NOM-035 de la organización
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
                  Distribución recalculada mediante el motor
                  de calificación de Psyqus a partir de las
                  respuestas registradas del Cuestionario II.
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 min-w-[160px]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Evaluaciones
                </p>

                <p className="mt-2 text-3xl font-black text-cyan-300">
                  {totalOrganizacion}
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 md:p-6">
              <p className="mb-6 text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Distribución por nivel
              </p>

              <div className="space-y-5">
                {[
                  {
                    nombre: "Nulo o despreciable",
                    valor: conteoNiveles.nulo,
                  },
                  {
                    nombre: "Bajo",
                    valor: conteoNiveles.bajo,
                  },
                  {
                    nombre: "Medio",
                    valor: conteoNiveles.medio,
                  },
                  {
                    nombre: "Alto",
                    valor: conteoNiveles.alto,
                  },
                  {
                    nombre: "Muy alto",
                    valor: conteoNiveles.muyAlto,
                  },
                ].map((nivel) => {
                  const porcentaje =
                    totalOrganizacion > 0
                      ? Math.round(
                          (nivel.valor /
                            totalOrganizacion) *
                            100
                        )
                      : 0;

                  return (
                    <div key={nivel.nombre}>
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <p className="text-sm font-semibold text-slate-200">
                          {nivel.nombre}
                        </p>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500">
                            {nivel.valor} evaluaciones
                          </span>

                          <span className="min-w-[42px] text-right text-sm font-black">
                            {porcentaje}%
                          </span>
                        </div>
                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-300"
                          style={{
                            width: `${porcentaje}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Nivel bajo
                </p>

                <p className="mt-2 text-3xl font-black">
                  {conteoNiveles.bajo}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  de {totalOrganizacion} evaluaciones
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Nivel medio
                </p>

                <p className="mt-2 text-3xl font-black">
                  {conteoNiveles.medio}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  de {totalOrganizacion} evaluaciones
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  Alto o muy alto
                </p>

                <p className="mt-2 text-3xl font-black">
                  {casosElevados}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {porcentajeElevado}% del total
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Lectura general
              </p>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {resumenOrganizacional}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/nom035-resultados"
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-200 transition"
              >
                Resultados NOM-035
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/panel-psicologo"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
              >
                Panel profesional
              </Link>
            </div>
          </section>
        )}

        {/* =================================================
            AYUDA HUMANA
        ================================================= */}

        <section className="mb-8 rounded-[2rem] border border-amber-400/15 bg-amber-500/[0.04] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-amber-300">
                <HeartHandshake className="w-5 h-5" />

                <p className="text-xs font-black uppercase tracking-[0.2em]">
                  Apoyo humano
                </p>
              </div>

              <h2 className="mt-3 text-2xl md:text-3xl font-black">
                ¿Prefieres no hablar con una IA?
              </h2>

              <p className="mt-3 text-sm md:text-base leading-relaxed text-slate-400">
                Puedes enviar una solicitud de apoyo para
                revisión humana dentro de Psyqus.
              </p>
            </div>

            <Link
              href="/buzon"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-400 px-6 py-3.5 font-black text-slate-950 hover:bg-amber-300 transition"
            >
              Pedir ayuda
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="border-t border-white/10 pt-6 pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-black">
                Psyqus
              </p>

              <p className="text-xs text-slate-600 mt-1">
                Salud mental para tus empleados.
              </p>
            </div>

            <p className="text-xs text-slate-600">
              Evaluar · aprender · practicar · fortalecer
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}
