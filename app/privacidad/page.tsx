"use client";
import React from 'react';
import Link from 'next/link';

export default function Privacidad() {
  return (
    <main className="min-h-screen bg-[#020617] p-10 text-slate-300 font-sans selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto bg-slate-900/30 border border-slate-800 p-12 rounded-[3rem] backdrop-blur-xl">
        <h1 className="text-white text-4xl font-black mb-8 uppercase italic tracking-tighter">
          Aviso de <span className="text-cyan-500">Privacidad</span>
        </h1>
        
        <div className="space-y-6 text-sm leading-relaxed text-justify">
          <p className="font-bold text-white uppercase tracking-widest text-[10px]">Última actualización: 08 de Marzo, 2026</p>
          
          <section>
            <h2 className="text-cyan-500 font-black uppercase mb-2 italic">1. Identidad y Domicilio</h2>
            <p>Psyqus Intelligence, con domicilio en [Tu Dirección], es responsable del tratamiento de sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares.</p>
          </section>

          <section>
            <h2 className="text-cyan-500 font-black uppercase mb-2 italic">2. Finalidad del Tratamiento (NOM-035)</h2>
            <p>Los datos recopilados a través de nuestros diagnósticos tienen como única finalidad la identificación y análisis de factores de riesgo psicosocial en el entorno laboral, en estricto cumplimiento con la NOM-035-STPS-2018.</p>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Generación de reportes estadísticos agregados.</li>
              <li>Identificación de áreas de oportunidad organizacional.</li>
              <li>Prevención de eventos traumáticos severos y violencia laboral.</li>
            </ul>
          </section>

          <section className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/20">
            <h2 className="text-cyan-500 font-black uppercase mb-2 italic">3. Confidencialidad y Anonimato</h2>
            <p className="font-bold text-white">Sus respuestas individuales son estrictamente confidenciales.</p>
            <p className="mt-2">Psyqus Intelligence no compartirá resultados individuales con los empleadores de forma que puedan ser vinculados directamente a su persona. Los reportes entregados a las empresas son exclusivamente estadísticos y grupales.</p>
          </section>

          <section>
            <h2 className="text-cyan-500 font-black uppercase mb-2 italic">4. Derechos ARCO</h2>
            <p>Usted tiene derecho al Acceso, Rectificación, Cancelación u Oposición del tratamiento de sus datos. Para ejercerlos, puede enviar un correo a: <span className="text-white font-mono">privacidad@psyqus.net</span></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <Link href="/" className="text-cyan-500 font-black uppercase text-xs tracking-[0.3em] hover:text-white transition-all flex items-center gap-2">
            <span>←</span> Regresar al Portal Principal
          </Link>
        </div>
      </div>
    </main>
  );
}