"use client";

import { useEffect, useMemo, useState } from "react";

type Nom035Resultado = {
  id: string;
  created_at?: string;
  user_id?: string | null;
  area?: string | null;
  puesto?: string | null;
  tipo_cuestionario?: "I" | "II" | string;
  nombre_cuestionario?: string | null;
  respuestas?: Record<string, number> | null;
  puntaje_total?: number | null;
};

const preguntasNom035: Record<string, string> = {
  "I.1": "¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo, un acontecimiento traumático severo?",
  "I.2": "¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provoquen malestares?",
  "I.3": "¿Ha tenido sueños recurrentes sobre el acontecimiento que le producen malestar?",
  "I.4": "¿Se ha esforzado por evitar sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?",
  "I.5": "¿Se ha esforzado por evitar actividades, lugares o personas que motivan recuerdos del acontecimiento?",
  "I.6": "¿Ha tenido dificultad para recordar alguna parte importante del evento?",
  "I.7": "¿Ha disminuido su interés en sus actividades cotidianas?",
  "I.8": "¿Se ha sentido alejado o distante de los demás?",
  "I.9": "¿Ha notado que tiene dificultad para expresar sus sentimientos?",
  "I.10": "¿Ha tenido la impresión de que su vida se va a acortar?",
  "I.11": "¿Ha tenido dificultades para dormir?",
  "I.12": "¿Ha estado particularmente irritable o le han dado arranques de coraje?",
  "I.13": "¿Ha tenido dificultad para concentrarse?",
  "I.14": "¿Ha estado nervioso o constantemente en alerta?",
  "I.15": "¿Se ha sobresaltado fácilmente por cualquier cosa?",
   "II.1": "Mi trabajo me exige hacer mucho esfuerzo físico",
  "II.2": "Me preocupa sufrir un accidente en mi trabajo",
  "II.3": "Considero que las actividades que realizo son peligrosas",
  "II.4": "Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno",
  "II.5": "Por la cantidad de trabajo que tengo debo trabajar sin parar",
  "II.6": "Considero que es necesario mantener un ritmo de trabajo acelerado",
  "II.7": "Mi trabajo exige que esté muy concentrado",
  "II.8": "Mi trabajo requiere que memorice mucha información",
  "II.9": "Mi trabajo exige que atienda varios asuntos al mismo tiempo",
  "II.10": "En mi trabajo soy responsable de cosas de mucho valor",
  "II.11": "Respondo ante mi jefe por los resultados de toda mi área de trabajo",
  "II.12": "En mi trabajo me dan órdenes contradictorias",
  "II.13": "Considero que en mi trabajo me piden hacer cosas que no son necesarias",
  "II.14": "Trabajo horas extras más de tres veces a la semana",
  "II.15": "Mi trabajo me exige laborar en días de descanso, festivos o fines de semana",
  "II.16": "Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales",
  "II.17": "Pienso en las actividades familiares o personales cuando estoy en mi trabajo",
  "II.18": "Mi trabajo permite que desarrolle nuevas habilidades",
  "II.19": "En mi trabajo puedo aspirar a un mejor puesto",
  "II.20": "Durante mi jornada de trabajo puedo tomar pausas cuando las necesito",
  "II.21": "Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo",
  "II.22": "Puedo cambiar el orden de las actividades que realizo en mi trabajo",
  "II.23": "Me informan con claridad cuáles son mis funciones",
  "II.24": "Me explican claramente los resultados que debo obtener en mi trabajo",
  "II.25": "Me informan con quién puedo resolver problemas o asuntos de trabajo",
  "II.26": "Me permiten asistir a capacitaciones relacionadas con mi trabajo",
  "II.27": "Recibo capacitación útil para hacer mi trabajo",
  "II.28": "Mi jefe tiene en cuenta mis puntos de vista y opiniones",
  "II.29": "Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo",
  "II.30": "Puedo confiar en mis compañeros de trabajo",
  "II.31": "Cuando tenemos que realizar trabajo de equipo los compañeros colaboran",
  "II.32": "Mis compañeros de trabajo me ayudan cuando tengo dificultades",
  "II.33": "En mi trabajo puedo expresarme libremente sin interrupciones",
  "II.34": "Recibo críticas constantes a mi persona y/o trabajo",
  "II.35": "Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones",
  "II.36": "Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones",
  "II.37": "Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador",
  "II.38": "Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores",
  "II.39": "Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo",
  "II.40": "He presenciado actos de violencia en mi centro de trabajo",
  "II.41": "Atiendo clientes o usuarios muy enojados",
  "II.42": "Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas",
  "II.43": "Para hacer mi trabajo debo demostrar sentimientos distintos a los míos",
  "II.44": "Comunican tarde los asuntos de trabajo",
  "II.45": "Dificultan el logro de los resultados del trabajo",
  "II.46": "Ignoran las sugerencias para mejorar su trabajo",
};


