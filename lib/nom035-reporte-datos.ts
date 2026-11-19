/*
  Preparación de datos para el reporte detallado NOM-035.
  Funciones puras: sin nombres hacia la IA; los nombres
  solo se usan en el anexo confidencial del reporte.
*/

import { CATEGORIAS, DOMINIOS } from "./nom035-calificacion";
import type {
  BloqueNivel,
  InterpretacionGeneral,
} from "./nom035-reporte-word";

const NIVELES = [
  "Nulo o despreciable",
  "Bajo",
  "Medio",
  "Alto",
  "Muy alto",
];

/* ---------- Guía I: texto oficial (DOF 23/10/2018) ---------- */

const SECCIONES_I: Record<string, string> = {
  I: "Sección I. Acontecimiento traumático severo",
  II: "Sección II. Recuerdos persistentes sobre el acontecimiento (durante el último mes)",
  III: "Sección III. Esfuerzo por evitar circunstancias parecidas o asociadas al acontecimiento (durante el último mes)",
  IV: "Sección IV. Afectación (durante el último mes)",
};

const GUIA_I: Record<number, { s: string; t: string; c: string }> = {
  1: { s: "I", t: "¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo un acontecimiento como los siguientes: accidente que tenga como consecuencia la muerte, la pérdida de un miembro o una lesión grave; asaltos; actos violentos que derivaron en lesiones graves; secuestro; amenazas, o cualquier otro que ponga en riesgo su vida o salud, y/o la de otras personas?", c: "Exposición a un acontecimiento traumático severo (criterio A del TEPT en el DSM-5-TR)." },
  2: { s: "II", t: "¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provocan malestares?", c: "Reexperimentación mediante recuerdos intrusivos (criterio B del DSM-5-TR)." },
  3: { s: "II", t: "¿Ha tenido sueños de carácter recurrente sobre el acontecimiento, que le producen malestar?", c: "Reexperimentación mediante sueños recurrentes (criterio B del DSM-5-TR)." },
  4: { s: "III", t: "¿Se ha esforzado por evitar todo tipo de sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?", c: "Evitación de recuerdos, sentimientos y conversaciones (criterio C del DSM-5-TR)." },
  5: { s: "III", t: "¿Se ha esforzado por evitar todo tipo de actividades, lugares o personas que motivan recuerdos del acontecimiento?", c: "Evitación conductual de actividades, lugares o personas (criterio C del DSM-5-TR)." },
  6: { s: "III", t: "¿Ha tenido dificultad para recordar alguna parte importante del evento?", c: "Dificultad para recordar aspectos del evento; alteraciones negativas en cognición (criterio D del DSM-5-TR)." },
  7: { s: "III", t: "¿Ha disminuido su interés en sus actividades cotidianas?", c: "Disminución del interés; alteraciones del estado de ánimo (criterio D del DSM-5-TR)." },
  8: { s: "III", t: "¿Se ha sentido usted alejado o distante de los demás?", c: "Desapego o distanciamiento de los demás (criterio D del DSM-5-TR)." },
  9: { s: "III", t: "¿Ha notado que tiene dificultad para expresar sus sentimientos?", c: "Restricción en la expresión emocional (criterio D del DSM-5-TR)." },
  10: { s: "III", t: "¿Ha tenido la impresión de que su vida se va a acortar, que va a morir antes que otras personas o que tiene un futuro limitado?", c: "Expectativas negativas sobre el futuro (criterio D del DSM-5-TR)." },
  11: { s: "IV", t: "¿Ha tenido usted dificultades para dormir?", c: "Hiperactivación: alteraciones del sueño (criterio E del DSM-5-TR)." },
  12: { s: "IV", t: "¿Ha estado particularmente irritable o le han dado arranques de coraje?", c: "Hiperactivación: irritabilidad (criterio E del DSM-5-TR)." },
  13: { s: "IV", t: "¿Ha tenido dificultad para concentrarse?", c: "Hiperactivación: dificultad de concentración (criterio E del DSM-5-TR)." },
  14: { s: "IV", t: "¿Ha estado nervioso o constantemente en alerta?", c: "Hiperactivación: hipervigilancia (criterio E del DSM-5-TR)." },
  15: { s: "IV", t: "¿Se ha sobresaltado fácilmente por cualquier cosa?", c: "Hiperactivación: respuesta de sobresalto (criterio E del DSM-5-TR)." },
};

