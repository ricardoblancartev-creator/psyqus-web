export type NivelRiesgo =
  | "Nulo o despreciable"
  | "Bajo"
  | "Medio"
  | "Alto"
  | "Muy alto";

export type RespuestasNom = Record<string, number>;

type ResultadoBloque = {
  nombre: string;
  puntaje: number;
  nivel: NivelRiesgo;
};

export type ResultadoCuestionarioII = {
  tipo: "II";
  puntajeFinal: number;
  nivelFinal: NivelRiesgo;
  categorias: ResultadoBloque[];
  dominios: ResultadoBloque[];
};

export type ResultadoCuestionarioI = {
  tipo: "I";
  requiereValoracionClinica: boolean;
  seccionII: number;
  seccionIII: number;
  seccionIV: number;
  mensaje: string;
};

/*
  GUÍA DE REFERENCIA II

  El formulario de Psyqus guarda:
  Siempre = 4
  Casi siempre = 3
  Algunas veces = 2
  Casi nunca = 1
  Nunca = 0

  Pero la NOM invierte la puntuación según el reactivo.
*/

const ITEMS_DIRECTOS = new Set([
  1, 2, 3, 4, 5, 6, 7, 8, 9,
  10, 11, 12, 13, 14, 15, 16, 17,
  34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46,
]);

const ITEMS_INVERSOS = new Set([
  18, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 32, 33,
]);

function obtenerRespuesta(
  respuestas: RespuestasNom,
  item: number
): number | null {
  const valor = respuestas[String(item)];

  if (valor === undefined || valor === null) {
    return null;
  }

  const numero = Number(valor);

  if (
    Number.isNaN(numero) ||
    numero < 0 ||
    numero > 4
  ) {
    return null;
  }

  return numero;
}

export function calificarItemII(
  item: number,
  respuestaGuardada: number
): number {
  /*
    Psyqus:
    Siempre 4
    ...
    Nunca 0

    Reactivos 1-17 y 34-46:
    NOM = Siempre 4 ... Nunca 0
    Por eso ya vienen con el valor correcto.

    Reactivos 18-33:
    NOM = Siempre 0 ... Nunca 4
    Por eso invertimos.
  */

  if (ITEMS_DIRECTOS.has(item)) {
    return respuestaGuardada;
  }

  if (ITEMS_INVERSOS.has(item)) {
    return 4 - respuestaGuardada;
  }

  return 0;
}

function sumarItems(
  respuestas: RespuestasNom,
  items: number[]
): number {
  return items.reduce((total, item) => {
    const respuesta = obtenerRespuesta(respuestas, item);

    if (respuesta === null) {
      return total;
    }

    return total + calificarItemII(item, respuesta);
  }, 0);
}

function nivelPorCortes(
  puntaje: number,
  cortes: [number, number, number, number]
): NivelRiesgo {
  const [bajo, medio, alto, muyAlto] = cortes;

  if (puntaje < bajo) return "Nulo o despreciable";
  if (puntaje < medio) return "Bajo";
  if (puntaje < alto) return "Medio";
  if (puntaje < muyAlto) return "Alto";

  return "Muy alto";
}

/*
  CATEGORÍAS OFICIALES - GUÍA II
*/

const CATEGORIAS = {
  "Ambiente de trabajo": {
    items: [1, 2, 3],
    cortes: [3, 5, 7, 9] as [number, number, number, number],
  },

  "Factores propios de la actividad": {
    items: [
      4, 5, 6, 7, 8, 9,
      10, 11, 12, 13,
      18, 19, 20, 21, 22,
      26, 27,
      41, 42, 43,
    ],
    cortes: [10, 20, 30, 40] as [
      number,
      number,
      number,
      number
    ],
  },

  "Organización del tiempo de trabajo": {
    items: [14, 15, 16, 17],
    cortes: [4, 6, 9, 12] as [
      number,
      number,
      number,
      number
    ],
  },

  "Liderazgo y relaciones en el trabajo": {
    items: [
      23, 24, 25,
      28, 29,
      30, 31, 32,
      33, 34, 35, 36,
      37, 38, 39, 40,
      44, 45, 46,
    ],
    cortes: [10, 18, 28, 38] as [
      number,
      number,
      number,
      number
    ],
  },
};

/*
  DOMINIOS OFICIALES - GUÍA II
*/

