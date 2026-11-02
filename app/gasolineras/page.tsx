"use client";

import { useState } from "react";
import { ArrowLeft, Fuel, Gauge, Clock3, Users, Play, RotateCcw, Info, Sparkles, Activity, FileText } from "lucide-react";
import Link from "next/link";

type Perfil = { nombre: string; porcentaje: number; color: string; ruidoEleccion: number; descripcion: string };
type Auto = { espera: number; servicioRestante: number };
type Llegada = { perfil: number; servicio: number; ruido: number[] };
type Escenario = { promedio: number; percentil90: number; atendidos: number; maxFila: number; serie: number[] };
type Corrida = { habitual: Escenario; informacion: Escenario; clave: string; numero: number };

const PERFILES_INICIALES: Perfil[] = [
  { nombre: "Elección flexible", porcentaje: 35, color: "#32c99a", ruidoEleccion: .82, descripcion: "Prueba qué pasa cuando las personas no siempre eligen la fila con menor puntaje." },
  { nombre: "Elección intermedia", porcentaje: 40, color: "#65a9ff", ruidoEleccion: .42, descripcion: "Representa una mezcla entre la señal de fila y variación al decidir." },
  { nombre: "Guiada por la espera", porcentaje: 25, color: "#ff9b68", ruidoEleccion: .16, descripcion: "Sigue con más consistencia la fila que el modelo estima más conveniente." },
];
const REPETICIONES = 25;

function aleatorio(seed: number) {
  let s = seed >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
}

function poisson(lambda: number, rnd: () => number) {
  const limite = Math.exp(-lambda);
  let k = 0, producto = 1;
  do { k++; producto *= rnd(); } while (producto > limite);
  return k - 1;
}

function crearLlegadas(minutos: number, llegadasHora: number, servicioPromedio: number, perfiles: Perfil[], rnd: () => number) {
  return Array.from({ length: minutos }, () => {
    const cantidad = poisson(llegadasHora / 60, rnd);
    return Array.from({ length: cantidad }, () => {
      const selector = rnd(); let acumulado = 0; let indicePerfil = perfiles.length - 1;
      for (let i = 0; i < perfiles.length; i++) {
        acumulado += perfiles[i].porcentaje / 100;
        if (selector < acumulado) { indicePerfil = i; break; }
      }
      return {
        perfil: indicePerfil,
        // Variación uniforme alrededor del promedio (±40%), igual para ambos escenarios.
        servicio: servicioPromedio * (.6 + rnd() * .8),
        ruido: Array.from({ length: 12 }, () => rnd()),
      };
    });
  });
}

function simularEscenario(llegadas: Llegada[][], bombas: number, servicioPromedio: number, perfiles: Perfil[], informarEspera: boolean): Escenario {
  const filas: Auto[][] = Array.from({ length: bombas }, () => []);
  const esperasAtendidas: number[] = [];
  const serie: number[] = [];
  let maxFila = 0;

  for (let minuto = 0; minuto < llegadas.length; minuto++) {
    for (const llegada of llegadas[minuto]) {
      const perfil = perfiles[llegada.perfil];
      let mejorBomba = 0, mejorPuntaje = Number.POSITIVE_INFINITY;
      for (let i = 0; i < bombas; i++) {
        const carga = informarEspera
          ? filas[i].reduce((total, auto) => total + auto.servicioRestante, 0) / servicioPromedio
          : filas[i].length;
        const u = Math.min(.999999, Math.max(.000001, llegada.ruido[i]));
        const ruidoGumbel = -Math.log(-Math.log(u)) * perfil.ruidoEleccion;
        const puntaje = carga + ruidoGumbel;
        if (puntaje < mejorPuntaje) { mejorPuntaje = puntaje; mejorBomba = i; }
      }
      filas[mejorBomba].push({ espera: 0, servicioRestante: llegada.servicio });
    }

    for (const fila of filas) {
      if (!fila.length) continue;
      fila[0].servicioRestante -= 1;
      if (fila[0].servicioRestante <= 0) {
        esperasAtendidas.push(fila.shift()!.espera);
      }
      for (let i = 1; i < fila.length; i++) fila[i].espera++;
    }
    const enFila = filas.reduce((total, fila) => total + fila.length, 0);
    maxFila = Math.max(maxFila, enFila);
    const esperaAcumulada = filas.reduce((total, fila) => total + fila.reduce((suma, auto) => suma + auto.espera, 0), 0);
    serie.push(enFila ? esperaAcumulada / enFila : 0);
  }

  const ordenadas = [...esperasAtendidas].sort((a, b) => a - b);
  return {
    promedio: ordenadas.length ? ordenadas.reduce((suma, n) => suma + n, 0) / ordenadas.length : 0,
    percentil90: ordenadas.length ? ordenadas[Math.floor((ordenadas.length - 1) * .9)] : 0,
    atendidos: ordenadas.length,
    maxFila,
    serie,
  };
}