export function describirPregunta(clave: string, textoPlataforma: string) {
  const [guia, num] = clave.split(".");
  const n = Number(num);

  if (guia === "I" && GUIA_I[n]) {
    return {
      texto: GUIA_I[n].t,
      seccion: SECCIONES_I[GUIA_I[n].s],
      constructo: GUIA_I[n].c,
    };
  }

  const categoria = Object.entries(CATEGORIAS).find(([, c]) =>
    (c.items as number[]).includes(n)
  )?.[0];
  const dominio = Object.entries(DOMINIOS).find(([, c]) =>
    (c.items as number[]).includes(n)
  )?.[0];

  return {
    texto: textoPlataforma,
    seccion: [categoria && `Categoría: ${categoria}`, dominio && `Dominio: ${dominio}`]
      .filter(Boolean)
      .join(" · "),
    constructo: dominio ? `${dominio}${categoria ? ` (${categoria})` : ""}.` : "",
  };
}

/* ---------- Interpretación grupal de respaldo (sin nombres) ---------- */

const INVERSOS_II = new Set([18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33]);

export function interpretacionGrupal(
  clave: string,
  respuestas: Record<string, number>,
  total: number
) {
  const p = (x: number) => (total ? Math.round((x / total) * 100) : 0);

  if (clave.startsWith("I.")) {
    const si = respuestas["Sí"] || 0;
    if (!si)
      return {
        interpretacion: `Las ${total} personas respondieron «No» (100%). En este reactivo no se observan indicios en el grupo.`,
        accion: "No se requiere una acción específica; conservar el canal confidencial de apoyo y volver a aplicar la Guía I si ocurre un acontecimiento en el trabajo.",
      };
    return {
      interpretacion: `${si} de ${total} personas (${p(si)}%) respondieron «Sí» y ${total - si} (${p(total - si)}%) «No». ${
        total < 10 ? `Con un grupo de ${total}, cada respuesta equivale a ${p(1)} puntos porcentuales, por lo que no indica por sí sola una tendencia del grupo. ` : ""
      }La lectura debe hacerse junto con la Sección I y los criterios oficiales de la Guía I.`,
      accion: "Revisar de forma confidencial el contexto de estas respuestas y reforzar, para todo el grupo, la información sobre el apoyo psicológico disponible.",
    };
  }

  const n = Number(clave.split(".")[1]);
  const inverso = INVERSOS_II.has(n);
  const altas = inverso
    ? (respuestas["Nunca"] || 0) + (respuestas["Casi nunca"] || 0)
    : (respuestas["Siempre"] || 0) + (respuestas["Casi siempre"] || 0);
  const medias = respuestas["Algunas veces"] || 0;
  const etiqueta = inverso ? "«Nunca» o «Casi nunca»" : "«Siempre» o «Casi siempre»";

  return {
    interpretacion: `${altas} de ${total} personas (${p(altas)}%) se ubican en ${etiqueta}, que es la zona de mayor exposición para este reactivo, y ${medias} (${p(
      medias
    )}%) respondieron «Algunas veces». ${
      p(altas) >= 50
        ? "La mayoría del grupo reporta exposición frecuente, por lo que es un tema organizacional y no individual."
        : p(altas) >= 25
        ? "Un grupo relevante reporta exposición frecuente; conviene revisar en qué puestos se concentra."
        : "La exposición frecuente se limita a un grupo reducido."
    }`,
    accion:
      p(altas) >= 25
        ? "Revisar las condiciones de trabajo asociadas a este reactivo con los responsables de área e incluirlo en el plan de acción."
        : "Mantener las condiciones actuales y vigilar el reactivo en la siguiente aplicación.",
  };
}

/* ---------- Resúmenes de la Guía II ---------- */

