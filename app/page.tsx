"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Brain,
  Users,
  Building2,
  Send,
  CheckCircle2,
  Sparkles,
  FileText,
  GraduationCap,
  AlertTriangle,
  ArrowRight,
  Lock,
  LineChart,
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
    setForm({ ...form, [e.target.name]: e.target.value });
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
        data = { error: text };
      }

      if (!res.ok) {
        alert(data.error || "No se pudo enviar la solicitud.");
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
      alert("Error de conexión al enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_26%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-7xl mx-auto px-6 py-10">
        <nav className="flex items-center justify-between mb-14">
          <div>
            <p className="text-2xl font-black tracking-tight text-white">
              Psyqus
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
              Organizational Intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="hidden md:inline-flex rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Iniciar sesión
            </a>

            <a
              href="/diagnostico"
              className="inline-flex rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-black text-black hover:bg-cyan-400 transition"
            >
              Hacer diagnóstico
            </a>
          </div>
        </nav>

        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-cyan-300 font-semibold mb-6">
              <ShieldCheck className="w-4 h-4" />
              Cumplimiento NOM-035
            </div>

            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              ¿Tu empresa cumple con estándares mínimos de bienestar psicosocial?
            </h1>

            <p className="mt-6 text-xl text-slate-300 leading-relaxed max-w-3xl">
              Psyqus ayuda a las empresas a evaluar, documentar y dar seguimiento
              al bienestar psicosocial de sus colaboradores con evidencia clara,
              organizada y lista para revisión.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="/diagnostico"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-7 py-4 font-black text-black hover:bg-cyan-400 transition"
              >
                Hacer diagnóstico gratuito
                <ArrowRight className="w-5 h-5" />
              </a>

              <a
                href="#cotizacion"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-bold text-white hover:bg-white/10 transition"
              >
                Solicitar demo
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-8">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Brain className="w-7 h-7 text-cyan-300 mb-3" />
                <h3 className="font-bold text-lg">Salud mental</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Un equipo emocionalmente estable trabaja mejor y reduce
                  conflictos.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Building2 className="w-7 h-7 text-emerald-300 mb-3" />
                <h3 className="font-bold text-lg">Evidencia</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Registros, resultados e interpretación para respaldar acciones
                  preventivas.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Users className="w-7 h-7 text-fuchsia-300 mb-3" />
                <h3 className="font-bold text-lg">Prevención</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Detecta estrés, desgaste o riesgos antes de que escalen.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-500/10 p-5">
              <p className="text-cyan-100 leading-relaxed">
                La NOM-035 busca identificar, analizar y prevenir factores de
                riesgo psicosocial en el trabajo. En el siglo XXI, cuidar la salud
                mental del equipo es parte de la continuidad, productividad y
                protección de la empresa.
              </p>
            </div>
          </div>

          <div
            id="cotizacion"
            className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl p-6 md:p-8 shadow-[0_0_80px_rgba(34,211,238,0.08)]"
          >
            {!success ? (
              <>
                <h2 className="text-3xl font-black mb-2">
                  Solicita una cotización
                </h2>

                <p className="text-slate-400 mb-6">
                  Déjanos tus datos y te contactaremos para mostrarte cómo se
                  vería Psyqus en tu empresa.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <option value="">Número de empleados</option>
                    <option value="1-15">1 a 15</option>
                    <option value="16-50">16 a 50</option>
                    <option value="51-100">51 a 100</option>
                    <option value="101-250">101 a 250</option>
                    <option value="250+">Más de 250</option>
                  </select>

                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={updateField}
                    placeholder="Cuéntanos qué te interesa resolver"
                    rows={4}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-cyan-400/50"
                  />

                  <button
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 font-black text-black hover:bg-cyan-400 transition disabled:opacity-60"
                  >
                    <Send className="w-5 h-5" />
                    {loading ? "Enviando..." : "Solicitar cotización"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-5" />
                <h2 className="text-3xl font-black">Solicitud recibida</h2>
                <p className="mt-4 text-slate-300">
                  Gracias. Te contactaremos pronto para preparar tu cotización.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-fuchsia-300 font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              Sistema automatizado con IA
            </div>

            <h2 className="text-4xl md:text-5xl font-black">
              De la evaluación al seguimiento preventivo
            </h2>

            <p className="mt-6 text-xl text-slate-300 leading-relaxed">
              Psyqus combina evaluación NOM-035, interpretación asistida con IA,
              generación de evidencia, psicoeducación y seguimiento profesional
              para ayudar a las empresas a anticipar riesgos laborales.
            </p>
          </div>
        </div>

        <div className="mt-16 rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-6 md:p-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-5">
              <ShieldCheck className="w-8 h-8 text-cyan-300 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300 mb-2">
                Paso 1
              </p>
              <h3 className="text-xl font-black">Evaluación NOM-035</h3>
              <p className="mt-3 text-sm text-slate-300">
                Aplicación digital para identificar factores de riesgo psicosocial
                y condiciones de bienestar laboral.
              </p>
            </div>

            <div className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/10 p-5">
              <Brain className="w-8 h-8 text-fuchsia-300 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-fuchsia-300 mb-2">
                Paso 2
              </p>
              <h3 className="text-xl font-black">Interpretación con IA</h3>
              <p className="mt-3 text-sm text-slate-300">
                Lectura automatizada de señales de estrés, desgaste, conflicto o
                riesgo organizacional.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">
              <FileText className="w-8 h-8 text-emerald-300 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-300 mb-2">
                Paso 3
              </p>
              <h3 className="text-xl font-black">Evidencia y reportes</h3>
              <p className="mt-3 text-sm text-slate-300">
                Documentación organizada para seguimiento interno y respaldo ante
                revisiones.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-400/20 bg-orange-500/10 p-5">
              <GraduationCap className="w-8 h-8 text-orange-300 mb-4" />
              <p className="text-xs uppercase tracking-[0.24em] text-orange-300 mb-2">
                Paso 4
              </p>
              <h3 className="text-xl font-black">Psicoeducación</h3>
              <p className="mt-3 text-sm text-slate-300">
                Cursos, entrenamiento, mindfulness y acciones preventivas para
                fortalecer al equipo.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-2 xl:grid-cols-4 gap-5">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <AlertTriangle className="w-8 h-8 text-red-300 mb-4" />
            <h3 className="text-xl font-black text-red-300">Evita multas</h3>
            <p className="mt-3 text-slate-400">
              Mantén evidencia organizada sobre evaluaciones, reportes y acciones
              preventivas.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <LineChart className="w-8 h-8 text-fuchsia-300 mb-4" />
            <h3 className="text-xl font-black text-fuchsia-300">
              Reduce rotación
            </h3>
            <p className="mt-3 text-slate-400">
              Detecta desgaste laboral antes de que impacte productividad,
              permanencia o clima.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <Lock className="w-8 h-8 text-emerald-300 mb-4" />
            <h3 className="text-xl font-black text-emerald-300">
              Protección laboral
            </h3>
            <p className="mt-3 text-slate-400">
              Documentación útil para seguimiento interno, prevención de
              conflictos y respaldo operativo.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <GraduationCap className="w-8 h-8 text-orange-300 mb-4" />
            <h3 className="text-xl font-black text-orange-300">
              Mejora continua
            </h3>
            <p className="mt-3 text-slate-400">
              Formación breve para comunicación, liderazgo, atención al cliente y
              bienestar psicosocial.
            </p>
          </div>
        </div>

        <div className="mt-24 rounded-[2rem] border border-cyan-400/20 bg-cyan-500/10 p-10 text-center">
          <h2 className="text-4xl font-black">
            La salud mental del equipo ya es infraestructura empresarial
          </h2>

          <p className="mt-6 text-xl text-cyan-100 max-w-4xl mx-auto leading-relaxed">
            Psyqus busca transformar bienestar organizacional en información útil,
            prevención temprana y continuidad operativa para empresas del siglo XXI.
          </p>

          <a
            href="/diagnostico"
            className="mt-8 inline-flex rounded-2xl bg-cyan-500 px-8 py-4 font-black text-black hover:bg-cyan-400 transition"
          >
            Hacer diagnóstico gratuito
          </a>
        </div>
      </section>
    </main>
  );
}
