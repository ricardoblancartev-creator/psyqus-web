import Link from "next/link";
import { ArrowLeft, Download, Clapperboard, Clock3, Smartphone, Film, Mic2 } from "lucide-react";

const escenas = [
  {
    tiempo: "00–07 s",
    titulo: "La decisión en hora pico",
    visual: "Autos llegan y observan distintas filas. Pausa breve cuando una persona compara dos bombas.",
    voz: "En hora pico, cada conductor se pregunta: ¿a qué bomba me conviene entrar?",
    texto: "Una fila corta no siempre cuenta toda la historia.",
  },
  {
    tiempo: "07–14 s",
    titulo: "Lo que no se ve a simple vista",
    visual: "Una fila parece corta, pero el servicio tarda; otra fila avanza más rápido. Transición a un esquema de bombas.",
    voz: "Una fila corta no siempre significa menos espera. El tiempo de servicio también importa.",
    texto: "Longitud de fila ≠ tiempo de espera",
  },
  {
    tiempo: "14–21 s",
    titulo: "Explora antes de cambiar la operación",
    visual: "Aparece Psyqus Behavioral. Se mueven los controles de bombas, llegadas y tiempo de servicio.",
    voz: "Psyqus Behavioral te permite explorar escenarios antes de cambiar la operación.",
    texto: "Prueba escenarios antes de mover recursos.",
  },
  {
    tiempo: "21–28 s",
    titulo: "Dos escenarios comparables",
    visual: "Captura real de la interfaz. Se pulsa “Ejecutar 25 simulaciones” y aparecen las dos líneas del gráfico.",
    voz: "Compara la fila visible con la carga estimada, usando las mismas llegadas y tiempos de servicio.",
    texto: "Mismos vehículos. Dos reglas de elección.",
  },
  {
    tiempo: "28–35 s",
    titulo: "Indicadores para pensar mejor",
    visual: "Se muestran espera media, percentil 90 y máximo de fila. Mantener visible el aviso de modelo experimental.",
    voz: "Observa espera media, percentil noventa y filas máximas bajo distintos supuestos conductuales.",
    texto: "Explora. Compara. Formula mejores preguntas.",
  },
  {
    tiempo: "35–45 s",
    titulo: "Invitación a un piloto",
    visual: "Regreso a una estación. Cierre con marca Psyqus Behavioral y botón o QR de contacto.",
    voz: "Es un prototipo experimental. Valídalo con datos de tu estación. Psyqus Behavioral. Solicita un piloto.",
    texto: "Solicita un piloto para tu estación.",
  },
];

