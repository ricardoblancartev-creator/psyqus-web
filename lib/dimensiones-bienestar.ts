/*
  Los cuatro aspectos del bienestar que usa Psyqus:
  biológico, psicológico, social y propósito
  (antes "espiritual"; se cambió a "propósito" en noviembre de 2026).

  Lo usan el acompañante (/experiencia), el chat (/api/chat) y
  "Mi bienestar". En la base de datos la columna del pulso sigue
  llamándose "sentido".
*/

export type ClaveDimension = "bio" | "psico" | "social" | "proposito";

export type DimensionBienestar = {
  clave: ClaveDimension;
  /** Nombre corto para diagramas */
  corto: string;
  nombre: string;
  color: string;
  abarca: string;
  /** Ejemplos concretos de lo que entra en este aspecto */
  ejemplos: string[];
  /** Preguntas que el acompañante sugiere para platicar de este aspecto */
  preguntas: string[];
};

export const DIMENSIONES_BIENESTAR: DimensionBienestar[] = [
  {
    clave: "bio",
    corto: "Bio",
    nombre: "Biológico",
    color: "#34d399",
    abarca: "Tu cuerpo: cómo duermes, tu energía, lo que comes, cuánto te mueves y cómo te sientes físicamente.",
    ejemplos: ["Sueño y descanso", "Energía durante el día", "Alimentación", "Movimiento", "Tensión o molestias físicas"],
    preguntas: [
      "¿Cómo has dormido esta semana?",
      "¿Con cuánta energía terminas tu día?",
      "¿Te has dado tiempo para moverte o comer bien?",
    ],
  },
  {
    clave: "psico",
    corto: "Psico",
    nombre: "Psicológico",
    color: "#22d3ee",
    abarca: "Tus emociones y pensamientos: el estrés, tu ánimo, lo que te preocupa y cómo te recuperas de un mal día.",
    ejemplos: ["Estrés y preocupación", "Ánimo", "Concentración", "Desconectarte del trabajo", "Cómo te hablas a ti"],
    preguntas: [
      "¿Qué emoción te ha acompañado más estos días?",
      "¿Hay algo que te esté dando vueltas en la cabeza?",
      "¿Logras desconectarte del trabajo al terminar el día?",
    ],
  },
  {
    clave: "social",
    corto: "Social",
    nombre: "Social",
    color: "#fbbf24",
    abarca: "Tus relaciones: tu equipo, tu familia, tus amistades y el apoyo que sientes de los demás.",
    ejemplos: ["Relación con tu equipo", "Familia y amistades", "Sentirte con apoyo", "Conflictos", "Convivencia"],
    preguntas: [
      "¿Con quién puedes contar si tienes un mal día?",
      "¿Cómo te sientes con tu equipo de trabajo?",
      "¿Últimamente te has sentido con compañía o más bien solo?",
    ],
  },
  {
    clave: "proposito",
    corto: "Propósito",
    nombre: "Propósito",
    color: "#a78bfa",
    abarca: "El sentido de lo que haces: tus metas, tus valores y lo que te motiva a levantarte cada día.",
    ejemplos: ["Sentido de tu trabajo", "Metas personales", "Valores", "Motivación", "Sentir que avanzas"],
    preguntas: [
      "¿Qué le da sentido a tu trabajo?",
      "¿Sientes que avanzas hacia algo que te importa?",
      "Si pudieras cambiar una cosa de tu día a día, ¿cuál sería?",
    ],
  },
];

export const dimensionPorClave = (clave: unknown) =>
  DIMENSIONES_BIENESTAR.find((d) => d.clave === clave) ?? null;

/** Escala de autovaloración 1 a 5 que usa el mapa de /experiencia. */
export const ESCALA_ASPECTO = [
  { valor: 1, texto: "Muy mal" },
  { valor: 2, texto: "Mal" },
  { valor: 3, texto: "Regular" },
  { valor: 4, texto: "Bien" },
  { valor: 5, texto: "Muy bien" },
] as const;