export function resumirBloques(
  evaluaciones: { categorias: any[]; dominios: any[] }[],
  tipo: "categorias" | "dominios"
): BloqueNivel[] {
  const mapa = new Map<string, { niveles: Record<string, number>; puntajes: number[] }>();

  evaluaciones.forEach((cal) =>
    (cal[tipo] || []).forEach((b: any) => {
      const v = mapa.get(b.nombre) || { niveles: {}, puntajes: [] };
      v.niveles[b.nivel] = (v.niveles[b.nivel] || 0) + 1;
      v.puntajes.push(Number(b.puntaje || 0));
      mapa.set(b.nombre, v);
    })
  );

  return Array.from(mapa.entries()).map(([nombre, v]) => {
    // Predominante: el más frecuente; empata hacia el de mayor riesgo.
    const predominante =
      [...NIVELES]
        .reverse()
        .sort((a, b) => (v.niveles[b] || 0) - (v.niveles[a] || 0))[0] || "Sin dato";
    return {
      nombre,
      niveles: v.niveles,
      promedio: v.puntajes.reduce((a, b) => a + b, 0) / (v.puntajes.length || 1),
      predominante,
    };
  });
}

/* ---------- Hechos verificados para la IA ---------- */

/*
  Frases con cifras ya calculadas por Psyqus. La IA solo
  puede citar cifras de esta lista (evita que invente).
*/
export function hechosVerificados(d: {
  personas: number;
  preguntas: { clave: string; respuestas: Record<string, number>; total: number }[];
  cuestionarioI?: { total: number; conAcontecimiento: number; conAlgunSi: number; requierenValoracion: number; sinAcontecimientoConSi: number };
  cuestionarioII?: { total: number; distribucion: Record<string, number>; categorias: BloqueNivel[]; dominios: BloqueNivel[] };
}) {
  const h: string[] = [`Personas evaluadas: ${d.personas}.`];
  const pct = (x: number, t: number) => (t ? Math.round((x / t) * 100) : 0);

  if (d.cuestionarioI?.total) {
    const q = d.cuestionarioI;
    const pregI = d.preguntas.filter((p) => p.clave.startsWith("I."));
    const totalSi = pregI.reduce((a, p) => a + (p.respuestas["Sí"] || 0), 0);
    const conSi = pregI.filter((p) => p.respuestas["Sí"]).map((p) => `${p.clave} (${p.respuestas["Sí"]})`);
    h.push(
      `Guía I aplicada a ${q.total} personas (15 preguntas Sí/No, ${q.total * 15} respuestas en total).`,
      `Guía I: ${q.conAcontecimiento} de ${q.total} personas respondieron «Sí» en la Sección I (acontecimiento traumático severo).`,
      `Guía I: ${totalSi} de ${q.total * 15} respuestas fueron «Sí»${conSi.length ? `; preguntas con «Sí» (número de personas): ${conSi.join(", ")}` : ""}.`,
      `Guía I: ${q.conAlgunSi} de ${q.total} personas dieron al menos un «Sí».`,
      `Guía I: ${q.sinAcontecimientoConSi} de ${q.total} personas respondieron «Sí» en las secciones II a IV sin haber reportado acontecimiento en la Sección I (inconsistencia de aplicación).`,
      `Guía I: ${q.requierenValoracion} de ${q.total} personas requieren valoración clínica según el criterio del DOF.`
    );
  }

  if (d.cuestionarioII?.total) {
    const q = d.cuestionarioII;
    h.push(
      `Guía II aplicada a ${q.total} personas.`,
      `Guía II, nivel de riesgo final: ${NIVELES.map((nv) => `${nv} ${q.distribucion[nv] || 0} (${pct(q.distribucion[nv] || 0, q.total)}%)`).join(", ")}.`,
      ...q.categorias.map((c) => `Categoría «${c.nombre}»: nivel predominante ${c.predominante}; distribución ${NIVELES.map((nv) => `${nv} ${c.niveles[nv] || 0}`).join(", ")}.`),
      ...q.dominios.map((c) => `Dominio «${c.nombre}»: nivel predominante ${c.predominante}; distribución ${NIVELES.map((nv) => `${nv} ${c.niveles[nv] || 0}`).join(", ")}.`)
    );
  }

  return h;
}

/* ---------- Interpretación general de respaldo ---------- */

