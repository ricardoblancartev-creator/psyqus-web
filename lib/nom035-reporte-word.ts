/*
  Reporte detallado NOM-035 en Word (.docx), generado en
  el navegador con gráficas NATIVAS de Office (cada una
  con su libro .xlsx incrustado: clic derecho > Editar datos).

  Orden de lectura: primero los datos (los mismos del
  Excel), luego la interpretación por pregunta y al final
  la interpretación general de toda la evaluación.
*/

import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  TIPO_CONTENIDO_GRAFICA,
  colorRespuesta,
  escaparXml,
  xmlBarras,
  xmlPastel,
} from "./nom035-graficas-ooxml";

export const NIVELES = [
  "Nulo o despreciable",
  "Bajo",
  "Medio",
  "Alto",
  "Muy alto",
] as const;

// Semáforo de la Guía de Referencia II.
export const COLOR_NIVEL: Record<string, string> = {
  "Nulo o despreciable": "38BDF8",
  Bajo: "4ADE80",
  Medio: "FACC15",
  Alto: "FB923C",
  "Muy alto": "EF4444",
};

export type PreguntaReporte = {
  clave: string;
  texto: string;
  seccion: string;
  constructo: string;
  respuestas: Record<string, number>;
  total: number;
  interpretacion: string;
  accion: string;
  fuente: "ia" | "psyqus";
};

export type BloqueNivel = {
  nombre: string;
  niveles: Record<string, number>;
  promedio: number;
  predominante: string;
};

export type InterpretacionGeneral = {
  nivelGeneral: string;
  resumenEjecutivo: string;
  interpretacionGeneral: string[];
  tendencia: string;
  fortalezas: string[];
  focosDeAtencion: string[];
  planDeAccion: {
    hallazgo: string;
    accion: string;
    responsable: string;
    plazo: string;
    referencia: string;
  }[];
  limitaciones: string[];
  fuente: "ia" | "psyqus";
};

export type DatosReporte = {
  empresa: string;
  fecha: string;
  personas: number;
  preguntas: PreguntaReporte[];
  cuestionarioI?: {
    total: number;
    conAcontecimiento: number;
    conAlgunSi: number;
    requierenValoracion: number;
    sinAcontecimientoConSi: number;
    personasSeguimiento: string[];
  };
  cuestionarioII?: {
    total: number;
    distribucion: Record<string, number>;
    categorias: BloqueNivel[];
    dominios: BloqueNivel[];
    personasAltas: { nombre: string; nivel: string }[];
  };
  general: InterpretacionGeneral;
  logo: ArrayBuffer;
};

const C = {
  pri: "0891B2",
  osc: "0F172A",
  gris: "475569",
  claro: "F1F5F9",
  borde: "CBD5E1",
};
const FONT = "Arial";

const pct = (x: number, t: number) => (t > 0 ? Math.round((x / t) * 100) : 0);

