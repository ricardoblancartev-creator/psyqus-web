import {
  obtenerProfesional,
  respuestaNoAutorizado,
  respuestaProhibido,
} from "@/lib/auth-servidor";
import { revisarLimites, respuestaLimite } from "@/lib/limite-uso";
import { pedirInterpretacionGeneral } from "@/lib/nom035-interpretacion-general";

/*
  Interpretación general de una evaluación NOM-035.

  Recibe SOLO datos agregados y anónimos (conteos,
  distribuciones, niveles y las interpretaciones por
  pregunta, que ya son anónimas). Nunca nombres, áreas
  con nombre de persona, puestos individuales ni correos.

  Devuelve JSON con: resumen ejecutivo, nivel general,
  interpretación integral, tendencia, fortalezas,
  focos de atención, plan de acción y limitaciones.
*/

function recortar(valor: unknown, max: number) {
  return String(valor ?? "").slice(0, max);
}

export async function POST(req: Request) {
  try {
    const { userId, rol } = await obtenerProfesional();

    if (!userId) return respuestaNoAutorizado();
    if (!rol) return respuestaProhibido();

    const limite = revisarLimites(`interpretacion-general:${userId}`, [
      { maximo: 10, ventanaMs: 10 * 60_000 },
      { maximo: 60, ventanaMs: 24 * 60 * 60_000 },
    ]);

    if (!limite.permitido) return respuestaLimite(limite);

    const body = await req.json();

    /*
      Defensa en servidor: se reconstruye el objeto
      solo con campos agregados permitidos.
    */
    const preguntas = Array.isArray(body?.preguntas)
      ? body.preguntas.slice(0, 80).map((p: any) => ({
          clave: recortar(p?.clave, 10),
          texto: recortar(p?.texto, 300),
          seccion: recortar(p?.seccion, 160),
          distribucion:
            p?.distribucion && typeof p.distribucion === "object"
              ? Object.fromEntries(
                  Object.entries(p.distribucion)
                    .slice(0, 6)
                    .map(([k, v]) => [recortar(k, 20), Number(v) || 0])
                )
              : {},
          total: Number(p?.total) || 0,
          interpretacion: recortar(p?.interpretacion, 700),
        }))
      : [];

    const datos = {
      hechos: Array.isArray(body?.hechos)
        ? body.hechos.slice(0, 40).map((h: unknown) => recortar(h, 400))
        : [],
      guias: Array.isArray(body?.guias)
        ? body.guias.slice(0, 3).map((g: unknown) => recortar(g, 4))
        : [],
      personas: Number(body?.personas) || 0,
      cuestionarioI: body?.cuestionarioI
        ? {
            total: Number(body.cuestionarioI.total) || 0,
            conAcontecimiento: Number(body.cuestionarioI.conAcontecimiento) || 0,
            conAlgunSi: Number(body.cuestionarioI.conAlgunSi) || 0,
            requierenValoracionSegunDOF:
              Number(body.cuestionarioI.requierenValoracionSegunDOF) || 0,
            respuestasSinAcontecimiento:
              Number(body.cuestionarioI.respuestasSinAcontecimiento) || 0,
          }
        : null,
      cuestionarioII: body?.cuestionarioII
        ? {
            total: Number(body.cuestionarioII.total) || 0,
            distribucionNivelFinal: body.cuestionarioII.distribucionNivelFinal || {},
            categorias: (body.cuestionarioII.categorias || [])
              .slice(0, 10)
              .map((c: any) => ({
                nombre: recortar(c?.nombre, 80),
                niveles: c?.niveles || {},
                promedio: Number(c?.promedio) || 0,
              })),
            dominios: (body.cuestionarioII.dominios || [])
              .slice(0, 15)
              .map((d: any) => ({
                nombre: recortar(d?.nombre, 80),
                niveles: d?.niveles || {},
                promedio: Number(d?.promedio) || 0,
              })),
          }
        : null,
      preguntas,
    };

    const resultado = await pedirInterpretacionGeneral(datos);

    const lista = (v: unknown) =>
      Array.isArray(v) ? v.map((x) => String(x)).filter(Boolean) : [];

    return Response.json({
      nivelGeneral: String(resultado.nivelGeneral || ""),
      resumenEjecutivo: String(resultado.resumenEjecutivo || ""),
      interpretacionGeneral: lista(resultado.interpretacionGeneral),
      tendencia: String(resultado.tendencia || ""),
      fortalezas: lista(resultado.fortalezas),
      focosDeAtencion: lista(resultado.focosDeAtencion),
      planDeAccion: Array.isArray(resultado.planDeAccion)
        ? resultado.planDeAccion.slice(0, 10).map((a: any) => ({
            hallazgo: String(a?.hallazgo || ""),
            accion: String(a?.accion || ""),
            responsable: String(a?.responsable || ""),
            plazo: String(a?.plazo || ""),
            referencia: String(a?.referencia || ""),
          }))
        : [],
      limitaciones: lista(resultado.limitaciones),
    });
  } catch (error) {
    console.error("Error interpretación general NOM-035:", error);

    return Response.json(
      { error: "No fue posible generar la interpretación general." },
      { status: 500 }
    );
  }
}
