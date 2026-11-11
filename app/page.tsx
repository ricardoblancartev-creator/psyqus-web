"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  Activity,
  ArrowRight,
  Brain,
  Clock3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  LineChart,
  MessageCircle,
  Moon,
  Play,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wind,
  type LucideIcon,
} from "lucide-react";

const FORM_INICIAL = {
  empresa: "",
  nombre: "",
  telefono: "",
  email: "",
  rubro: "",
  empleados: "",
  mensaje: "",
};

const necesidades = [
  {
    icon: Wind,
    title: "Calmarme",
    href: "/mindfulness",
  },
  {
    icon: Activity,
    title: "Concentrarme",
    href: "/mindfulness",
  },
  {
    icon: Moon,
    title: "Dormir mejor",
    href: "/psicoeducacion",
  },
  {
    icon: HeartHandshake,
    title: "Resolver un conflicto",
    href: "/entrenamiento",
  },
  {
    icon: Brain,
    title: "Dejar de sobrepensar",
    href: "/psicoeducacion",
  },
  {
    icon: Sparkles,
    title: "Recuperarme de una jornada difícil",
    href: "/mindfulness",
  },
  {
    icon: MessageCircle,
    title: "Hablar con alguien",
    href: "/buzon",
  },
];

const recursos = [
  {
    icon: Brain,
    title: "Orientación",
    href: "/ia",
    text:
      "Un orientador de bienestar basado en IA para explicar conceptos y ayudar a encontrar recursos dentro de Psyqus.",
  },
  {
    icon: GraduationCap,
    title: "Aprendizaje",
    href: "/psicoeducacion",
    text:
      "Psicoeducación y entrenamiento práctico para desarrollar habilidades aplicables al trabajo.",
  },
  {
    icon: Wind,
    title: "Herramientas",
    href: "/mindfulness",
    text:
      "Respiración, mindfulness, descanso y ejercicios breves para recuperar equilibrio y concentración.",
  },
  {
    icon: MessageCircle,
    title: "Ayuda",
    href: "/buzon",
    text:
      "Acceso a canales de comunicación y seguimiento cuando una herramienta digital no es suficiente.",
  },
];

// Datos verificables del producto (no cifras de clientes ni promesas de resultados)
const pruebas = [
  {
    icon: Play,
    valor: "14 Shorts",
    texto: "de menos de 40 segundos",
  },
  {
    icon: Clock3,
    valor: "1 minuto",
    texto: "para el pulso semanal",
  },
  {
    icon: ClipboardCheck,
    valor: "NOM-035",
    texto: "Guías de Referencia I y II",
  },
  {
    icon: ShieldCheck,
    valor: "Datos agregados",
    texto: "solo para perfiles autorizados",
  },
];

const temasShorts = [
  "Comunicación asertiva",
  "Manejo del estrés",
  "Poner límites",
  "Convivencia",
  "Buen trato",
  "Enfoque",
];

