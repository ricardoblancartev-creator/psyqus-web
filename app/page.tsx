"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  Brain,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  GraduationCap,
  HeartHandshake,
  LineChart,
  MessageCircle,
  Moon,
  Radar,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Wind,
} from "lucide-react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    empresa: "",
    nombre: "",
    telefono: "",
    email: "",
    rubro: "",
    empleados: "",
    mensaje: "",
  });

  function updateField(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/prospectos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = JSON.parse(text);
      } catch {
        data = {
          error: text,
        };
      }

      if (!res.ok) {
        alert(
          data.error ||
            "No se pudo enviar la solicitud."
        );

        return;
      }

      setSuccess(true);

      setForm({
        empresa: "",
        nombre: "",
        telefono: "",
        email: "",
        rubro: "",
        empleados: "",
        mensaje: "",
      });
    } catch (err) {
      console.error(err);

      alert(
        "Error de conexión al enviar la solicitud."
      );
    } finally {
      setLoading(false);
    }
  }

  const necesidades = [
    {
      icon: Wind,
      title: "Calmarme",
      color: "text-cyan-300",
    },
    {
      icon: Activity,
      title: "Concentrarme",
      color: "text-sky-300",
    },
    {
      icon: Moon,
      title: "Dormir mejor",
      color: "text-indigo-300",
    },
    {
      icon: HeartHandshake,
      title: "Resolver un conflicto",
      color: "text-fuchsia-300",
    },
    {
      icon: Brain,
      title: "Dejar de sobrepensar",
      color: "text-violet-300",
    },
    {
      icon: Sparkles,
      title: "Recuperarme de una jornada difícil",
      color: "text-emerald-300",
    },
    {
      icon: MessageCircle,
      title: "Hablar con alguien",
      color: "text-amber-300",
    },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">

      {/* =====================================================
          FONDO
      ===================================================== */}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)]" />

      <div className="absolute inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-5 md:px-6 py-8 md:py-10">

        {/* ===================================================
            NAV
        =================================================== */}

        <nav className="flex items-center justify-between gap-4 mb-14 md:mb-20">

          <div>
            <p className="text-2xl font-black tracking-tight">
              Psyqus
            </p>

            <p className="text-[9px] md:text-xs uppercase tracking-[0.26em] text-cyan-300/80">
              Seguridad Mental Empresarial
            </p>
          </div>

          <div className="flex items-center gap-3">

            <a
              href="/dashboard"
              className="hidden sm:inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold hover:bg-white/10 transition"
            >
              Iniciar sesión
            </a>

            <a
              href="#cotizacion"
              className="inline-flex rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 transition"
            >
              Conocer Psyqus
            </a>

          </div>

        </nav>

        {/* ===================================================
            HERO
        =================================================== */}

        <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-14 items-start">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-cyan-300 font-semibold mb-6">

              <Sparkles className="w-4 h-4" />

              Bienestar continuo para empresas

            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.98]">

              Salud mental para
              <span className="block text-cyan-300">
                tus empleados.
              </span>

            </h1>

            <p className="mt-6 text-2xl md:text-3xl font-black text-white max-w-3xl leading-tight">

              Información útil para tu empresa.

            </p>

            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl">

              Psyqus ayuda a las empresas a evaluar,
              prevenir y fortalecer la salud mental de
              sus equipos mediante diagnósticos,
              aprendizaje práctico, entrenamiento,
              herramientas de bienestar y orientación
              inteligente.

            </p>

            {/* 3 CAPAS */}

            <div className="mt-9 grid sm:grid-cols-3 gap-3">

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.07] p-5">

                <ClipboardCheck className="w-6 h-6 text-cyan-300" />

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">
                  01
                </p>

                <h3 className="mt-1 text-xl font-black">
                  Evaluar
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Evaluaciones y diagnósticos
                  psicosociales como punto de partida.
                </p>

              </div>

              <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.07] p-5">

                <Radar className="w-6 h-6 text-fuchsia-300" />

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-300">
                  02
                </p>

                <h3 className="mt-1 text-xl font-black">
                  Monitorear
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Seguimiento periódico para observar
                  cambios y necesidades de atención.
                </p>

              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-5">

                <GraduationCap className="w-6 h-6 text-emerald-300" />

                <p className="mt-4 text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300">
                  03
                </p>

                <h3 className="mt-1 text-xl font-black">
                  Fortalecer
                </h3>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  Recursos prácticos para trabajar
                  habilidades y bienestar durante el año.
                </p>

              </div>

            </div>

            {/* NOM */}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-5">

              <ShieldCheck className="w-6 h-6 text-cyan-300 shrink-0 mt-0.5" />

              <div>

                <p className="font-black">
                  NOM-035 integrada
                </p>

                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Las evaluaciones oficiales siguen siendo
                  parte de la médula técnica de Psyqus,
                  integradas dentro de una experiencia más
                  amplia de prevención y fortalecimiento.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <div
            id="cotizacion"
            className="rounded-[2rem] border border-white/10 bg-slate-950/75 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_80px_rgba(34,211,238,0.08)]"
          >

            {!success ? (
              <>

                <div className="inline-flex items-center gap-2 text-cyan-300 mb-4">

                  <Building2 className="w-5 h-5" />

                  <span className="text-xs font-black uppercase tracking-[0.22em]">
                    Para empresas
                  </span>

                </div>

                <h2 className="text-3xl md:text-4xl font-black leading-tight">

                  Lleva Psyqus a tu equipo

                </h2>

                <p className="mt-3 text-slate-400 mb-7 leading-relaxed">

                  Cuéntanos sobre tu organización y
                  prepararemos una propuesta de implementación.

                </p>

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={updateField}
                    required
                    placeholder="Nombre de la empresa"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  />

                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={updateField}
                    required
                    placeholder="Nombre de contacto"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  />

                  <div className="grid md:grid-cols-2 gap-4">

                    <input
                      name="telefono"
                      value={form.telefono}
                      onChange={updateField}
                      required
                      placeholder="Teléfono / WhatsApp"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                    />

                    <input
                      name="email"
                      value={form.email}
                      onChange={updateField}
                      type="email"
                      placeholder="Correo"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                    />

                  </div>

                  <input
                    name="rubro"
                    value={form.rubro}
                    onChange={updateField}
                    required
                    placeholder="Rubro / giro de la empresa"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  />

                  <select
                    name="empleados"
                    value={form.empleados}
                    onChange={updateField}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  >
                    <option value="">
                      Número de empleados
                    </option>

                    <option value="1-15">
                      1 a 15
                    </option>

                    <option value="16-50">
                      16 a 50
                    </option>

                    <option value="51-100">
                      51 a 100
                    </option>

                    <option value="101-250">
                      101 a 250
                    </option>

                    <option value="250+">
                      Más de 250
                    </option>

                  </select>

                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={updateField}
                    placeholder="¿Qué te interesa mejorar en tu organización?"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  />

                  <button
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-4 font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-60"
                  >

                    <Send className="w-5 h-5" />

                    {loading
                      ? "Enviando..."
                      : "Solicitar propuesta"}

                  </button>

                </form>

              </>
            ) : (
              <div className="text-center py-12">

                <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-5" />

                <h2 className="text-3xl font-black">
                  Solicitud recibida
                </h2>

                <p className="mt-4 text-slate-300">
                  Gracias. Te contactaremos para
                  preparar una propuesta para tu
                  organización.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ===================================================
            EXPERIENCIA DEL EMPLEADO
        =================================================== */}

        <section className="mt-28">

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8 items-center">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-300">
                La experiencia del empleado
              </p>

              <h2 className="mt-3 text-4xl md:text-6xl font-black leading-[1.02]">

                Todo empieza con una pregunta sencilla.

              </h2>

              <p className="mt-7 text-3xl md:text-4xl font-black text-cyan-300">

                ¿Qué necesitas hoy?

              </p>

              <p className="mt-5 text-lg leading-relaxed text-slate-400">

                El colaborador no necesita saber qué módulo
                abrir. Psyqus organiza sus herramientas
                alrededor de necesidades reales y cotidianas.

              </p>

            </div>

            <div className="rounded-[2rem] border border-cyan-400/15 bg-slate-950/70 p-5 md:p-7">

              <div className="grid sm:grid-cols-2 gap-3">

                {necesidades.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                    >

                      <Icon
                        className={`w-5 h-5 ${item.color}`}
                      />

                      <p className="mt-3 font-bold">
                        {item.title}
                      </p>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            CONTINUIDAD
        =================================================== */}

        <section className="mt-28">

          <div className="text-center max-w-4xl mx-auto">

            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-fuchsia-300 font-semibold mb-6">

              <Brain className="w-4 h-4" />

              Más allá de una evaluación

            </div>

            <h2 className="text-4xl md:text-5xl font-black">

              La salud mental no se trabaja
              una vez cada seis meses.

            </h2>

            <p className="mt-6 text-lg md:text-xl text-slate-300 leading-relaxed">

              Las evaluaciones permiten entender el punto
              de partida. Psyqus conecta esa información
              con recursos que pueden utilizarse durante
              todo el año.

            </p>

          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">

              <Brain className="w-7 h-7 text-cyan-300" />

              <h3 className="mt-5 text-xl font-black">
                Orientación
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Un orientador de bienestar basado en IA
                para explicar conceptos y ayudar a encontrar
                recursos dentro de Psyqus.
              </p>

            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">

              <GraduationCap className="w-7 h-7 text-fuchsia-300" />

              <h3 className="mt-5 text-xl font-black">
                Aprendizaje
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Psicoeducación y entrenamiento práctico
                para desarrollar habilidades aplicables
                al trabajo.
              </p>

            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">

              <Wind className="w-7 h-7 text-emerald-300" />

              <h3 className="mt-5 text-xl font-black">
                Herramientas
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Respiración, mindfulness, descanso y
                ejercicios breves para recuperar
                equilibrio y concentración.
              </p>

            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">

              <MessageCircle className="w-7 h-7 text-amber-300" />

              <h3 className="mt-5 text-xl font-black">
                Ayuda
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Acceso a canales de comunicación y
                seguimiento cuando una herramienta
                digital no es suficiente.
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            DOBLE VALOR
        =================================================== */}

        <section className="mt-28">

          <div className="grid lg:grid-cols-2 gap-6">

            {/* EMPLEADO */}

            <div className="rounded-[2rem] border border-cyan-400/15 bg-cyan-500/[0.06] p-7 md:p-9">

              <Users className="w-8 h-8 text-cyan-300" />

              <p className="mt-6 text-xs uppercase tracking-[0.24em] text-cyan-300 font-black">
                Para el empleado
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Herramientas para estar mejor.
              </h2>

              <div className="mt-6 space-y-4 text-slate-300">

                <p>
                  • Aprender habilidades útiles.
                </p>

                <p>
                  • Practicar situaciones laborales.
                </p>

                <p>
                  • Recuperar calma y concentración.
                </p>

                <p>
                  • Comprender mejor lo que está viviendo.
                </p>

                <p>
                  • Encontrar orientación y canales de ayuda.
                </p>

              </div>

            </div>

            {/* EMPRESA */}

            <div className="rounded-[2rem] border border-fuchsia-400/15 bg-fuchsia-500/[0.06] p-7 md:p-9">

              <Building2 className="w-8 h-8 text-fuchsia-300" />

              <p className="mt-6 text-xs uppercase tracking-[0.24em] text-fuchsia-300 font-black">
                Para la empresa
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Información para actuar mejor.
              </h2>

              <div className="mt-6 space-y-4 text-slate-300">

                <p>
                  • Evaluaciones estructuradas.
                </p>

                <p>
                  • Información agregada para perfiles autorizados.
                </p>

                <p>
                  • Identificación de áreas que requieren atención.
                </p>

                <p>
                  • Seguimiento y trazabilidad.
                </p>

                <p>
                  • Base para acciones preventivas.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            INFORMACIÓN / INTELIGENCIA
        =================================================== */}

        <section className="mt-24 grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">

          <div>

            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
              Información útil para la empresa
            </p>

            <h2 className="mt-3 text-4xl md:text-5xl font-black leading-tight">

              Datos primero.
              <span className="block text-cyan-300">
                Tecnología después.
              </span>

            </h2>

            <p className="mt-5 text-lg leading-relaxed text-slate-400">

              Psyqus organiza evaluaciones, seguimiento
              y evidencia disponible para facilitar una
              lectura más clara del entorno psicosocial.

            </p>

          </div>

          <div className="grid sm:grid-cols-2 gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <Eye className="w-7 h-7 text-cyan-300" />

              <h3 className="mt-4 text-lg font-black">
                Visibilidad
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Información organizada para comprender
                qué está ocurriendo en la organización.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <LineChart className="w-7 h-7 text-emerald-300" />

              <h3 className="mt-4 text-lg font-black">
                Seguimiento
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Observa resultados y cambios a lo largo
                del tiempo cuando existan datos comparables.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <Radar className="w-7 h-7 text-fuchsia-300" />

              <h3 className="mt-4 text-lg font-black">
                Prevención
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Identifica factores que requieren
                atención para orientar acciones preventivas.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">

              <ShieldCheck className="w-7 h-7 text-amber-300" />

              <h3 className="mt-4 text-lg font-black">
                Evidencia
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Mantén organizadas evaluaciones,
                resultados y acciones relacionadas.
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            NOM-035
        =================================================== */}

        <section className="mt-24 rounded-[2rem] border border-white/10 bg-slate-950/60 p-7 md:p-10">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-7 items-center">

            <div>

              <ShieldCheck className="w-10 h-10 text-cyan-300" />

              <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                Cumplimiento integrado
              </p>

              <h2 className="mt-2 text-4xl font-black">
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

              <p className="mt-4 text-sm leading-relaxed text-slate-500">

                Psyqus funciona como herramienta de apoyo
                para evaluación, organización de información
                y seguimiento. No sustituye atención clínica
                ni las obligaciones legales de la empresa.

              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            CIERRE
        =================================================== */}

        <section className="mt-28 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-8 md:p-12 text-center">

          <Brain className="w-10 h-10 text-cyan-300 mx-auto mb-5" />

          <h2 className="text-4xl md:text-5xl font-black max-w-4xl mx-auto">

            Salud mental para tus empleados.
            <span className="block mt-2 text-cyan-300">
              Información útil para tu empresa.
            </span>

          </h2>

          <p className="mt-6 text-lg text-cyan-100/75 max-w-3xl mx-auto">

            Evaluar es el comienzo.
            Fortalecer a las personas es el trabajo continuo.

          </p>

          <div className="mt-8">

            <a
              href="#cotizacion"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-8 py-4 font-black text-slate-950 hover:bg-cyan-300 transition"
            >

              Conocer Psyqus

              <ArrowRight className="w-5 h-5" />

            </a>

          </div>

        </section>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="mt-16 border-t border-white/10 pt-8 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 text-sm text-slate-500">

          <div>

            <p className="font-black text-white">
              Psyqus
            </p>

            <p className="mt-1">
              Seguridad Mental Empresarial
            </p>

          </div>

          <p>
            Evaluar · Monitorear · Fortalecer
          </p>

        </footer>

      </section>

    </main>
  );
}
