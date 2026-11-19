/*
  Agrega a un libro .xlsx (generado con SheetJS) una
  hoja "Gráficas" con una tabla y un pastel NATIVO de
  Excel por pregunta. Las gráficas leen las celdas de
  la hoja, así que se pueden editar en Excel.

  Se ejecuta en el navegador (JSZip ya está instalado).
*/

import JSZip from "jszip";
import * as XLSX from "xlsx";
import {
  TIPO_CONTENIDO_GRAFICA,
  escaparXml,
  xmlPastel,
} from "./nom035-graficas-ooxml";

export type PreguntaParaGrafica = {
  clave: string; // "I.4", "II.12"
  texto: string;
  respuestas: Record<string, number>; // en orden de opciones
  total: number;
};

const NOMBRE_HOJA = "Gráficas";
const FILAS_POR_BLOQUE = 18;

function letraColumna(indice: number) {
  return XLSX.utils.encode_col(indice);
}

/* Agrega la hoja de datos de las gráficas al libro. */
export function agregarHojaGraficas(
  workbook: XLSX.WorkBook,
  preguntas: PreguntaParaGrafica[]
) {
  const filas: any[][] = [];

  preguntas.forEach((p, b) => {
    const inicio = b * FILAS_POR_BLOQUE;

    while (filas.length < inicio) filas.push([]);

    filas.push([`Pregunta ${p.clave}`, p.texto]);
    filas.push(["Respuesta", "Personas", "Porcentaje"]);

    Object.entries(p.respuestas).forEach(([respuesta, cantidad]) => {
      filas.push([
        respuesta,
        Number(cantidad),
        p.total > 0 ? Number(cantidad) / p.total : 0,
      ]);
    });

    filas.push(["Total", p.total, p.total > 0 ? 1 : 0]);
  });

  const hoja = XLSX.utils.aoa_to_sheet(filas);

  hoja["!cols"] = [{ wch: 18 }, { wch: 12 }, { wch: 12 }];

  // Formato de porcentaje en la columna C.
  const rango = XLSX.utils.decode_range(hoja["!ref"] || "A1:C1");
  for (let r = 0; r <= rango.e.r; r++) {
    const celda = hoja[XLSX.utils.encode_cell({ r, c: 2 })];
    if (celda && typeof celda.v === "number") celda.z = "0.0%";
  }

  XLSX.utils.book_append_sheet(workbook, hoja, NOMBRE_HOJA);
}