function ejecutarModelo(bombas: number, llegadasHora: number, servicio: number, horas: number, perfiles: Perfil[], corrida: number) {
  const minutos = horas * 60;
  const tiemposBase: number[][] = [];
  const tiemposInfo: number[][] = [];
  const seriesBase = Array.from({ length: minutos }, () => 0);
  const seriesInfo = Array.from({ length: minutos }, () => 0);
  let atendidosBase = 0, atendidosInfo = 0, maxBase = 0, maxInfo = 0;

  for (let repeticion = 0; repeticion < REPETICIONES; repeticion++) {
    const rnd = aleatorio(8342 + corrida * 7919 + repeticion * 104729);
    const eventos = crearLlegadas(minutos, llegadasHora, servicio, perfiles, rnd);
    // Las dos reglas reciben exactamente los mismos vehículos, perfiles, servicios y ruido de elección.
    const habitual = simularEscenario(eventos, bombas, servicio, perfiles, false);
    const informacion = simularEscenario(eventos, bombas, servicio, perfiles, true);
    // Para percentiles, una repetición puede tener distinta carga; se aproximan con sus resultados
    // agregados por repetición para mantener el resumen ligero en el navegador.
    tiemposBase.push([habitual.promedio, habitual.percentil90]);
    tiemposInfo.push([informacion.promedio, informacion.percentil90]);
    habitual.serie.forEach((valor, i) => { seriesBase[i] += valor / REPETICIONES; });
    informacion.serie.forEach((valor, i) => { seriesInfo[i] += valor / REPETICIONES; });
    atendidosBase += habitual.atendidos / REPETICIONES;
    atendidosInfo += informacion.atendidos / REPETICIONES;
    maxBase = Math.max(maxBase, habitual.maxFila);
    maxInfo = Math.max(maxInfo, informacion.maxFila);
  }

  const resumir = (valores: number[][], atendidos: number, maxFila: number, serie: number[]): Escenario => ({
    promedio: valores.reduce((suma, par) => suma + par[0], 0) / REPETICIONES,
    percentil90: valores.reduce((suma, par) => suma + par[1], 0) / REPETICIONES,
    atendidos: Math.round(atendidos), maxFila, serie,
  });
  return { habitual: resumir(tiemposBase, atendidosBase, maxBase, seriesBase), informacion: resumir(tiemposInfo, atendidosInfo, maxInfo, seriesInfo) };
}

function claveParametros(bombas: number, llegadas: number, servicio: number, horas: number, perfiles: Perfil[]) {
  return JSON.stringify({ bombas, llegadas, servicio, horas, perfiles: perfiles.map(({ porcentaje, ruidoEleccion }) => [porcentaje, ruidoEleccion]) });
}