const DOMINIOS = {
  "Condiciones en el ambiente de trabajo": {
    items: [1, 2, 3],
    cortes: [3, 5, 7, 9] as [
      number,
      number,
      number,
      number
    ],
  },

  "Carga de trabajo": {
    items: [
      4, 5, 6, 7, 8, 9,
      10, 11, 12, 13,
      41, 42, 43,
    ],
    cortes: [12, 16, 20, 24] as [
      number,
      number,
      number,
      number
    ],
  },

  "Falta de control sobre el trabajo": {
    items: [
      18, 19,
      20, 21, 22,
      26, 27,
    ],
    cortes: [5, 8, 11, 14] as [
      number,
      number,
      number,
      number
    ],
  },

  "Jornada de trabajo": {
    items: [14, 15],
    cortes: [1, 2, 4, 6] as [
      number,
      number,
      number,
      number
    ],
  },

  "Interferencia en la relación trabajo-familia": {
    items: [16, 17],
    cortes: [1, 2, 4, 6] as [
      number,
      number,
      number,
      number
    ],
  },

  Liderazgo: {
    items: [23, 24, 25, 28, 29],
    cortes: [3, 5, 8, 11] as [
      number,
      number,
      number,
      number
    ],
  },

  "Relaciones en el trabajo": {
    items: [
      30, 31, 32,
      44, 45, 46,
    ],
    cortes: [5, 8, 11, 14] as [
      number,
      number,
      number,
      number
    ],
  },

  Violencia: {
    items: [
      33, 34, 35, 36,
      37, 38, 39, 40,
    ],
    cortes: [7, 10, 13, 16] as [
      number,
      number,
      number,
      number
    ],
  },
};

export function calificarCuestionarioII(
  respuestas: RespuestasNom
): ResultadoCuestionarioII {
  let puntajeFinal = 0;

  for (let item = 1; item <= 46; item++) {
    const respuesta = obtenerRespuesta(respuestas, item);

    if (respuesta === null) continue;

    puntajeFinal += calificarItemII(item, respuesta);
  }

  const nivelFinal = nivelPorCortes(
    puntajeFinal,
    [20, 45, 70, 90]
  );

  const categorias: ResultadoBloque[] =
    Object.entries(CATEGORIAS).map(
      ([nombre, config]) => {
        const puntaje = sumarItems(
          respuestas,
          config.items
        );

        return {
          nombre,
          puntaje,
          nivel: nivelPorCortes(
            puntaje,
            config.cortes
          ),
        };
      }
    );

  const dominios: ResultadoBloque[] =
    Object.entries(DOMINIOS).map(
      ([nombre, config]) => {
        const puntaje = sumarItems(
          respuestas,
          config.items
        );

        return {
          nombre,
          puntaje,
          nivel: nivelPorCortes(
            puntaje,
            config.cortes
          ),
        };
      }
    );

  return {
    tipo: "II",
    puntajeFinal,
    nivelFinal,
    categorias,
    dominios,
  };
}

/*
  GUÍA DE REFERENCIA I
  ACONTECIMIENTO TRAUMÁTICO SEVERO

  Psyqus guarda Sí = 1, No = 0.
*/

export function calificarCuestionarioI(
  respuestas: RespuestasNom
): ResultadoCuestionarioI {
  const si = (item: number) =>
    Number(respuestas[String(item)] || 0) === 1;

  /*
    En tu implementación:
    Pregunta 1 = Sección I
    Preguntas 2-3 = Sección II
    Preguntas 4-10 = Sección III
    Preguntas 11-15 = Sección IV
  */

  const huboAcontecimiento = si(1);

  const seccionII =
    [2, 3].filter(si).length;

  const seccionIII =
    [4, 5, 6, 7, 8, 9, 10].filter(si).length;

  const seccionIV =
    [11, 12, 13, 14, 15].filter(si).length;

  if (!huboAcontecimiento) {
    return {
      tipo: "I",
      requiereValoracionClinica: false,
      seccionII,
      seccionIII,
      seccionIV,
      mensaje:
        "No se reportó acontecimiento traumático severo en la Sección I.",
    };
  }

  const requiereValoracionClinica =
    seccionII >= 1 ||
    seccionIII >= 3 ||
    seccionIV >= 2;

  return {
    tipo: "I",
    requiereValoracionClinica,
    seccionII,
    seccionIII,
    seccionIV,
    mensaje: requiereValoracionClinica
      ? "El resultado cumple criterio para atención clínica conforme a la Guía de Referencia I."
      : "Se reportó un acontecimiento traumático severo, pero las respuestas posteriores no alcanzan los criterios establecidos para atención clínica.",
  };
}

export function calificarNom035(
  tipo: string,
  respuestas: RespuestasNom
) {
  if (tipo === "I") {
    return calificarCuestionarioI(respuestas);
  }

  if (tipo === "II") {
    return calificarCuestionarioII(respuestas);
  }

  throw new Error(
    `Tipo de cuestionario NOM-035 no soportado: ${tipo}`
  );
}