/*
  Inserta los pasteles en el paquete ya escrito.
  Recibe el ArrayBuffer de XLSX.write(..., {type:"array"})
  y devuelve un Blob listo para descargar.
*/
async function prepararZip(
  libro: ArrayBuffer | Uint8Array,
  preguntas: PreguntaParaGrafica[]
) {
  const zip = await JSZip.loadAsync(libro);

  const workbookXml = await zip.file("xl/workbook.xml")!.async("string");
  const workbookRels = await zip
    .file("xl/_rels/workbook.xml.rels")!
    .async("string");

  // Ubicar el archivo de la hoja "Gráficas".
  const hojaTag = [...workbookXml.matchAll(/<sheet\b[^>]*\/>/g)]
    .map((m) => m[0])
    .find((tag) => tag.includes(`name="${escaparXml(NOMBRE_HOJA)}"`) || tag.includes(`name="${NOMBRE_HOJA}"`));

  if (!hojaTag) throw new Error("No se encontró la hoja de gráficas");

  const rid = /r:id="([^"]+)"/.exec(hojaTag)?.[1];
  const target = new RegExp(
    `<Relationship[^>]*Id="${rid}"[^>]*Target="([^"]+)"`
  ).exec(workbookRels)?.[1] ||
    new RegExp(`<Relationship[^>]*Target="([^"]+)"[^>]*Id="${rid}"`).exec(
      workbookRels
    )?.[1];

  if (!target) throw new Error("No se encontró el archivo de la hoja");

  const rutaHoja = target.startsWith("/")
    ? target.slice(1)
    : `xl/${target.replace(/^\.\//, "")}`;

  const nombreArchivoHoja = rutaHoja.split("/").pop()!;
  const rutaRelsHoja = `xl/worksheets/_rels/${nombreArchivoHoja}.rels`;

  const refHoja = `'${NOMBRE_HOJA}'`;
  const anclas: string[] = [];
  const relsDibujo: string[] = [];
  let tipos = await zip.file("[Content_Types].xml")!.async("string");

  preguntas.forEach((p, b) => {
    const k = b + 1;
    const filaTitulo = b * FILAS_POR_BLOQUE + 1; // 1-based
    const primera = filaTitulo + 2;
    const opciones = Object.keys(p.respuestas);
    const ultima = primera + opciones.length - 1;

    const xml = xmlPastel({
      titulo: `Pregunta ${p.clave}`,
      refNombreSerie: `${refHoja}!$B$${filaTitulo + 1}`,
      refCategorias: `${refHoja}!$A$${primera}:$A$${ultima}`,
      refValores: `${refHoja}!$B$${primera}:$B$${ultima}`,
      categorias: opciones,
      valores: opciones.map((o) => Number(p.respuestas[o])),
      conLibroIncrustado: false,
    });

    zip.file(`xl/charts/chart${k}.xml`, xml);

    tipos = tipos.replace(
      "</Types>",
      `<Override PartName="/xl/charts/chart${k}.xml" ContentType="${TIPO_CONTENIDO_GRAFICA}"/></Types>`
    );

    relsDibujo.push(
      `<Relationship Id="rId${k}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart${k}.xml"/>`
    );

    const desde = b * FILAS_POR_BLOQUE; // 0-based
    anclas.push(
      `<xdr:twoCellAnchor editAs="oneCell"><xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${desde}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:to><xdr:col>12</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${
        desde + FILAS_POR_BLOQUE - 2
      }</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to><xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${
        k + 1
      }" name="Gráfica ${escaparXml(
        p.clave
      )}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart"><c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" r:id="rId${k}"/></a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`
    );
  });

  zip.file(
    "xl/drawings/drawing1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">${anclas.join(
      ""
    )}</xdr:wsDr>`
  );

  zip.file(
    "xl/drawings/_rels/drawing1.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relsDibujo.join(
      ""
    )}</Relationships>`
  );

  zip.file(
    rutaRelsHoja,
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdDibujo1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>`
  );

  let hojaXml = await zip.file(rutaHoja)!.async("string");

  if (!hojaXml.includes('xmlns:r="')) {
    hojaXml = hojaXml.replace(
      "<worksheet ",
      '<worksheet xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
    );
  }

  // <drawing> va después de pageMargins/pageSetup/headerFooter
  // y antes de legacyDrawing/tableParts/extLst.
  const antes = ["<legacyDrawing", "<tableParts", "<extLst", "</worksheet>"]
    .map((t) => hojaXml.indexOf(t))
    .filter((i) => i >= 0);
  const pos = Math.min(...antes);

  hojaXml =
    hojaXml.slice(0, pos) +
    '<drawing r:id="rIdDibujo1"/>' +
    hojaXml.slice(pos);

  zip.file(rutaHoja, hojaXml);

  tipos = tipos.replace(
    "</Types>",
    `<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>`
  );

  zip.file("[Content_Types].xml", tipos);

  return zip;
}

export async function insertarPastelesExcel(
  libro: ArrayBuffer,
  preguntas: PreguntaParaGrafica[]
): Promise<Blob> {
  const zip = await prepararZip(libro, preguntas);

  return zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/* Variante para pruebas en Node. */
export async function insertarPastelesExcelBuffer(
  libro: ArrayBuffer | Uint8Array,
  preguntas: PreguntaParaGrafica[]
) {
  const zip = await prepararZip(libro, preguntas);
  return zip.generateAsync({ type: "nodebuffer" });
}

export function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
