export default function PrivacidadPage() {
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
            Aviso de Privacidad
          </h1>

          <div className="mt-8 space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Responsable</h2>
              <p>
                Psyqus es una plataforma orientada al bienestar organizacional, prevención de
                riesgo psicosocial y acompañamiento en contextos laborales. Este aviso regula
                el tratamiento de los datos personales recabados dentro de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Datos que se recaban</h2>
              <p>
                Psyqus puede recabar datos de identificación básica, información de acceso,
                respuestas a instrumentos de evaluación, mensajes enviados al Buzón de Paz,
                progreso en módulos de psicoeducación y entrenamiento, así como datos
                derivados de interpretación psicosocial dentro de la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Finalidades</h2>
              <p>
                Los datos se utilizan para habilitar el funcionamiento de Psyqus, generar
                evaluaciones e interpretaciones personalizadas, mostrar resultados al usuario,
                producir indicadores agregados para perfiles autorizados, mejorar la experiencia
                formativa de la plataforma y apoyar procesos de prevención y atención dentro del
                marco organizacional aplicable.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Confidencialidad y acceso</h2>
              <p>
                El usuario colaborador debe poder acceder únicamente a su propia información
                individual. Los perfiles profesionales o autorizados, como psicología
                organizacional o administración definida por la empresa, podrán consultar
                información agregada o casos autorizados según su rol y alcance operativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">5. Datos sensibles</h2>
              <p>
                Algunas respuestas dentro de Psyqus pueden relacionarse con bienestar
                emocional, tensión laboral o factores psicosociales. Estos datos serán
                tratados con medidas de cuidado, acceso restringido y uso limitado a las
                finalidades informadas en este aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">6. Limitación importante</h2>
              <p>
                Psyqus no sustituye diagnóstico clínico, psicoterapia, atención psiquiátrica,
                servicios médicos ni intervención de emergencia. Sus módulos tienen finalidad
                preventiva, orientativa, educativa y organizacional.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">7. Transferencias</h2>
              <p>
                Los datos no deberán transferirse a terceros fuera del marco autorizado por la
                empresa contratante, el usuario y la legislación aplicable, salvo obligación
                legal o requerimiento formal de autoridad competente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">8. Derechos ARCO</h2>
              <p>
                El titular podrá solicitar acceso, rectificación, cancelación u oposición
                respecto de sus datos personales, conforme a la legislación aplicable y al
                canal que Psyqus o la organización implementadora habiliten para ello.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">9. Consentimiento</h2>
              <p>
                El uso de la plataforma implica que el usuario reconoce haber leído este aviso
                y comprende el tratamiento general de sus datos dentro de Psyqus.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-3">10. Actualizaciones</h2>
              <p>
                Este aviso podrá actualizarse para reflejar ajustes operativos, legales o
                funcionales de la plataforma.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}