async function construirReporteWord(datos: DatosReporte) {
  const d: any = await import("docx");
  const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    ImageRun,
    Header,
    Footer,
    AlignmentType,
    HeadingLevel,
    TableOfContents,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
    BorderStyle,
    PageNumber,
    LevelFormat,
    VerticalAlign,
  } = d;

  const tieneI = Boolean(datos.cuestionarioI?.total);
  const tieneII = Boolean(datos.cuestionarioII?.total);
  const guias = [tieneI && "I", tieneII && "II"].filter(Boolean) as string[];
  const nombreGuias =
    guias.length === 2
      ? "Guías de Referencia I y II"
      : `Guía de Referencia ${guias[0] || "I"}`;

  /* ---------- Ayudantes ---------- */
  const run = (t: string, o: any = {}) => new TextRun({ text: t, font: FONT, ...o });
  const para = (t: any, o: any = {}) =>
    new Paragraph({
      spacing: { after: 140, line: 288 },
      ...o,
      children: Array.isArray(t) ? t : [run(String(t))],
    });
  const h1 = (t: string, salto = true) =>
    new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: salto, children: [run(t)] });
  const h2 = (t: string, salto = false) =>
    new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: salto, children: [run(t)] });
  const vineta = (t: any) =>
    new Paragraph({
      numbering: { reference: "vinetas", level: 0 },
      spacing: { after: 80, line: 276 },
      children: Array.isArray(t) ? t : [run(String(t))],
    });
  const nota = (t: string) =>
    para([run(t, { italics: true, size: 18, color: C.gris })], { spacing: { after: 100 } });

  const bordes = {
    top: { style: BorderStyle.SINGLE, size: 4, color: C.borde },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: C.borde },
    left: { style: BorderStyle.SINGLE, size: 4, color: C.borde },
    right: { style: BorderStyle.SINGLE, size: 4, color: C.borde },
  };

  function tabla(
    anchos: number[],
    filas: (string | { texto: string; fondo?: string; negrita?: boolean })[][],
    tam = 18
  ) {
    const total = anchos.reduce((a, b) => a + b, 0);
    return new Table({
      width: { size: total, type: WidthType.DXA },
      columnWidths: anchos,
      rows: filas.map(
        (fila, r) =>
          new TableRow({
            tableHeader: r === 0,
            cantSplit: true,
            children: fila.map((celda, c) => {
              const obj = typeof celda === "string" ? { texto: celda } : celda;
              const fondo =
                r === 0 ? C.osc : obj.fondo || (r % 2 === 0 ? C.claro : undefined);
              return new TableCell({
                width: { size: anchos[c], type: WidthType.DXA },
                borders: bordes,
                verticalAlign: VerticalAlign.CENTER,
                shading: fondo
                  ? { type: ShadingType.CLEAR, fill: fondo, color: "auto" }
                  : undefined,
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
                children: [
                  new Paragraph({
                    spacing: { after: 0 },
                    children: [
                      run(obj.texto, {
                        size: tam,
                        bold: r === 0 || obj.negrita,
                        color: r === 0 ? "FFFFFF" : C.osc,
                      }),
                    ],
                  }),
                ],
              });
            }),
          })
      ),
    });
  }

  /* ---------- Gráficas ---------- */
  type Grafica = { xml: string; xlsx: ArrayBuffer; cx: number; cy: number; nombre: string };
  const graficas: Grafica[] = [];

  const libro = (aoa: any[][]) => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Hoja1");
    return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  };

  const marcaGrafica = (k: number) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      keepNext: true,
      children: [run(`§§GRAFICA_${k}§§`)],
    });

  function pastel(nombre: string, categorias: string[], valores: number[], cy = 2834640) {
    graficas.push({
      xml: xmlPastel({
        refNombreSerie: "Hoja1!$B$1",
        refCategorias: `Hoja1!$A$2:$A$${categorias.length + 1}`,
        refValores: `Hoja1!$B$2:$B$${categorias.length + 1}`,
        categorias,
        valores,
        conLibroIncrustado: true,
      }),
      xlsx: libro([["Respuesta", "Personas"], ...categorias.map((c, i) => [c, valores[i]])]),
      cx: 5029200,
      cy,
      nombre,
    });
    return marcaGrafica(graficas.length);
  }

  function barras(
    nombre: string,
    categorias: string[],
    series: { nombre: string; valores: number[]; color: string }[],
    opciones: { maximo?: number; tituloEje?: string; alto?: number }
  ) {
    const col = (i: number) => XLSX.utils.encode_col(i + 1);
    const ultima = categorias.length + 1;
    graficas.push({
      xml: xmlBarras({
        refCategorias: `Hoja1!$A$2:$A$${ultima}`,
        categorias,
        series: series.map((s, i) => ({
          nombre: s.nombre,
          refNombre: `Hoja1!$${col(i)}$1`,
          refValores: `Hoja1!$${col(i)}$2:$${col(i)}$${ultima}`,
          valores: s.valores,
          color: s.color,
        })),
        maximo: opciones.maximo,
        apiladas: true,
        tituloEjeValores: opciones.tituloEje,
        conLibroIncrustado: true,
      }),
      xlsx: libro([
        ["Categoría", ...series.map((s) => s.nombre)],
        ...categorias.map((c, i) => [c, ...series.map((s) => s.valores[i])]),
      ]),
      cx: 5943600,
      cy: opciones.alto || Math.min(6400800, 914400 + categorias.length * 260000),
      nombre,
    });
    return marcaGrafica(graficas.length);
  }

  /* ---------- Contenido ---------- */
  const n = datos.personas;
  const g = datos.general;
  const hijos: any[] = [];

  // Portada
  hijos.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 500, after: 360 },
      children: [new ImageRun({ type: "jpg", data: datos.logo, transformation: { width: 170, height: 170 } })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [run("Reporte de Resultados NOM-035", { bold: true, size: 48, color: C.pri })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 560 },
      children: [run(`${nombreGuias} · Factores de riesgo psicosocial en el trabajo`, { size: 26 })],
    }),
    ...[
      ["Empresa", datos.empresa],
      ["Fecha del reporte", datos.fecha],
      ["Personas evaluadas", String(n)],
      ["Elaborado por", "Psyqus"],
    ].map(
      ([k, v]) =>
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [run(`${k}: `, { bold: true, size: 24, color: C.gris }), run(v, { size: 24 })],
        })
    ),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 900 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 12, color: C.pri, space: 8 },
        bottom: { style: BorderStyle.SINGLE, size: 12, color: C.pri, space: 8 },
      },
      children: [run("CONFIDENCIAL", { bold: true, size: 28, color: C.pri, characterSpacing: 60 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160 },
      children: [
        run("Documento de uso exclusivo de la dirección y del personal responsable de la NOM-035.", {
          size: 18,
          color: C.gris,
        }),
      ],
    })
  );

  // Índice
  hijos.push(
    new Paragraph({
      pageBreakBefore: true,
      spacing: { after: 240 },
      children: [run("Índice", { bold: true, size: 32, color: C.pri })],
    }),
    new TableOfContents("Índice", { hyperlink: true, headingStyleRange: "1-2" }),
    nota("Si el índice aparece vacío, haga clic derecho sobre él y elija «Actualizar campos».")
  );

  // 1. Resumen ejecutivo
  const kpis: string[][] = [["Indicador", "Resultado"], ["Personas evaluadas", String(n)]];
  if (tieneI) {
    const q = datos.cuestionarioI!;
    kpis.push(
      ["Guía I · reportaron acontecimiento traumático severo", `${q.conAcontecimiento} de ${q.total}`],
      ["Guía I · requieren valoración clínica (criterio DOF)", `${q.requierenValoracion} de ${q.total}`]
    );
  }
  if (tieneII) {
    const q = datos.cuestionarioII!;
    const altos = (q.distribucion["Alto"] || 0) + (q.distribucion["Muy alto"] || 0);
    kpis.push(
      ["Guía II · personas en nivel Alto o Muy alto", `${altos} de ${q.total} (${pct(altos, q.total)}%)`],
      [
        "Guía II · nivel predominante",
        (() => {
          const max = Math.max(...Object.values(q.distribucion));
          const empatados = NIVELES.filter((nv) => (q.distribucion[nv] || 0) === max && max > 0);
          return empatados.length > 1
            ? `${empatados.join(" y ")} (empate, ${max} cada uno)`
            : empatados[0] || "Sin dato";
        })(),
      ]
    );
  }

  hijos.push(
    h1("1. Resumen ejecutivo"),
    para([
      run("Nivel de riesgo general: ", { bold: true }),
      run(g.nivelGeneral || "Sin determinar", { bold: true, color: C.pri }),
    ]),
    para(g.resumenEjecutivo),
    tabla([6200, 3160], kpis, 19),
    h2("Focos de atención"),
    ...(g.focosDeAtencion.length ? g.focosDeAtencion : ["Sin focos de atención relevantes."]).map(vineta),
    nota(
      g.fuente === "ia"
        ? "Las interpretaciones se generaron con el motor de análisis de Psyqus a partir de datos anónimos y agregados, y deben revisarse por un profesional."
        : "Interpretaciones generadas con las reglas de Psyqus a partir de los datos calificados."
    )
  );

  // 2. Marco normativo
  hijos.push(
    h1("2. Marco normativo"),
    para(
      "La NOM-035-STPS-2018, «Factores de riesgo psicosocial en el trabajo-Identificación, análisis y prevención», se publicó en el Diario Oficial de la Federación (DOF) el 23 de octubre de 2018. Su objetivo es «establecer los elementos para identificar, analizar y prevenir los factores de riesgo psicosocial, así como para promover un entorno organizacional favorable en los centros de trabajo»."
    ),
    para(
      "Según su numeral 2, la Norma «rige en todo el territorio nacional y aplica en todos los centros de trabajo», y sus obligaciones varían según el número de trabajadores: hasta 15, de 16 a 50 y más de 50."
    )
  );
  if (tieneI)
    hijos.push(
      para([
        run("Guía de Referencia I. ", { bold: true }),
        run(
          "El numeral 5.5 obliga a «identificar a los trabajadores que fueron sujetos a acontecimientos traumáticos severos durante o con motivo del trabajo y, canalizarlos para su atención a la institución de seguridad social o privada, o al médico del centro de trabajo o de la empresa». Esta obligación aplica a todos los centros de trabajo. La Guía I es un ejemplo de cuestionario para cumplirla y, según la propia Norma, «no es de cumplimiento obligatorio»."
        ),
      ])
    );
  if (tieneII)
    hijos.push(
      para([
        run("Guía de Referencia II. ", { bold: true }),
        run(
          "En los centros de trabajo de 16 a 50 trabajadores, el numeral 5.2 obliga a identificar y analizar los factores de riesgo psicosocial (numerales 7.1 inciso a y 7.2). La Guía II ofrece el cuestionario para hacerlo y clasifica los resultados en categorías, dominios y niveles de riesgo."
        ),
      ])
    );
  hijos.push(
    para([
      run("Acontecimiento traumático severo (numeral 4.1). ", { bold: true }),
      run(
        "«Aquel experimentado durante o con motivo del trabajo que se caracteriza por la ocurrencia de la muerte o que representa un peligro real para la integridad física de una o varias personas y que puede generar trastorno de estrés postraumático para quien lo sufre o lo presencia.»"
      ),
    ]),
    nota("Fuente: STPS. NOM-035-STPS-2018. Diario Oficial de la Federación, 23 de octubre de 2018.")
  );

  // 3. Metodología
  hijos.push(
    h1("3. Metodología"),
    tabla(
      [3200, 6160],
      [
        ["Elemento", "Detalle"],
        ["Instrumentos", nombreGuias],
        ["Personas evaluadas (n)", String(n)],
        ["Tasa de respuesta", "No se puede calcular sin la plantilla total del centro de trabajo."],
        ["Fuente de datos", "Respuestas registradas en la plataforma Psyqus; son las mismas que contiene el Excel de resultados."],
        ["Confidencialidad", "Los resultados se presentan de forma grupal."],
      ],
      19
    )
  );
  if (tieneI)
    hijos.push(
      h2("Criterios oficiales de la Guía I"),
      para([
        run("a) ", { bold: true }),
        run(
          "«Si todas las respuestas a la Sección I Acontecimiento traumático severo, son NO, no es necesario responder las demás secciones, y el trabajador no requiere una valoración clínica», y"
        ),
      ]),
      para([
        run("b) ", { bold: true }),
        run(
          "«En caso contrario, si alguna respuesta a la Sección I es SÍ, se requiere contestar las secciones II, III y IV; el trabajador requerirá atención clínica en cualquiera de los casos siguientes:"
        ),
      ]),
      vineta("1) Cuando responda «Sí», en alguna de las preguntas de la Sección II Recuerdos persistentes sobre acontecimiento;"),
      vineta("2) Cuando responda «Sí», en tres o más de las preguntas de la Sección III Esfuerzo por evitar circunstancias parecidas o asociadas al acontecimiento, o"),
      vineta("3) Cuando responda «Sí», en dos o más de las preguntas de la Sección IV Afectación.»")
    );
  if (tieneII)
    hijos.push(
      h2("Calificación de la Guía II"),
      para(
        "Cada reactivo se califica de 0 a 4 según su sentido (directo o inverso). La suma total ubica a la persona en un nivel de riesgo; las categorías y los dominios se califican con sus propios puntos de corte."
      ),
      tabla(
        [4680, 4680],
        [
          ["Nivel de riesgo (calificación final)", "Puntaje"],
          [{ texto: "Nulo o despreciable", fondo: COLOR_NIVEL["Nulo o despreciable"] }, "Menor a 20"],
          [{ texto: "Bajo", fondo: COLOR_NIVEL.Bajo }, "20 a menos de 45"],
          [{ texto: "Medio", fondo: COLOR_NIVEL.Medio }, "45 a menos de 70"],
          [{ texto: "Alto", fondo: COLOR_NIVEL.Alto }, "70 a menos de 90"],
          [{ texto: "Muy alto", fondo: COLOR_NIVEL["Muy alto"] }, "90 o más"],
        ],
        19
      )
    );
  const limitaciones = [...g.limitaciones];
  if (tieneI && datos.cuestionarioI!.sinAcontecimientoConSi > 0)
    limitaciones.unshift(
      `${datos.cuestionarioI!.sinAcontecimientoConSi} persona(s) respondieron «Sí» en las secciones II a IV sin reportar un acontecimiento en la Sección I. Según el inciso a) del DOF esas secciones no debían contestarse, por lo que no cuentan para la valoración clínica.`
    );
  if (n < 10) limitaciones.push(`Grupo pequeño (n = ${n}): una sola respuesta cambia los porcentajes en ${pct(1, n)} puntos.`);
  if (limitaciones.length) hijos.push(h2("Limitaciones"), ...Array.from(new Set(limitaciones)).map(vineta));

  // 4. Resultados generales
  hijos.push(h1("4. Resultados generales"));
  const pregI = datos.preguntas.filter((p) => p.clave.startsWith("I."));
  if (tieneI && pregI.length) {
    hijos.push(
      h2("Guía I · respuestas por reactivo"),
      barras(
        "Guía I por reactivo",
        pregI.map((p) => p.clave),
        [
          { nombre: "Sí", valores: pregI.map((p) => p.respuestas["Sí"] || 0), color: colorRespuesta("Sí", 0) },
          { nombre: "No", valores: pregI.map((p) => p.respuestas["No"] || 0), color: colorRespuesta("No", 1) },
        ],
        { maximo: datos.cuestionarioI!.total, tituloEje: `Número de personas (n = ${datos.cuestionarioI!.total})`, alto: 4572000 }
      ),
      nota("Figura. Respuestas «Sí» y «No» por reactivo de la Guía I.")
    );
  }
  if (tieneII) {
    const q = datos.cuestionarioII!;
    hijos.push(
      h2("Guía II · nivel de riesgo final", tieneI),
      pastel("Nivel final Guía II", [...NIVELES], NIVELES.map((nv) => q.distribucion[nv] || 0)),
      tabla(
        [3120, 3120, 3120],
        [
          ["Nivel", "Personas", "Porcentaje"],
          ...NIVELES.map((nv) => [
            { texto: nv, fondo: COLOR_NIVEL[nv] },
            String(q.distribucion[nv] || 0),
            `${pct(q.distribucion[nv] || 0, q.total)}%`,
          ]),
        ]
      ),
      h2("Guía II · niveles por categoría", true),
      barras(
        "Niveles por categoría",
        q.categorias.map((c) => c.nombre),
        NIVELES.map((nv) => ({ nombre: nv, valores: q.categorias.map((c) => c.niveles[nv] || 0), color: COLOR_NIVEL[nv] })),
        { maximo: q.total, tituloEje: "Número de personas" }
      ),
      tabla(
        [4400, 2480, 2480],
        [
          ["Categoría", "Nivel predominante", "Puntaje promedio"],
          ...q.categorias.map((c) => [c.nombre, { texto: c.predominante, fondo: COLOR_NIVEL[c.predominante] }, c.promedio.toFixed(1)]),
        ]
      ),
      h2("Guía II · niveles por dominio", true),
      barras(
        "Niveles por dominio",
        q.dominios.map((c) => c.nombre),
        NIVELES.map((nv) => ({ nombre: nv, valores: q.dominios.map((c) => c.niveles[nv] || 0), color: COLOR_NIVEL[nv] })),
        { maximo: q.total, tituloEje: "Número de personas" }
      ),
      tabla(
        [4400, 2480, 2480],
        [
          ["Dominio", "Nivel predominante", "Puntaje promedio"],
          ...q.dominios.map((c) => [c.nombre, { texto: c.predominante, fondo: COLOR_NIVEL[c.predominante] }, c.promedio.toFixed(1)]),
        ]
      )
    );
  }

  // 5. Resultados por pregunta
  hijos.push(
    h1("5. Resultados por pregunta"),
    para(
      "Cada página presenta un reactivo: su sección, el texto, la distribución de respuestas (gráfica editable) y la interpretación. Las interpretaciones describen al grupo y no constituyen un diagnóstico individual."
    )
  );
  datos.preguntas.forEach((p, i) => {
    const opciones = Object.keys(p.respuestas);
    hijos.push(
      h2(`Pregunta ${p.clave}`, i > 0),
      para([run(p.seccion, { bold: true, color: C.pri })], { spacing: { after: 60 } }),
      para([run(p.texto, { italics: true })]),
      pastel(`Pregunta ${p.clave}`, opciones, opciones.map((o) => p.respuestas[o] || 0), 2651760),
      tabla(
        [3120, 3120, 3120],
        [["Respuesta", "Personas", "Porcentaje"], ...opciones.map((o) => [o, String(p.respuestas[o] || 0), `${pct(p.respuestas[o] || 0, p.total)}%`])],
        17
      ),
      para([run("Interpretación", { bold: true })], { spacing: { before: 180, after: 60 } }),
      ...(p.constructo ? [para([run("Qué mide: ", { bold: true }), run(p.constructo)])] : []),
      ...p.interpretacion
        .split(/\n+/)
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => para(t)),
      para([run("Acción sugerida: ", { bold: true }), run(p.accion)])
    );
  });

  // 6. Interpretación general
  hijos.push(
    h1("6. Interpretación general de la evaluación"),
    ...g.interpretacionGeneral.map((t) => para(t)),
    h2("Hacia dónde va la organización"),
    para(g.tendencia || "Sin información suficiente para estimar una tendencia."),
    h2("Fortalezas"),
    ...(g.fortalezas.length ? g.fortalezas : ["Sin fortalezas destacadas en los datos."]).map(vineta),
    h2("Focos de atención"),
    ...(g.focosDeAtencion.length ? g.focosDeAtencion : ["Sin focos de atención relevantes."]).map(vineta)
  );

  // 7. Plan de acción
  hijos.push(
    h1("7. Plan de acción"),
    tabla(
      [2000, 2760, 1500, 1300, 1800],
      [
        ["Hallazgo", "Acción", "Responsable sugerido", "Plazo", "Referencia NOM"],
        ...g.planDeAccion.map((a) => [a.hallazgo, a.accion, a.responsable, a.plazo, a.referencia]),
      ],
      17
    )
  );

  // 8. Anexos
  hijos.push(h1("8. Anexos"), h2("Anexo A. Personas que requieren seguimiento (confidencial)"));
  const seguimiento: string[][] = [["Persona", "Motivo"]];
  datos.cuestionarioI?.personasSeguimiento.forEach((nombre) =>
    seguimiento.push([nombre, "Guía I: cumple criterio de valoración clínica"])
  );
  datos.cuestionarioII?.personasAltas.forEach((p) => seguimiento.push([p.nombre, `Guía II: nivel ${p.nivel}`]));
  if (seguimiento.length > 1) hijos.push(tabla([4680, 4680], seguimiento));
  if (seguimiento.length === 1)
    hijos.push(para("Ninguna persona cumple criterios de seguimiento individual con los datos disponibles."));
  hijos.push(
    nota("Este anexo identifica personas para canalización o seguimiento conforme al numeral 5.5 y no debe difundirse."),
    h2("Anexo B. Glosario"),
    ...[
      ["Acontecimiento traumático severo", "Evento vivido durante o con motivo del trabajo que implica muerte o peligro real para la integridad física (numeral 4.1)."],
      ["Canalización", "Envío del trabajador a la institución de seguridad social o privada, o al médico de la empresa (numeral 5.5)."],
      ["Factores de riesgo psicosocial", "Condiciones del trabajo que pueden provocar trastornos de ansiedad, del sueño o estrés grave, según la NOM-035."],
      ["Nivel de riesgo", "Clasificación de la Guía II: Nulo o despreciable, Bajo, Medio, Alto o Muy alto."],
      ["n", "Número de personas evaluadas."],
    ].map(([t, x]) => para([run(`${t}: `, { bold: true }), run(x)])),
    h2("Anexo C. Aviso de confidencialidad"),
    para(
      "Este reporte contiene información sobre la salud psicosocial del personal. Se entrega solo a la dirección y al personal responsable de la NOM-035. Su uso para decisiones de contratación, permanencia o sanción es contrario a su propósito."
    ),
    h2("Anexo D. Referencias"),
    para("Secretaría del Trabajo y Previsión Social. (2018, 23 de octubre). NOM-035-STPS-2018, Factores de riesgo psicosocial en el trabajo-Identificación, análisis y prevención. Diario Oficial de la Federación."),
    para("American Psychiatric Association. (2022). Diagnostic and Statistical Manual of Mental Disorders (5th ed., text rev.; DSM-5-TR).")
  );

  /* ---------- Documento ---------- */
  const doc = new Document({
    creator: "Psyqus",
    title: `Reporte NOM-035 · ${datos.empresa}`,
    features: { updateFields: true },
    styles: {
      default: {
        document: { run: { font: FONT, size: 22, color: C.osc } },
        heading1: { run: { font: FONT, size: 32, bold: true, color: C.pri }, paragraph: { spacing: { before: 0, after: 200 }, keepNext: true } },
        heading2: { run: { font: FONT, size: 26, bold: true, color: C.osc }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true } },
      },
    },
    numbering: {
      config: [
        {
          reference: "vinetas",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } }, run: { color: C.pri } } }],
        },
      ],
    },
    sections: [
      {
        properties: {
          titlePage: true,
          page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1300, left: 1440, right: 1440, header: 600, footer: 600 } },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.pri, space: 4 } },
                children: [
                  new ImageRun({ type: "jpg", data: datos.logo, transformation: { width: 32, height: 32 } }),
                  run(`   Reporte de Resultados NOM-035 · ${datos.empresa}`, { size: 18, color: C.gris }),
                ],
              }),
            ],
          }),
          first: new Header({ children: [new Paragraph({ children: [] })] }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  run("Psyqus · Confidencial · Página ", { size: 18, color: C.gris }),
                  new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18, color: C.gris }),
                  run(" de ", { size: 18, color: C.gris }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: C.gris }),
                ],
              }),
            ],
          }),
          first: new Footer({ children: [new Paragraph({ children: [] })] }),
        },
        children: hijos,
      },
    ],
  });

  /* ---------- Inserción de gráficas nativas ---------- */
  const paquete =
    typeof Packer.toArrayBuffer === "function"
      ? await Packer.toArrayBuffer(doc)
      : await (await Packer.toBlob(doc)).arrayBuffer();
  const zip = await JSZip.loadAsync(paquete);
  let docXml = await zip.file("word/document.xml")!.async("string");
  let rels = await zip.file("word/_rels/document.xml.rels")!.async("string");
  let tipos = await zip.file("[Content_Types].xml")!.async("string");

  graficas.forEach((gr, i) => {
    const k = i + 1;
    const marca = `§§GRAFICA_${k}§§`;
    const pos = docXml.indexOf(marca);
    if (pos < 0) throw new Error(`No se encontró ${marca}`);
    const ini = Math.max(docXml.lastIndexOf("<w:p>", pos), docXml.lastIndexOf("<w:p ", pos));
    const fin = docXml.indexOf("</w:p>", pos) + 6;
    const rid = `rIdGrafica${k}`;

    docXml =
      docXml.slice(0, ini) +
      `<w:p><w:pPr><w:keepNext/><w:spacing w:before="120" w:after="120"/><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${gr.cx}" cy="${gr.cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${
        5000 + k
      }" name="${escaparXml(gr.nombre)}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${rid}"/></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>` +
      docXml.slice(fin);

    zip.file(`word/charts/chart${k}.xml`, gr.xml);
    zip.file(
      `word/charts/_rels/chart${k}.xml.rels`,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/package" Target="../embeddings/Microsoft_Excel_Worksheet${k}.xlsx"/></Relationships>`
    );
    zip.file(`word/embeddings/Microsoft_Excel_Worksheet${k}.xlsx`, gr.xlsx);
    rels = rels.replace(
      "</Relationships>",
      `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="charts/chart${k}.xml"/></Relationships>`
    );
    tipos = tipos.replace(
      "</Types>",
      `<Override PartName="/word/charts/chart${k}.xml" ContentType="${TIPO_CONTENIDO_GRAFICA}"/></Types>`
    );
  });

  if (!/Extension="xlsx"/.test(tipos))
    tipos = tipos.replace(
      "</Types>",
      '<Default Extension="xlsx" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/></Types>'
    );

  zip.file("word/document.xml", docXml);
  zip.file("word/_rels/document.xml.rels", rels);
  zip.file("[Content_Types].xml", tipos);

  return zip;
}

export async function generarReporteWord(datos: DatosReporte): Promise<Blob> {
  const zip = await construirReporteWord(datos);
  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

/* Variante para pruebas en Node. */
export async function generarReporteWordBuffer(datos: DatosReporte) {
  const zip = await construirReporteWord(datos);
  return zip.generateAsync({ type: "nodebuffer" });
}