function LogoPsyqus({ size = 44 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 overflow-hidden rounded-2xl ring-1 ring-cyan-300/30 shadow-[0_0_28px_rgba(34,211,238,0.25)]"
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.jpg"
        alt=""
        width={size * 2}
        height={size * 2}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}

const informacion = [
  {
    icon: Eye,
    title: "Visibilidad",
    text:
      "Información organizada para comprender qué está ocurriendo en la organización.",
  },
  {
    icon: LineChart,
    title: "Seguimiento",
    text:
      "Observa resultados y cambios a lo largo del tiempo cuando existan datos comparables.",
  },
  {
    icon: Radar,
    title: "Prevención",
    text:
      "Identifica factores que requieren atención para orientar acciones preventivas.",
  },
  {
    icon: ShieldCheck,
    title: "Evidencia",
    text:
      "Mantén organizadas evaluaciones, resultados y acciones relacionadas.",
  },
];

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:p-6">
      <Icon
        aria-hidden="true"
        className="h-6 w-6 text-cyan-300"
      />

      <h3 className="mt-4 text-lg font-bold">
        {title}
      </h3>

      <div className="mt-3 text-sm leading-relaxed text-slate-400">
        {children}
      </div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState(FORM_INICIAL);

  function updateField(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch("/api/prospectos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const body = await response.text();

      let errorMessage =
        "No se pudo enviar la solicitud.";

      try {
        const data: unknown = JSON.parse(body);

        if (
          data &&
          typeof data === "object" &&
          "error" in data &&
          typeof data.error === "string"
        ) {
          errorMessage = data.error;
        }
      } catch {
        if (body) errorMessage = body;
      }

      if (!response.ok) {
        alert(errorMessage);
        return;
      }

      setSuccess(true);
      setForm(FORM_INICIAL);
    } catch (error) {
      console.error(error);

      alert(
        "Error de conexión al enviar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.16),transparent_35%),radial-gradient(ellipse_at_90%_40%,rgba(139,92,246,0.09),transparent_30%)]"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
        {/* NAVEGACIÓN */}

        <nav
          aria-label="Navegación principal"
          className="mb-12 flex flex-wrap items-center justify-between gap-4 md:mb-20"
        >
          <Link
            href="/"
            aria-label="Psyqus, inicio"
            className="flex items-center gap-3"
          >
            <LogoPsyqus size={44} />

            <span>
              <span className="block text-2xl font-black tracking-tight">
                Psyqus
                <span className="text-cyan-300">.</span>
              </span>

              <span className="mt-0.5 block text-[9px] uppercase tracking-[0.18em] text-cyan-300/75">
                Habilidades humanas · Bienestar · NOM-035
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#video"
              className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block"
            >
              Ver video
            </a>

            <a
              href="#experiencia"
              className="hidden px-3 py-2 text-sm text-slate-300 hover:text-white md:block"
            >
              La experiencia
            </a>

            <a
              href="/dashboard"
              className="rounded-xl border border-white/10 px-3 py-2.5 text-sm font-semibold hover:bg-white/5 sm:px-4"
            >
              Iniciar sesión
            </a>

            <a
              href="#cotizacion"
              className="rounded-xl bg-cyan-300 px-3 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200 sm:px-4"
            >
              Agenda tu demo
            </a>
          </div>
        </nav>

        {/* PRESENTACIÓN Y FORMULARIO */}

        <section
          aria-labelledby="titulo-principal"
          className="grid items-start gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14"
        >
          <div className="min-w-0 pt-2">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-200">
              <Sparkles
                aria-hidden="true"
                className="h-4 w-4"
              />
              Plataforma mexicana para equipos de trabajo
            </p>

            <h1
              id="titulo-principal"
              className="text-5xl font-black leading-[1.03] tracking-tight sm:text-6xl xl:text-7xl"
            >
              Las máquinas hacen lo perfecto.
              <span className="mt-2 block bg-gradient-to-r from-cyan-300 via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                Tu equipo, lo que importa.
              </span>
            </h1>

            <p className="mt-6 text-2xl font-bold leading-tight sm:text-3xl">
              Habilidades blandas y bienestar para tu equipo.
            </p>

            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
              En la era de la IA, lo que distingue a tu
              empresa es su gente: cómo se comunica, cómo
              maneja la presión y cómo trabaja en equipo.
              Psyqus lo desarrolla con{" "}
              <strong className="font-semibold text-white">
                Shorts y microcursos de minutos
              </strong>
              , y reúne las{" "}
              <strong className="font-semibold text-white">
                evaluaciones NOM-035
              </strong>{" "}
              en la misma plataforma.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#cotizacion"
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.35)] hover:bg-cyan-200"
              >
                Agenda tu demo
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </a>

              <a
                href="#video"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-6 py-3.5 font-semibold text-white hover:border-cyan-300/40 hover:bg-cyan-300/5"
              >
                <Play
                  aria-hidden="true"
                  className="h-4 w-4 text-cyan-300"
                />
                Ver el video (50 s)
              </a>
            </div>

            <dl className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {pruebas.map(({ icon: Icon, valor, texto }) => (
                <div
                  key={valor}
                  className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5 text-cyan-300"
                  />
                  <dt className="mt-3 text-lg font-black leading-tight">
                    {valor}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-slate-400">
                    {texto}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Card
                icon={ClipboardCheck}
                title="01 · Evaluar"
              >
                Evaluaciones y diagnósticos psicosociales
                como punto de partida.
              </Card>

              <Card icon={Radar} title="02 · Monitorear">
                Seguimiento periódico para observar cambios
                y necesidades de atención.
              </Card>

              <Card
                icon={GraduationCap}
                title="03 · Fortalecer"
              >
                Shorts, microcursos y práctica de
                situaciones reales durante todo el año.
              </Card>
            </div>
          </div>

          <div
            id="cotizacion"
            className="scroll-mt-6 rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_0_70px_rgba(34,211,238,0.06)] md:p-8"
          >
            {!success ? (
              <>
                <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                  <Building2
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                  Para empresas
                </p>

                <h2 className="text-3xl font-black leading-tight md:text-4xl">
                  Agenda tu demo
                </h2>

                <p className="mt-3 leading-relaxed text-slate-400">
                  Cuéntanos sobre tu organización. Te
                  mostramos la plataforma y preparamos una
                  propuesta a la medida de tu equipo.
                </p>

                <ul className="mb-7 mt-5 space-y-2 text-sm text-slate-300">
                  {[
                    "Recorrido por Shorts, microcursos y acompañante",
                    "Cómo se aplican y leen las evaluaciones NOM-035",
                    "Propuesta según el tamaño de tu equipo",
                  ].map((punto) => (
                    <li
                      key={punto}
                      className="flex items-start gap-2"
                    >
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
                      />
                      {punto}
                    </li>
                  ))}
                </ul>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <input
                    aria-label="Nombre de la empresa"
                    name="empresa"
                    autoComplete="organization"
                    value={form.empresa}
                    onChange={updateField}
                    required
                    placeholder="Nombre de la empresa"
                    className={inputClass}
                  />

                  <input
                    aria-label="Nombre de contacto"
                    name="nombre"
                    autoComplete="name"
                    value={form.nombre}
                    onChange={updateField}
                    required
                    placeholder="Nombre de contacto"
                    className={inputClass}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      aria-label="Teléfono o WhatsApp"
                      name="telefono"
                      type="tel"
                      autoComplete="tel"
                      value={form.telefono}
                      onChange={updateField}
                      required
                      placeholder="Teléfono / WhatsApp"
                      className={inputClass}
                    />

                    <input
                      aria-label="Correo"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={updateField}
                      placeholder="Correo"
                      className={inputClass}
                    />
                  </div>

                  <input
                    aria-label="Rubro o giro de la empresa"
                    name="rubro"
                    value={form.rubro}
                    onChange={updateField}
                    required
                    placeholder="Rubro / giro de la empresa"
                    className={inputClass}
                  />

                  <select
                    aria-label="Número de personas en tu equipo"
                    name="empleados"
                    value={form.empleados}
                    onChange={updateField}
                    required
                    className={`${inputClass} bg-[#0f172a]`}
                  >
                    <option value="">
                      Número de personas en tu equipo
                    </option>
                    <option value="1-15">1 a 15</option>
                    <option value="16-50">16 a 50</option>
                    <option value="51-100">51 a 100</option>
                    <option value="101-250">101 a 250</option>
                    <option value="250+">Más de 250</option>
                  </select>

                  <textarea
                    aria-label="Mensaje"
                    name="mensaje"
                    value={form.mensaje}
                    onChange={updateField}
                    placeholder="¿Qué te interesa mejorar en tu organización?"
                    rows={4}
                    className={inputClass}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-4 font-bold text-slate-950 hover:bg-cyan-200 disabled:opacity-60"
                  >
                    <Send
                      aria-hidden="true"
                      className="h-5 w-5"
                    />

                    {loading
                      ? "Enviando..."
                      : "Quiero mi demo"}
                  </button>
                </form>
              </>
            ) : (
              <div
                role="status"
                className="py-12 text-center"
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="mx-auto mb-5 h-16 w-16 text-emerald-300"
                />

                <h2 className="text-3xl font-black">
                  Solicitud recibida
                </h2>

                <p className="mt-4 text-slate-300">
                  Gracias. Te contactaremos para preparar
                  una propuesta para tu organización.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* VIDEO: EL CÍRCULO */}

        <section
          id="video"
          aria-labelledby="titulo-video"
          className="mt-24 scroll-mt-8 overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[radial-gradient(ellipse_at_80%_20%,rgba(34,211,238,0.12),transparent_55%),radial-gradient(ellipse_at_10%_90%,rgba(139,92,246,0.12),transparent_55%)] p-6 md:mt-28 md:p-10"
        >
          <div className="grid items-center gap-10 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px] lg:gap-16">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                <Play
                  aria-hidden="true"
                  className="h-4 w-4"
                />
                Psyqus en 50 segundos
              </p>

              <h2
                id="titulo-video"
                className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl"
              >
                Pídele a una máquina un círculo:
                <span className="block text-cyan-300">
                  siempre será perfecto.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
                Pídeselo a una persona y ninguno será
                igual. Ahí está lo que la IA no reemplaza, y
                lo que Psyqus ayuda a desarrollar en tu
                equipo.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  "Empatía",
                  "Comunicación",
                  "Creatividad",
                  "Liderazgo",
                  "Trabajo en equipo",
                ].map((habilidad) => (
                  <span
                    key={habilidad}
                    className="rounded-full border border-cyan-300/25 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.08)]"
                  >
                    {habilidad}
                  </span>
                ))}
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Temas de los Shorts
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {temasShorts.join(" · ")}
              </p>

              <a
                href="#cotizacion"
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-cyan-300 px-6 py-3.5 font-bold text-slate-950 hover:bg-cyan-200"
              >
                Agenda tu demo
                <ArrowRight
                  aria-hidden="true"
                  className="h-5 w-5"
                />
              </a>
            </div>

            <div className="mx-auto w-full max-w-[300px] rounded-[2.4rem] border border-cyan-300/40 bg-[#0B1224] p-2 shadow-[0_0_60px_rgba(34,211,238,0.22)] lg:max-w-[340px]">
              <video
                src="/videos/psyqus-circulo.mp4"
                poster="/videos/psyqus-circulo-poster.jpg"
                controls
                playsInline
                preload="none"
                aria-label="Video de Psyqus: el círculo de la máquina y los círculos de las personas"
                className="aspect-[9/16] w-full rounded-[2rem] bg-[#020617] object-cover"
              >
                Tu navegador no puede reproducir este
                video.{" "}
                <a href="/videos/psyqus-circulo.mp4">
                  Abrir video
                </a>
              </video>
            </div>
          </div>
        </section>

        {/* SHORTS, ACOMPAÑANTE Y SEGUIMIENTO */}

        <section
          id="experiencia"
          aria-labelledby="titulo-experiencia"
          className="mt-24 scroll-mt-8 md:mt-28"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
            Así se vive Psyqus
          </p>

          <div className="mt-3 grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <h2
              id="titulo-experiencia"
              className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl"
            >
              Un espacio para aprender,
              <br className="hidden sm:block" /> hablar y
              hacer una pausa.
            </h2>

            <p className="max-w-lg leading-relaxed text-slate-400">
              Videos breves, un acompañante con avatar y
              herramientas prácticas. Cada persona
              encuentra una forma de empezar.
            </p>
          </div>

          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            <article className="overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-[#081526]">
              <div className="grid gap-6 p-6 sm:grid-cols-[1fr_190px] sm:items-center md:p-7">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                    <Play
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                    Psyqus Shorts
                  </p>

                  <h3 className="mt-4 text-3xl font-bold leading-tight">
                    Situaciones reales.
                    <br />
                    Ideas que puedes usar.
                  </h3>

                  <p className="mt-4 text-sm leading-relaxed text-slate-400">
                    Reconocer el estrés, comunicarte con
                    claridad, convivir mejor y detectar
                    señales de violencia. Psicoeducación en
                    un feed de videos verticales.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      "Estrés",
                      "Comunicación",
                      "Buen trato",
                    ].map((topic) => (
                      <span
                        key={topic}
                        className="rounded-full border border-cyan-300/15 px-3 py-1 text-[11px] text-cyan-100"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  <a
                    href="/shorts"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-cyan-300"
                  >
                    Abrir Shorts
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4"
                    />
                  </a>
                </div>

                <div className="mx-auto w-full max-w-[220px] overflow-hidden rounded-3xl border border-white/15 bg-black p-1.5 shadow-2xl">
                  <video
                    src="/shorts/enfoque.mp4"
                    controls
                    playsInline
                    muted
                    preload="metadata"
                    aria-label="Muestra de Psyqus Shorts: recuperar el enfoque"
                    className="aspect-[9/16] w-full rounded-[1.1rem] bg-[#071122] object-contain"
                  >
                    Tu navegador no puede reproducir este
                    video.{" "}
                    <a href="/shorts/enfoque.mp4">
                      Abrir video
                    </a>
                  </video>
                </div>
              </div>
            </article>

            <article className="flex flex-col justify-between rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(ellipse_at_top_right,rgba(139,92,246,0.14),transparent_75%)] p-6 md:p-7">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-300">
                  <UserRound
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                  Tu acompañante Psyqus
                </p>

                <h3 className="mt-4 text-3xl font-bold leading-tight">
                  Una conversación para empezar.
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  Elige un avatar de hombre o mujer en tu
                  espacio Psyqus. Conversa con el orientador
                  de IA y accede desde ahí a cursos,
                  herramientas y evaluaciones.
                </p>

                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-violet-300/15 bg-slate-950/60 p-4">
                  <div className="rounded-xl bg-violet-400/15 p-2.5">
                    <MessageCircle
                      aria-hidden="true"
                      className="h-5 w-5 text-violet-200"
                    />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-violet-300">
                      Tu acompañante
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-slate-200">
                      ¿Qué te gustaría hacer hoy?
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full bg-white/5 px-3 py-2">
                    Hablar
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-2">
                    Aprender
                  </span>
                  <span className="rounded-full bg-white/5 px-3 py-2">
                    Hacer una pausa
                  </span>
                </div>
              </div>

              <a
                href="/experiencia"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-violet-300"
              >
                Conocer al acompañante
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </a>
            </article>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Card
              icon={HeartPulse}
              title="Un minuto para tu pulso semanal"
            >
              <p>
                Registra tu energía, desconexión y apoyo.
                Una forma sencilla de hacer espacio para
                cómo estuvo tu semana.
              </p>

              <a
                href="/pulso"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-300"
              >
                Abrir pulso semanal
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </a>
            </Card>

            <Card
              icon={Activity}
              title="Tu bienestar en un solo lugar"
            >
              <p>
                Consulta tu última evaluación y sus
                dimensiones, encuentra herramientas y
                accede a los recursos de Psyqus desde el
                menú inferior.
              </p>

              <a
                href="/mi-bienestar"
                className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-300"
              >
                Ir a mi bienestar
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4"
                />
              </a>
            </Card>
          </div>
        </section>

        {/* NECESIDADES COTIDIANAS */}

        <section className="mt-24 grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              La experiencia de tu equipo
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Todo empieza con una pregunta sencilla.
            </h2>

            <p className="mt-6 text-3xl font-bold text-cyan-300">
              ¿Qué necesitas hoy?
            </p>

            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Cada persona puede elegir por dónde comenzar.
              Psyqus organiza sus herramientas alrededor de
              necesidades reales y cotidianas.
            </p>
          </div>

          <div className="grid gap-3 rounded-[2rem] border border-white/10 bg-slate-950/60 p-5 sm:grid-cols-2 md:p-7">
            {necesidades.map(
              ({ icon: Icon, title, href }) => (
                <a
                  key={title}
                  href={href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-cyan-300/30 hover:bg-cyan-300/5"
                >
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5 text-cyan-300"
                  />

                  <p className="mt-3 flex items-center justify-between gap-2 text-sm font-semibold">
                    {title}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-300"
                    />
                  </p>
                </a>
              )
            )}
          </div>
        </section>

        {/* CONTINUIDAD */}

        <section className="mt-24">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Más allá de una evaluación
            </p>

            <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
              La salud mental no se trabaja una vez cada
              seis meses.
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate-300">
              Las evaluaciones permiten entender el punto
              de partida. Psyqus conecta esa información con
              recursos que pueden utilizarse durante todo
              el año.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recursos.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
              >
                <p>{item.text}</p>

                <a
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-cyan-300"
                >
                  Explorar
                  <span className="sr-only">
                    {item.title}
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4"
                  />
                </a>
              </Card>
            ))}
          </div>
        </section>

        {/* VALOR PARA LAS PERSONAS Y LA EMPRESA */}

        <section className="mt-24 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-500/[0.06] p-7 md:p-9">
            <Users
              aria-hidden="true"
              className="h-8 w-8 text-cyan-300"
            />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Para cada persona
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Herramientas para estar mejor.
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-5 text-slate-300">
              <li>
                Aprender habilidades útiles con cursos y
                Shorts.
              </li>
              <li>Practicar situaciones laborales.</li>
              <li>Recuperar calma y concentración.</li>
              <li>
                Comprender mejor lo que está viviendo.
              </li>
              <li>
                Encontrar orientación y canales de ayuda.
              </li>
            </ul>
          </div>

          <div className="rounded-[2rem] border border-violet-400/15 bg-violet-500/[0.06] p-7 md:p-9">
            <Building2
              aria-hidden="true"
              className="h-8 w-8 text-violet-300"
            />

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              Para la empresa
            </p>

            <h2 className="mt-2 text-3xl font-black">
              Información para actuar mejor.
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-5 text-slate-300">
              <li>Evaluaciones estructuradas.</li>
              <li>
                Información agregada para perfiles
                autorizados.
              </li>
              <li>
                Identificación de áreas que requieren
                atención.
              </li>
              <li>Seguimiento y trazabilidad.</li>
              <li>Base para acciones preventivas.</li>
            </ul>
          </div>
        </section>

        {/* INFORMACIÓN PARA LA EMPRESA */}

        <section className="mt-24 grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
              Información útil para la empresa
            </p>

            <h2 className="mt-3 text-4xl font-black leading-tight md:text-5xl">
              Datos primero.
              <span className="block text-cyan-300">
                Tecnología después.
              </span>
            </h2>

            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Psyqus organiza evaluaciones, seguimiento y
              evidencia disponible para facilitar una
              lectura más clara del entorno psicosocial.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {informacion.map((item) => (
              <Card
                key={item.title}
                icon={item.icon}
                title={item.title}
              >
                {item.text}
              </Card>
            ))}
          </div>
        </section>

        {/* NOM-035 */}

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-slate-950/60 p-7 md:p-10">
          <div className="grid items-center gap-7 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <ShieldCheck
                aria-hidden="true"
                className="h-10 w-10 text-cyan-300"
              />

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                Cumplimiento integrado
              </p>

              <h2 className="mt-2 text-3xl font-black md:text-4xl">
                La NOM-035 sigue siendo parte del núcleo.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-relaxed text-slate-300">
                Psyqus conserva las evaluaciones y
                herramientas relacionadas con la NOM-035
                dentro de un sistema más amplio de
                prevención, aprendizaje y bienestar.
              </p>

              <p className="mt-4 text-sm leading-relaxed text-slate-400">
                Psyqus funciona como herramienta de apoyo
                para evaluación, organización de información
                y seguimiento. No sustituye atención clínica
                ni las obligaciones legales de la empresa.
              </p>
            </div>
          </div>
        </section>

        {/* CIERRE */}

        <section className="mt-24 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8 text-center md:p-12">
          <div className="mb-6 flex justify-center">
            <LogoPsyqus size={72} />
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight md:text-5xl">
            Habilidades blandas y bienestar para tu equipo.
            <span className="mt-2 block text-cyan-300">
              Información útil para tu empresa.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-cyan-100/75">
            Microcursos · Shorts · Evaluaciones NOM-035.
            Evaluar es el comienzo; fortalecer a las
            personas es el trabajo continuo.
          </p>

          <a
            href="#cotizacion"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-8 py-4 font-bold text-slate-950 hover:bg-cyan-200"
          >
            Agenda tu demo
            <ArrowRight
              aria-hidden="true"
              className="h-5 w-5"
            />
          </a>
        </section>

        {/* FOOTER */}

        <footer className="mt-16 flex flex-col justify-between gap-5 border-t border-white/10 pb-4 pt-8 text-sm text-slate-400 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LogoPsyqus size={36} />
            <div>
              <p className="font-black text-white">
                Psyqus
              </p>
              <p className="mt-0.5">
                Habilidades humanas · Bienestar · NOM-035
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <a
              href="#experiencia"
              className="hover:text-white"
            >
              La experiencia
            </a>
            <a
              href="/dashboard"
              className="hover:text-white"
            >
              Iniciar sesión
            </a>
            <a
              href="#cotizacion"
              className="hover:text-white"
            >
              Contacto
            </a>
          </div>

          <p className="text-xs">
            Evaluar · Monitorear · Fortalecer
          </p>
        </footer>
      </div>
    </main>
  );
}
