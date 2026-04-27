export default function TerminosPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <section className="relative max-w-5xl mx-auto px-6 py-10">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/60 backdrop-blur-xl p-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-400/70 font-semibold mb-3">
            Psyqus Legal Layer
          </p>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">
            Términos y Condiciones
          </h1>

          <div className="mt-8 space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Objeto</h2>
              <p>
                Psyqus es una plataforma digital para evaluación psicosocial, acompañamiento,
                psicoeducación, entrenamiento y soporte organizacional en contextos de
                bienestar laboral.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Uso permitido</h2>
              <p>
                El usuario acepta utilizar la plataforma únicamente con fines legítimos,
                laborales, formativos o preventivos, evitando conductas que afecten la
                seguridad, confidencialidad o funcionamiento del sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Acceso y cuentas</h2>
              <p>
                Cada usuario será responsable del uso de su acceso dentro de la plataforma.
                El acceso a paneles profesionales o administrativos estará reservado a perfiles
                autorizados por la organización y por la configuración de Psyqus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Naturaleza del servicio</h2>
              <p>
                Psyqus no sustituye atención clínica, diagnóstico profesional, psicoterapia ni
                atención psiquiátrica. Sus interpretaciones, módulos educativos y lecturas
                tienen alcance preventivo, organizacional y orientativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Interpretaciones y metodología</h2>
              <p>
                La plataforma genera interpretaciones con base en reglas internas, cuestionarios,
                indicadores de bienestar y módulos de análisis organizacional. Cuando exista
                participación o validación metodológica de especialistas externos, dicha
                referencia deberá mostrarse de forma precisa y autorizada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Contenido profesional acreditado</h2>
              <p>
                En su caso, Psyqus podrá mostrar leyendas de revisión metodológica, supervisión
                o validación por especialistas. Estas menciones deberán corresponder a
                autorizaciones reales, vigentes y verificables.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Limitación de responsabilidad</h2>
              <p>
                Psyqus no será responsable por decisiones individuales o empresariales tomadas
                exclusivamente con base en una lectura automatizada sin revisión humana cuando
                esta sea necesaria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Disponibilidad</h2>
              <p>
                La plataforma podrá presentar ajustes, mantenimiento, actualizaciones o periodos
                de indisponibilidad temporal derivados de operación, seguridad o evolución del
                sistema.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Propiedad intelectual</h2>
              <p>
                La interfaz, contenidos, metodología propia, diseño, flujos y materiales de
                Psyqus forman parte del sistema y no podrán reproducirse, distribuirse o
                explotarse sin autorización.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Aceptación</h2>
              <p>
                Al utilizar la plataforma, el usuario acepta estos términos y condiciones.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}