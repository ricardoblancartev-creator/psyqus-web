/*
  Gráficas nativas de Office (DrawingML) para los
  reportes NOM-035: el mismo XML sirve para Excel
  (xl/charts) y Word (word/charts).

  - En Excel las series apuntan a celdas de la hoja.
  - En Word apuntan a un libro .xlsx incrustado y
    llevan <c:externalData> para que "Editar datos"
    lo abra.
*/

export const COLORES_RESPUESTA: Record<string, string> = {
  Sí: "22D3EE",
  No: "A78BFA",
  Siempre: "0E7490",
  "Casi siempre": "22D3EE",
  "Algunas veces": "FACC15",
  "Casi nunca": "A78BFA",
  Nunca: "CBD5E1",
  // Semáforo de niveles de riesgo (Guía II).
  "Nulo o despreciable": "38BDF8",
  Bajo: "4ADE80",
  Medio: "FACC15",
  Alto: "FB923C",
  "Muy alto": "EF4444",
};

const PALETA = ["0891B2", "22D3EE", "A78BFA", "FACC15", "FB7185", "86EFAC"];

export function colorRespuesta(nombre: string, indice: number) {
  return COLORES_RESPUESTA[nombre] || PALETA[indice % PALETA.length];
}

export function escaparXml(texto: string) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const NS =
  'xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" ' +
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';

function txPr(sz: number, negrita = false, color = "0F172A") {
  return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${sz}" b="${
    negrita ? 1 : 0
  }"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="Arial"/><a:cs typeface="Arial"/></a:defRPr></a:pPr><a:endParaRPr lang="es-MX"/></a:p></c:txPr>`;
}

function titulo(texto?: string) {
  if (!texto) return '<c:autoTitleDeleted val="1"/>';

  return `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1200" b="1"/></a:pPr><a:r><a:rPr lang="es-MX" sz="1200" b="1"><a:solidFill><a:srgbClr val="0F172A"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>${escaparXml(
    texto
  )}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/>`;
}

function strRef(ref: string, valores: string[]) {
  return `<c:strRef><c:f>${escaparXml(ref)}</c:f><c:strCache><c:ptCount val="${
    valores.length
  }"/>${valores
    .map(
      (v, i) => `<c:pt idx="${i}"><c:v>${escaparXml(v)}</c:v></c:pt>`
    )
    .join("")}</c:strCache></c:strRef>`;
}