export default function GasolinerasPage() {
  const [bombas, setBombas] = useState(4);
  const [llegadas, setLlegadas] = useState(34);
  const [servicio, setServicio] = useState(7);
  const [horas, setHoras] = useState(8);
  const [perfiles, setPerfiles] = useState<Perfil[]>(PERFILES_INICIALES);
  const [corriendo, setCorriendo] = useState(false);
  const [numeroCorrida, setNumeroCorrida] = useState(0);
  const [resultado, setResultado] = useState<Corrida | null>(null);
  const sumaPerfiles = perfiles.reduce((total, perfil) => total + perfil.porcentaje, 0);
  const claveActual = claveParametros(bombas, llegadas, servicio, horas, perfiles);
  const resultadoDesactualizado = Boolean(resultado && resultado.clave !== claveActual);
  const reduccion = resultado?.habitual.promedio
    ? Math.round((resultado.habitual.promedio - resultado.informacion.promedio) / resultado.habitual.promedio * 100)
    : 0;
  const maxGraf = resultado ? Math.max(1, ...resultado.habitual.serie, ...resultado.informacion.serie) : 1;

  const ejecutar = () => {
    if (corriendo || sumaPerfiles !== 100) return;
    setCorriendo(true);
    const parametros = { bombas, llegadas, servicio, horas, perfiles: perfiles.map(perfil => ({ ...perfil })), numero: numeroCorrida + 1 };
    window.setTimeout(() => {
      const comparacion = ejecutarModelo(parametros.bombas, parametros.llegadas, parametros.servicio, parametros.horas, parametros.perfiles, parametros.numero);
      setResultado({ ...comparacion, clave: claveParametros(parametros.bombas, parametros.llegadas, parametros.servicio, parametros.horas, parametros.perfiles), numero: parametros.numero });
      setNumeroCorrida(parametros.numero);
      setCorriendo(false);
    }, 40);
  };

  const cambiarPerfil = (indice: number, porcentaje: number) => setPerfiles(actuales => actuales.map((perfil, i) => i === indice ? { ...perfil, porcentaje } : perfil));
  const restablecer = () => { setBombas(4); setLlegadas(34); setServicio(7); setHoras(8); setPerfiles(PERFILES_INICIALES); };

  return <main className="min-h-screen bg-[#0b1213] text-[#f1f6f4]">
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-7 sm:px-8">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[#91a6a1] transition hover:text-white"><ArrowLeft size={16}/> Volver a Psyqus</Link>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div><div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[#50d2a7]"><Fuel size={15}/> Psyqus · laboratorio conductual</div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Filas en gasolineras</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#a9bab5]">Explora cómo las decisiones de las personas cambian la espera. Ajusta el escenario y compara la elección por longitud visible con información estimada del tiempo de espera.</p>
        </div>
        <button onClick={ejecutar} disabled={corriendo || sumaPerfiles !== 100} className="inline-flex items-center gap-2 rounded-xl bg-[#48d0a3] px-5 py-3 font-semibold text-[#082019] shadow-lg shadow-emerald-950/30 transition hover:bg-[#67e0b8] disabled:cursor-not-allowed disabled:opacity-50">{corriendo ? <RotateCcw className="animate-spin" size={17}/> : <Play size={17} fill="currentColor"/>}{corriendo ? "Ejecutando 25 corridas…" : "Ejecutar 25 simulaciones"}</button>
      </header>

      <div className="mb-7 flex items-start gap-3 rounded-2xl border border-[#29443c] bg-[#101d1a] px-4 py-3 text-sm leading-6 text-[#c1d0cb]"><Info className="mt-1 shrink-0 text-[#50d2a7]" size={17}/><span>Modelo experimental para explorar hipótesis. Los resultados dependen de los supuestos elegidos y no representan datos observados ni una recomendación operativa. Las etiquetas de perfil son supuestos agregados, no diagnósticos.</span></div>
      {resultadoDesactualizado && <div className="mb-5 rounded-xl border border-amber-700/50 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">Cambiaste parámetros desde la corrida {resultado?.numero}. Los resultados mostrados corresponden a la configuración anterior; ejecuta otra vez para actualizarlos.</div>}

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <aside className="space-y-5 rounded-3xl border border-[#253432] bg-[#111b1b] p-5">
          <div className="flex items-center gap-2"><Gauge className="text-[#50d2a7]" size={19}/><h2 className="text-lg font-semibold">Escenario</h2></div>
          <Slider label="Bombas abiertas" detail="Cuántas bombas atienden al mismo tiempo. Úsalo para comparar, por ejemplo, el turno actual con uno donde se abre una bomba adicional." value={bombas} min={1} max={12} unit="" onChange={setBombas}/>
          <Slider label="Llegadas promedio" hint="vehículos por hora" detail="Ritmo supuesto de llegada durante toda la corrida. Para estudiar congestión, usa el conteo de una hora pico; para operación típica, usa una hora representativa." value={llegadas} min={8} max={90} unit="/h" onChange={setLlegadas}/>
          <Slider label="Tiempo de servicio" hint="minutos que una bomba queda ocupada" detail="No es el tiempo en fila: es el tiempo que la bomba está ocupada por cada vehículo. Si tienes registros, usa el promedio observado desde que empieza el servicio hasta que la bomba queda libre." value={servicio} min={3} max={15} unit=" min" onChange={setServicio}/>
          <Slider label="Duración simulada" detail="Cuánto dura el periodo modelado. Sirve para comparar turnos de distinta duración; al terminar, los vehículos que aún esperan no cuentan como atendidos." value={horas} min={2} max={12} unit=" h" onChange={setHoras}/>
          <div className="my-5 border-t border-[#253432]"/>
          <div><div className="mb-1 flex items-center justify-between"><h3 className="font-semibold">Estilos de elección hipotéticos</h3><span className={`text-xs ${sumaPerfiles === 100 ? "text-[#7ea397]" : "text-orange-300"}`}>{sumaPerfiles}%</span></div><p className="mb-4 text-xs leading-5 text-[#8da29c]">Cada porcentaje representa una parte de las llegadas simuladas. Úsalos para explorar mezclas posibles; si no tienes un estudio de campo, son supuestos y no mediciones de clientes.</p>
            {perfiles.map((perfil, indice) => <div key={perfil.nombre} className="mb-4"><div className="mb-1 flex justify-between text-sm"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full" style={{ background: perfil.color }}/>{perfil.nombre}</span><span className="text-[#a9bab5]">{perfil.porcentaje}%</span></div><input aria-label={`Porcentaje ${perfil.nombre}`} className="w-full accent-emerald-400" type="range" min="0" max="100" value={perfil.porcentaje} onChange={evento => cambiarPerfil(indice, Number(evento.target.value))}/><p className="text-[11px] text-[#758a84]">{perfil.descripcion}</p></div>)}
          </div>
          <button onClick={restablecer} className="inline-flex items-center gap-2 text-xs text-[#8da29c] transition hover:text-white"><RotateCcw size={13}/> Restablecer parámetros</button>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={<Clock3 size={17}/>} label="Espera media · fila visible" detail="Promedio de quienes terminaron de esperar y recibieron servicio en las 25 repeticiones." value={resultado ? `${resultado.habitual.promedio.toFixed(1)} min` : "—"} tone="text-[#91b8ff]"/>
            <Metric icon={<Sparkles size={17}/>} label="Espera media · tiempo estimado" detail="El mismo indicador cuando la elección usa la carga estimada de cada bomba." value={resultado ? `${resultado.informacion.promedio.toFixed(1)} min` : "—"} tone="text-[#50d2a7]"/>
            <Metric icon={<Users size={17}/>} label="Atendidos · con información" detail="Promedio redondeado de vehículos que completaron servicio dentro del periodo en las repeticiones." value={resultado ? resultado.informacion.atendidos.toLocaleString("es-MX") : "—"} tone="text-[#d2b6ff]"/>
            <Metric icon={<Activity size={17}/>} label="Variación estimada de espera" detail="Cambio porcentual frente a la fila visible. Un valor negativo significa que el escenario informado estimó más espera." value={resultado ? `${reduccion}%` : "—"} tone="text-[#ffc27d]"/>
          </div>

          <div className="rounded-3xl border border-[#253432] bg-[#111b1b] p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Espera acumulada durante la corrida</h2><p className="mt-1 max-w-2xl text-sm leading-5 text-[#8da29c]">Minutos de espera que llevan, en promedio, los vehículos que siguen en fila en ese momento. Es distinto al promedio final de espera de quienes ya fueron atendidos.</p><p className="mt-1 text-xs text-[#6f837d]">Promedio de {REPETICIONES} repeticiones · minutos acumulados por vehículo en fila</p></div><div className="flex gap-4 text-xs text-[#a9bab5]"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#91b8ff]"/>Fila visible</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#50d2a7]"/>Tiempo estimado</span></div></div>
            <div className="relative h-56 w-full overflow-hidden rounded-xl bg-[#0b1413] p-3">
              {[0,1,2,3].map((_,indice)=><div key={indice} className="absolute left-3 right-3 border-t border-[#20302d]" style={{top:`${12+indice*25}%`}}/>)}
              {resultado ? <svg className="relative h-full w-full overflow-visible" viewBox={`0 0 ${resultado.habitual.serie.length} 100`} preserveAspectRatio="none" aria-label="Gráfico de espera promedio">
                <polyline fill="none" stroke="#91b8ff" strokeWidth="1.8" vectorEffect="non-scaling-stroke" points={resultado.habitual.serie.map((valor,i)=>`${i},${96-valor/maxGraf*88}`).join(" ")}/>
                <polyline fill="none" stroke="#50d2a7" strokeWidth="1.8" vectorEffect="non-scaling-stroke" points={resultado.informacion.serie.map((valor,i)=>`${i},${96-valor/maxGraf*88}`).join(" ")}/>
              </svg> : <div className="relative flex h-full items-center justify-center text-sm text-[#71847f]">Ejecuta una simulación para ver los resultados.</div>}
              <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-[#60736e]"><span>Inicio</span><span>{horas/2} h</span><span>{horas} h</span></div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-[#253432] bg-[#111b1b] p-5"><h3 className="mb-2 font-semibold">Lectura del escenario</h3><p className="mb-4 text-xs leading-5 text-[#81958f]">El percentil 90 resume la espera alta: se calcula en cada repetición y aquí se muestra el promedio de esos percentiles. Los máximos son la mayor fila observada en alguna repetición.</p>{resultado ? <div className="space-y-3 text-sm text-[#a9bab5]"><p className="flex justify-between gap-3"><span>Percentil 90 · fila visible</span><b className="text-white">{resultado.habitual.percentil90.toFixed(1)} min</b></p><p className="flex justify-between gap-3"><span>Percentil 90 · tiempo estimado</span><b className="text-white">{resultado.informacion.percentil90.toFixed(1)} min</b></p><p className="flex justify-between gap-3"><span>Máximo simultáneo · fila visible</span><b className="text-white">{resultado.habitual.maxFila}</b></p><p className="flex justify-between gap-3"><span>Máximo simultáneo · tiempo estimado</span><b className="text-white">{resultado.informacion.maxFila}</b></p></div> : <p className="text-sm text-[#8da29c]">Aquí aparecerán los indicadores cuando corras el modelo.</p>}</div>
            <div className="rounded-3xl border border-[#253432] bg-[#111b1b] p-5"><h3 className="mb-3 flex items-center gap-2 font-semibold"><Sparkles size={16} className="text-[#50d2a7]"/>Cuándo usar cada comparación</h3><p className="text-sm leading-6 text-[#a9bab5]">La fila visible sirve como referencia de una decisión basada en cuántos autos se ven. La carga estimada puede ser útil para explorar qué pasaría si se mostrara información del trabajo pendiente en cada bomba; no prueba que instalar señalización vaya a reducir esperas reales.</p><div className="mt-4 rounded-xl bg-[#0b1413] px-3 py-2 text-xs leading-5 text-[#80958f]">25 repeticiones con variabilidad aleatoria. El servicio varía ±40% del promedio. No se modelan cambios de fila ni abandonos. Usa datos de campo antes de tomar decisiones operativas.</div></div>
          </div>
          {resultado && <p className="text-right text-xs text-[#71847f]">Corrida {resultado.numero} · {REPETICIONES} repeticiones · resultados {resultadoDesactualizado ? "anteriores a los parámetros actuales" : "de la configuración actual"}</p>}
        </section>
      </div>
      <footer className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-[#1f302d] pt-5 text-xs text-[#71847f]"><span>Psyqus Behavioral · prototipo experimental v0.2</span><Link className="inline-flex items-center gap-2 transition hover:text-[#50d2a7]" href="/gasolineras/comercial"><FileText size={14}/> Guion del video comercial</Link></footer>
    </div>
  </main>;
}

function Slider({label,hint,detail,value,min,max,unit,onChange}:{label:string;hint?:string;detail:string;value:number;min:number;max:number;unit:string;onChange:(value:number)=>void}) {
  return <label className="block"><span className="flex justify-between text-sm font-medium"><span>{label}</span><b className="text-[#50d2a7]">{value}{unit}</b></span>{hint&&<span className="text-xs text-[#71847f]">{hint}</span>}<input aria-label={label} className="mt-2 w-full accent-emerald-400" type="range" min={min} max={max} value={value} onChange={evento=>onChange(Number(evento.target.value))}/><span className="mt-1 block text-[11px] leading-[1.45] text-[#71847f]">{detail}</span></label>;
}

function Metric({icon,label,detail,value,tone}:{icon:React.ReactNode;label:string;detail:string;value:string;tone:string}) {
  return <div className="rounded-2xl border border-[#253432] bg-[#111b1b] p-4"><div className={`mb-3 ${tone}`}>{icon}</div><p className="min-h-10 text-xs leading-5 text-[#8da29c]">{label}</p><p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p><p className="mt-2 text-[11px] leading-[1.45] text-[#71847f]">{detail}</p></div>;
}