function formatDate(date?: string) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function nivelNom035(tipo?: string, puntaje?: number | null) {
  const total = Number(puntaje || 0);

  if (tipo === "I") {
    if (total >= 1) return "Requiere revisión";
    return "Sin indicios reportados";
  }

  if (total >= 90) return "Muy alto";
  if (total >= 70) return "Alto";
  if (total >= 45) return "Medio";
  if (total >= 20) return "Bajo";
  return "Nulo";
}

function badgeStyle(nivel: string) {
  const n = nivel.toLowerCase();

  if (n.includes("muy alto") || n.includes("alto") || n.includes("requiere")) {
    return "bg-red-500/10 border-red-500/20 text-red-300";
  }

  if (n.includes("medio")) {
    return "bg-amber-500/10 border-amber-500/20 text-amber-300";
  }

  if (n.includes("bajo")) {
    return "bg-cyan-500/10 border-cyan-500/20 text-cyan-300";
  }

  return "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
}

export default function Nom035ResultadosPage() {
  const [data, setData] = useState<Nom035Resultado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/nom035-resultados");
        const json = await res.json();

        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

const resumen = useMemo(() => {
  const cuestionarioI = data.filter((x) => x.tipo_cuestionario === "I").length;
  const cuestionarioII = data.filter((x) => x.tipo_cuestionario === "II").length;
  const areas = new Set(data.map((x) => x.area || "Sin área")).size;

  const promedio =
    data.length > 0
      ? Math.round(
          data.reduce((acc, item) => acc + Number(item.puntaje_total || 0), 0) /
            data.length
        )
      : 0;

  return {
    total: data.length,
    cuestionarioI,
    cuestionarioII,
    areas,
    promedio,
  };
}, [data]);

const desglosePorPregunta = useMemo(() => {
  const conteo: Record<string, any> = {};

  data.forEach((evaluacion) => {
    const respuestas = evaluacion.respuestas || {};
    Object.entries(respuestas).forEach(([pregunta, valor]) => {
      const clave = `${evaluacion.tipo_cuestionario || "?"}.${pregunta}`;
      

      if (!conteo[clave]) {
conteo[clave] = {
  pregunta: clave,
  texto: preguntasNom035[clave] || "Pregunta oficial NOM-035",
  total: 0,
  respuestas: {},
  areas: {},
  puestos: {},
};

      }

      const respuestaTexto =
        evaluacion.tipo_cuestionario === "I"
          ? Number(valor) === 1
            ? "Sí"
            : "No"
          : {
              4: "Siempre",
              3: "Casi siempre",
              2: "Algunas veces",
              1: "Casi nunca",
              0: "Nunca",
            }[Number(valor)] || String(valor);

      const area = evaluacion.area || "Sin área";
      const puesto = evaluacion.puesto || "Sin puesto";

      conteo[clave].total += 1;

      conteo[clave].respuestas[respuestaTexto] =
        (conteo[clave].respuestas[respuestaTexto] || 0) + 1;

      conteo[clave].areas[area] =
        (conteo[clave].areas[area] || 0) + 1;

      conteo[clave].puestos[puesto] =
        (conteo[clave].puestos[puesto] || 0) + 1;
    });
  });

  return Object.values(conteo).sort(
    (a: any, b: any) => {
      const [tipoA, numA] = String(a.pregunta).split(".");
      const [tipoB, numB] = String(b.pregunta).split(".");

      if (tipoA !== tipoB) return tipoA.localeCompare(tipoB);
      return Number(numA) - Number(numB);
    }
  );
}, [data]);


  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Cargando resultados NOM-035...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <section className="max-w-7xl mx-auto">
        <div className="mb-10">
          <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm">
            Psyqus
          </p>

          <h1 className="mt-3 text-5xl font-black text-cyan-300">
            Resultados NOM-035
          </h1>

          <p className="mt-3 text-slate-400">
            Resultados oficiales separados de la encuesta de clima organizacional.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-5 mb-10">
          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Evaluaciones</p>
            <p className="text-4xl font-black text-cyan-300 mt-2">{resumen.total}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-slate-400">Cuestionario I</p>
            <p className="text-4xl font-black mt-2">{resumen.cuestionarioI}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-slate-400">Cuestionario II</p>
            <p className="text-4xl font-black mt-2">{resumen.cuestionarioII}</p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Áreas</p>
            <p className="text-4xl font-black text-emerald-300 mt-2">{resumen.areas}</p>
          </div>

          <div className="rounded-3xl border border-fuchsia-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">Promedio</p>
            <p className="text-4xl font-black text-fuchsia-300 mt-2">{resumen.promedio}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
          <h2 className="text-3xl font-black text-cyan-300 mb-6">
            Historial de evaluaciones
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-4 pr-4">Fecha</th>
                  <th className="py-4 pr-4">Cuestionario</th>
                  <th className="py-4 pr-4">Área</th>
                  <th className="py-4 pr-4">Puesto</th>
                  <th className="py-4 pr-4">Puntaje</th>
                  <th className="py-4 pr-4">Nivel</th>
                </tr>
              </thead>

              <tbody>
  
{data.map((item) => {
  const nivel = nivelNom035(item.tipo_cuestionario, item.puntaje_total);

  return (
    <tr key={item.id} className="border-b border-white/5">
      <td className="py-4 pr-4 text-slate-300">
        {formatDate(item.created_at)}
      </td>

      <td className="py-4 pr-4 font-bold">
        Cuestionario {item.tipo_cuestionario || "-"}
      </td>

      <td className="py-4 pr-4">{item.area || "Sin área"}</td>

      <td className="py-4 pr-4">{item.puesto || "Sin puesto"}</td>

      <td className="py-4 pr-4 font-black text-cyan-300">
        {item.puntaje_total ?? "-"}
      </td>

      <td className="py-4 pr-4">
        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${badgeStyle(
            nivel
          )}`}
        >
          {nivel}
        </span>
      </td>
    </tr>
  );
})}


</tbody>

            </table>
          </div>
        </div>
        <div className="mt-10 rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
  <h2 className="text-3xl font-black text-cyan-300 mb-6">
    Desglose por pregunta
  </h2>

<div className="grid md:grid-cols-2 gap-6">
  {desglosePorPregunta.map((item: any) => {
    const respuestas = Object.entries(item.respuestas);
    const total = item.total || 1;

    return (
      <div
        key={item.pregunta}
        className="rounded-3xl border border-white/10 bg-slate-950/70 p-6"
      >
        <p className="text-cyan-300 font-black text-xl">
          Pregunta {item.pregunta}
        </p>

        <p className="mt-3 text-slate-200 leading-relaxed">
          {item.texto}
        </p>

        <div className="mt-6 grid md:grid-cols-[160px_1fr] gap-6 items-center">
          <div className="w-40 h-40 rounded-full border-[18px] border-cyan-400/40 flex items-center justify-center">
            <div className="text-center">
              <p className="text-4xl font-black text-cyan-300">
                {item.total}
              </p>
              <p className="text-xs text-slate-400">personas</p>
            </div>
          </div>

          <div className="space-y-3">
            {respuestas.map(([respuesta, cantidad]) => (
              <div key={respuesta}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{respuesta}</span>
                  <span className="text-cyan-300 font-bold">
                    {String(cantidad)}
                  </span>
                </div>

                <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400"
                    style={{
                      width: `${(Number(cantidad) / total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
            Áreas
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.areas).map(([area, total]) => (
              <span key={area} className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200">
                {area}: {String(total)}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
            Puestos
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(item.puestos).map(([puesto, total]) => (
              <span key={puesto} className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-xs text-fuchsia-200">
                {puesto}: {String(total)}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  })}
</div>
</div>

      </section>
    </main>
  );
}