export default function ComercialPage() {
  return <main className="min-h-screen bg-[#0b1213] text-[#f1f6f4]">
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-7 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/gasolineras" className="inline-flex items-center gap-2 text-sm text-[#91a6a1] transition hover:text-white"><ArrowLeft size={16}/> Regresar a la simulación</Link>
        <a href="/descargas/psyqus-behavioral-guion-comercial.md" download className="inline-flex items-center gap-2 rounded-lg border border-[#29443c] px-3 py-2 text-sm text-[#b7c8c2] transition hover:border-[#50d2a7] hover:text-white"><Download size={15}/> Descargar guion Markdown</a>
      </div>

      <header className="mb-10 mt-12 border-b border-[#253432] pb-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[#50d2a7]"><Clapperboard size={15}/> Psyqus Behavioral · material comercial</div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Un video para vender la idea, con los pies en la tierra.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#a9bab5]">Guion y storyboard para presentar la simulación a operadores de estaciones de servicio e invitarlos a explorar un piloto.</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-[#829690]"><span className="rounded-full border border-[#29443c] px-3 py-1.5"><Clock3 className="mr-1 inline" size={13}/> 45 segundos</span><span className="rounded-full border border-[#29443c] px-3 py-1.5"><Film className="mr-1 inline" size={13}/> Formato principal 16:9</span><span className="rounded-full border border-[#29443c] px-3 py-1.5"><Smartphone className="mr-1 inline" size={13}/> Adaptación vertical 15 s</span></div>
      </header>

      <section className="mb-10 rounded-3xl border border-[#29443c] bg-[#101d1a] p-5 sm:p-7">
        <h2 className="mb-2 text-lg font-semibold">Idea central</h2>
        <p className="max-w-3xl text-sm leading-6 text-[#b9c8c3]">En hora pico, una fila corta no siempre significa una espera menor. Psyqus Behavioral permite comparar escenarios y formular mejores preguntas antes de cambiar la operación.</p>
        <p className="mt-4 text-xs leading-5 text-[#829690]">La simulación es experimental. No se deben presentar cifras ilustrativas como resultados reales ni prometer ahorros o reducción de espera sin validación.</p>
      </section>

      <section aria-labelledby="video-comercial" className="mb-12">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#50d2a7]">Video comercial</p><h2 id="video-comercial" className="mt-1 text-2xl font-semibold">Psyqus Behavioral en 45 segundos</h2></div><a href="/videos/psyqus-behavioral-comercial.mp4" download className="inline-flex items-center gap-2 rounded-lg border border-[#29443c] px-3 py-2 text-sm text-[#b7c8c2] transition hover:border-[#50d2a7] hover:text-white"><Download size={15}/> Descargar MP4</a></div>
        <video className="w-full rounded-2xl border border-[#29443c] bg-black shadow-2xl shadow-black/30" controls preload="metadata" poster="/videos/psyqus-behavioral-poster.png" aria-label="Video comercial de Psyqus Behavioral, 45 segundos"><source src="/videos/psyqus-behavioral-comercial.mp4" type="video/mp4"/>Tu navegador no puede reproducir video MP4.</video>
        <p className="mt-3 text-xs leading-5 text-[#7f948d]">Incluye narración sintetizada en español, subtítulos integrados y gráficos ilustrativos. Las cifras y curvas mostradas no son datos de una estación real.</p>
      </section>

      <section aria-labelledby="guion-principal">
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[#50d2a7]">Pieza principal</p><h2 id="guion-principal" className="mt-1 text-2xl font-semibold">Storyboard de 45 segundos</h2></div><Mic2 className="text-[#50d2a7]" size={22}/></div>
        <div className="space-y-4">
          {escenas.map((escena, indice) => <article key={escena.tiempo} className="grid gap-4 rounded-2xl border border-[#253432] bg-[#111b1b] p-5 md:grid-cols-[100px_1fr]">
            <div className="text-sm font-semibold text-[#50d2a7]">{escena.tiempo}<span className="mt-2 block text-[11px] font-normal text-[#60736e]">ESCENA 0{indice+1}</span></div>
            <div className="grid gap-x-8 gap-y-4 lg:grid-cols-2">
              <div><h3 className="mb-1 text-sm font-semibold">{escena.titulo}</h3><p className="text-sm leading-6 text-[#96aaa3]">{escena.visual}</p></div>
              <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#71847f]">Voz en off</p><p className="text-sm leading-6 text-white">“{escena.voz}”</p></div>
              <div className="lg:col-span-2"><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#71847f]">Texto en pantalla</p><p className="text-sm font-medium text-[#50d2a7]">{escena.texto}</p></div>
            </div>
          </article>)}
        </div>
      </section>

      <section className="mt-12 rounded-3xl border border-[#253432] bg-[#111b1b] p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#50d2a7]">Versión vertical</p><h2 className="mt-1 text-2xl font-semibold">Guion de 15 segundos</h2>
        <blockquote className="mt-5 border-l-2 border-[#50d2a7] pl-4 text-base leading-8 text-[#e4ece9]">En hora pico, una fila corta no siempre significa menos espera. Psyqus Behavioral te permite explorar cómo cambian las filas al variar bombas, llegadas y tiempos de servicio. Compara escenarios antes de tomar decisiones. Es un modelo experimental que debe validarse con datos de tu estación. Solicita un piloto.</blockquote>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">{["Autos eligiendo entre bombas · ¿Qué fila avanzará más rápido?", "Interfaz y controles · Prueba distintos escenarios.", "Gráfico comparativo · Compara la espera estimada.", "Marca y contacto · Solicita un piloto."].map((texto, i) => <div key={texto} className="rounded-xl bg-[#0b1413] p-3 text-xs leading-5 text-[#a9bab5]"><span className="mb-1 block font-semibold text-[#50d2a7]">TOMA 0{i+1}</span>{texto}</div>)}</div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-[#253432] bg-[#111b1b] p-5"><h2 className="mb-4 font-semibold">Guía de producción</h2><ul className="space-y-3 text-sm leading-6 text-[#9eb0aa]"><li><b className="text-white">Formato:</b> 16:9 para presentación, web o LinkedIn; recorte 9:16 para Shorts o Reels.</li><li><b className="text-white">Tono:</b> claro, confiable y curioso. La tensión nace de una pregunta operativa real.</li><li><b className="text-white">Visuales:</b> combinar planos de una estación con capturas reales del prototipo.</li><li><b className="text-white">Música:</b> instrumental moderna y moderada, debajo de la voz.</li><li><b className="text-white">Cierre:</b> incluir un enlace, correo o QR de contacto activo.</li></ul></div>
        <div className="rounded-3xl border border-[#253432] bg-[#111b1b] p-5"><h2 className="mb-4 font-semibold">Antes de publicarlo</h2><ul className="space-y-3 text-sm leading-6 text-[#9eb0aa]"><li>Grabar la interfaz con parámetros identificados como ejemplo.</li><li>No narrar cifras de la simulación como mejoras observadas.</li><li>Definir los datos que requiere el piloto y qué entregable recibirá el operador.</li><li>Añadir el canal de contacto aprobado.</li></ul><p className="mt-5 rounded-xl bg-[#0b1413] p-3 text-xs leading-5 text-[#81958f]">Nota sugerida: “Prototipo experimental. Los resultados dependen de los supuestos y deben contrastarse con datos observados.”</p></div>
      </section>

      <footer className="mt-10 border-t border-[#1f302d] pt-5 text-xs text-[#71847f]">Psyqus Behavioral · Guion de producción v1</footer>
    </div>
  </main>;
}