export function interpretacionGeneralRespaldo(d: {
  personas: number;
  cuestionarioI?: { total: number; conAcontecimiento: number; requierenValoracion: number; sinAcontecimientoConSi: number };
  cuestionarioII?: { total: number; distribucion: Record<string, number>; dominios: BloqueNivel[] };
}): InterpretacionGeneral {
  const parrafos: string[] = [];
  const focos: string[] = [];
  const fortalezas: string[] = [];
  const plan: InterpretacionGeneral["planDeAccion"] = [];
  let nivel = "Bajo";

  if (d.cuestionarioI?.total) {
    const q = d.cuestionarioI;
    parrafos.push(
      `En la Guía I se evaluó a ${q.total} personas. ${q.conAcontecimiento} reportaron un acontecimiento traumático severo y ${q.requierenValoracion} cumplen los criterios oficiales para valoración clínica.`
    );
    if (q.requierenValoracion) {
      focos.push(`${q.requierenValoracion} persona(s) requieren canalización a valoración clínica (numeral 5.5).`);
      plan.push({ hallazgo: "Personas con criterio de valoración clínica", accion: "Canalizar a la institución de seguridad social, servicio privado o médico de la empresa", responsable: "Recursos Humanos", plazo: "Inmediato", referencia: "Numeral 5.5" });
    } else fortalezas.push("Nadie cumple criterios de valoración clínica en la Guía I.");
    if (q.sinAcontecimientoConSi)
      focos.push("Corregir la aplicación de la Guía I: hubo respuestas en las secciones II a IV sin acontecimiento reportado.");
    plan.push({ hallazgo: "Identificación continua", accion: "Aplicar la Guía I tras cualquier acontecimiento grave y al personal de nuevo ingreso", responsable: "Recursos Humanos", plazo: "Permanente", referencia: "Numeral 5.5" });
  }

  if (d.cuestionarioII?.total) {
    const q = d.cuestionarioII;
    const altos = (q.distribucion["Alto"] || 0) + (q.distribucion["Muy alto"] || 0);
    const medios = q.distribucion["Medio"] || 0;
    const pc = Math.round((altos / q.total) * 100);
    nivel = pc >= 50 ? "Alto" : pc >= 25 || medios / q.total >= 0.4 ? "Medio" : "Bajo";
    parrafos.push(
      `En la Guía II se evaluó a ${q.total} personas: ${altos} (${pc}%) están en nivel Alto o Muy alto y ${medios} en nivel Medio.`
    );
    const criticos = q.dominios
      .filter((x) => ["Alto", "Muy alto", "Medio"].includes(x.predominante))
      .sort((a, b) => NIVELES.indexOf(b.predominante) - NIVELES.indexOf(a.predominante));
    criticos.slice(0, 4).forEach((x) => focos.push(`Dominio «${x.nombre}»: nivel predominante ${x.predominante}.`));
    q.dominios
      .filter((x) => ["Nulo o despreciable", "Bajo"].includes(x.predominante))
      .slice(0, 3)
      .forEach((x) => fortalezas.push(`Dominio «${x.nombre}» con nivel predominante ${x.predominante}.`));
    if (criticos.length)
      plan.push({ hallazgo: `Dominios con nivel ${criticos[0].predominante}`, accion: "Diseñar acciones de control específicas para los dominios con mayor nivel", responsable: "Dirección y Recursos Humanos", plazo: "60 días", referencia: "Numerales 8.1 a 8.4" });
    if (altos)
      plan.push({ hallazgo: "Personas en nivel Alto o Muy alto", accion: "Valorar evaluación psicológica o médica cuando existan signos o síntomas", responsable: "Psyqus / servicio médico", plazo: "30 días", referencia: "Numeral 5.6" });
  }

  plan.push(
    { hallazgo: "Comunicación de resultados", accion: "Difundir los resultados generales y el canal confidencial de quejas y apoyo", responsable: "Recursos Humanos", plazo: "30 días", referencia: "Numerales 5.7 y 8.1 b)" },
    { hallazgo: "Política de prevención", accion: "Establecer por escrito y difundir la política de prevención de riesgos psicosociales", responsable: "Dirección", plazo: "60 días", referencia: "Numeral 5.1" }
  );

  return {
    nivelGeneral: nivel,
    resumenEjecutivo: parrafos.join(" "),
    interpretacionGeneral: parrafos,
    tendencia: focos.length
      ? "Si no se atienden los focos señalados, es probable que se mantengan o aumenten los niveles observados en esos dominios en la siguiente aplicación."
      : "Con los datos actuales, la organización se mantiene estable; conviene sostener las acciones preventivas.",
    fortalezas,
    focosDeAtencion: focos,
    planDeAccion: plan,
    limitaciones: [],
    fuente: "psyqus",
  };
}