function numRef(ref: string, valores: number[]) {
  return `<c:numRef><c:f>${escaparXml(
    ref
  )}</c:f><c:numCache><c:formatCode>General</c:formatCode><c:ptCount val="${
    valores.length
  }"/>${valores
    .map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`)
    .join("")}</c:numCache></c:numRef>`;
}

function cierre(conLibroIncrustado: boolean) {
  return `<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr>${txPr(
    1000
  )}${
    conLibroIncrustado
      ? '<c:externalData r:id="rId1"><c:autoUpdate val="0"/></c:externalData>'
      : ""
  }</c:chartSpace>`;
}

export type DatosPastel = {
  titulo?: string;
  refNombreSerie: string;
  refCategorias: string;
  refValores: string;
  categorias: string[];
  valores: number[];
  conLibroIncrustado: boolean;
};

/* Pastel sin hoyo, con cantidad y porcentaje. */
export function xmlPastel(d: DatosPastel) {
  const puntos = d.categorias
    .map(
      (cat, k) =>
        `<c:dPt><c:idx val="${k}"/><c:bubble3D val="0"/><c:spPr><a:solidFill><a:srgbClr val="${colorRespuesta(
          cat,
          k
        )}"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr></c:dPt>`
    )
    .join("");

  const ocultarCeros = d.valores
    .map((v, k) =>
      v === 0
        ? `<c:dLbl><c:idx val="${k}"/><c:delete val="1"/></c:dLbl>`
        : ""
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace ${NS}><c:date1904 val="0"/><c:lang val="es-MX"/><c:roundedCorners val="0"/><c:chart>${titulo(
    d.titulo
  )}<c:plotArea><c:layout/><c:pieChart><c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/><c:tx>${strRef(
    d.refNombreSerie,
    ["Personas"]
  )}</c:tx>${puntos}<c:dLbls>${ocultarCeros}<c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${txPr(
    1100,
    true
  )}<c:dLblPos val="outEnd"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showBubbleSize val="0"/><c:separator>; </c:separator><c:showLeaderLines val="1"/></c:dLbls><c:cat>${strRef(
    d.refCategorias,
    d.categorias
  )}</c:cat><c:val>${numRef(
    d.refValores,
    d.valores
  )}</c:val></c:ser><c:firstSliceAng val="0"/></c:pieChart><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea><c:legend><c:legendPos val="r"/><c:overlay val="0"/>${txPr(
    1000
  )}</c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>${cierre(
    d.conLibroIncrustado
  )}`;
}

export type SerieBarras = {
  nombre: string;
  refNombre: string;
  refValores: string;
  valores: number[];
  color: string;
};

export type DatosBarras = {
  titulo?: string;
  refCategorias: string;
  categorias: string[];
  series: SerieBarras[];
  maximo?: number;
  apiladas: boolean;
  tituloEjeValores?: string;
  conLibroIncrustado: boolean;
};

/* Barras horizontales (apiladas o agrupadas). */
export function xmlBarras(d: DatosBarras) {
  const series = d.series
    .map(
      (s, k) =>
        `<c:ser><c:idx val="${k}"/><c:order val="${k}"/><c:tx>${strRef(
          s.refNombre,
          [s.nombre]
        )}</c:tx><c:spPr><a:solidFill><a:srgbClr val="${
          s.color
        }"/></a:solidFill></c:spPr><c:invertIfNegative val="0"/><c:dLbls><c:numFmt formatCode="0;;;" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${txPr(
          900,
          true
        )}<c:dLblPos val="ctr"/><c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls><c:cat>${strRef(
          d.refCategorias,
          d.categorias
        )}</c:cat><c:val>${numRef(s.refValores, s.valores)}</c:val></c:ser>`
    )
    .join("");

  const tituloEje = d.tituloEjeValores
    ? `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1000" b="0"/></a:pPr><a:r><a:rPr lang="es-MX" sz="1000" b="0"><a:solidFill><a:srgbClr val="475569"/></a:solidFill><a:latin typeface="Arial"/></a:rPr><a:t>${escaparXml(
        d.tituloEjeValores
      )}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><c:chartSpace ${NS}><c:date1904 val="0"/><c:lang val="es-MX"/><c:roundedCorners val="0"/><c:chart>${titulo(
    d.titulo
  )}<c:plotArea><c:layout/><c:barChart><c:barDir val="bar"/><c:grouping val="${
    d.apiladas ? "stacked" : "clustered"
  }"/><c:varyColors val="0"/>${series}<c:gapWidth val="45"/>${
    d.apiladas ? '<c:overlap val="100"/>' : ""
  }<c:axId val="111111111"/><c:axId val="222222222"/></c:barChart><c:catAx><c:axId val="111111111"/><c:scaling><c:orientation val="maxMin"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:numFmt formatCode="General" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln w="9525"><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln></c:spPr>${txPr(
    900
  )}<c:crossAx val="222222222"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/><c:noMultiLvlLbl val="0"/></c:catAx><c:valAx><c:axId val="222222222"/><c:scaling><c:orientation val="minMax"/>${
    d.maximo ? `<c:max val="${d.maximo}"/>` : ""
  }<c:min val="0"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:majorGridlines><c:spPr><a:ln w="6350"><a:solidFill><a:srgbClr val="E2E8F0"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>${tituloEje}<c:numFmt formatCode="0" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr>${txPr(
    900
  )}<c:crossAx val="111111111"/><c:crosses val="max"/><c:crossBetween val="between"/></c:valAx><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr></c:plotArea><c:legend><c:legendPos val="t"/><c:overlay val="0"/>${txPr(
    1000
  )}</c:legend><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/></c:chart>${cierre(
    d.conLibroIncrustado
  )}`;
}

export const TIPO_CONTENIDO_GRAFICA =
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml";
