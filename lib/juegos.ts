/*
  Minijuegos de "Aprender" (/psicoeducacion): salud mental y sana convivencia.

  Contenido psicoeducativo general, no clínico. Pendiente de revisión
  por la psicóloga del proyecto (ver CONTEXTO_PSYQUS.md).

  Los récords se guardan solo en el dispositivo (localStorage).
*/

export type IdJuego = "respira" | "hechos" | "emociones" | "asertividad" | "pensamientos" | "memorama";

export type Juego = {
  id: IdJuego;
  titulo: string;
  descripcion: string;
  categoria: "Calma" | "Emociones" | "Pensamientos" | "Convivencia" | "Autocuidado";
  aspecto: "Biológico" | "Psicológico" | "Social" | "Propósito";
  minutos: number;
  color: string;
};

export const JUEGOS: Juego[] = [
  {
    id: "respira",
    titulo: "Respira con la bola",
    descripcion: "Mantén presionado mientras la bola crece y suelta cuando se encoge. ¿Qué tan sincronizado vas?",
    categoria: "Calma",
    aspecto: "Biológico",
    minutos: 1,
    color: "#22d3ee",
  },
  {
    id: "hechos",
    titulo: "¿Hecho o interpretación?",
    descripcion: "En un desacuerdo, separar lo que pasó de lo que suponemos evita muchos conflictos.",
    categoria: "Convivencia",
    aspecto: "Social",
    minutos: 2,
    color: "#fbbf24",
  },
  {
    id: "asertividad",
    titulo: "¿Cómo lo dirías?",
    descripcion: "Elige la respuesta que cuida la relación sin dejar de decir lo que necesitas.",
    categoria: "Convivencia",
    aspecto: "Social",
    minutos: 3,
    color: "#fb923c",
  },
  {
    id: "emociones",
    titulo: "Ponle nombre",
    descripcion: "Adivina la emoción de cada situación. Nombrar lo que sientes ayuda a manejarlo.",
    categoria: "Emociones",
    aspecto: "Psicológico",
    minutos: 2,
    color: "#a78bfa",
  },
  {
    id: "pensamientos",
    titulo: "Cambia el pensamiento",
    descripcion: "Descubre la trampa de cada pensamiento y elige una forma más justa de verlo.",
    categoria: "Pensamientos",
    aspecto: "Psicológico",
    minutos: 3,
    color: "#f472b6",
  },
  {
    id: "memorama",
    titulo: "Memorama del autocuidado",
    descripcion: "Encuentra los pares y llévate un tip por cada hábito que cuida tu bienestar.",
    categoria: "Autocuidado",
    aspecto: "Biológico",
    minutos: 2,
    color: "#34d399",
  },
];

/* ---------------------------------------------------------
   Juegos de opciones (mismo motor: elegir y aprender por qué)
--------------------------------------------------------- */

export type Opcion = { texto: string; correcta: boolean; etiqueta?: string };
export type Ronda = { situacion: string; opciones: Opcion[]; explicacion: string };
export type JuegoOpcionesDatos = {
  pregunta: string;
  rondas: Ronda[];
  cierre: string;
};

const HECHO = (correcto: boolean): Opcion[] => [
  { texto: "Hecho", correcta: correcto },
  { texto: "Interpretación", correcta: !correcto },
];

export const DATOS_OPCIONES: Record<"hechos" | "emociones" | "asertividad" | "pensamientos", JuegoOpcionesDatos> = {
  hechos: {
    pregunta: "¿Es un hecho o una interpretación?",
    rondas: [
      { situacion: "Llegó 20 minutos tarde a la junta.", opciones: HECHO(true), explicacion: "Es un hecho: cualquiera que lo viera diría lo mismo." },
      { situacion: "No le importa el equipo.", opciones: HECHO(false), explicacion: "Es una interpretación: no podemos ver lo que a alguien le importa, solo lo que hace." },
      { situacion: "No contestó mi mensaje en todo el día.", opciones: HECHO(true), explicacion: "Es un hecho. Lo que pensemos del porqué ya sería interpretación." },
      { situacion: "Me está ignorando a propósito.", opciones: HECHO(false), explicacion: "Es una interpretación: puede estar ocupado, no haberlo visto o tener otro motivo." },
      { situacion: "La fecha de entrega cambió dos veces esta semana.", opciones: HECHO(true), explicacion: "Es un hecho concreto, y es un buen punto de partida para hablarlo." },
      { situacion: "Siempre me deja el trabajo más pesado a mí.", opciones: HECHO(false), explicacion: "Es una interpretación: \"siempre\" generaliza. Ayuda más decir qué tareas y cuándo." },
      { situacion: "En la junta subió la voz.", opciones: HECHO(true), explicacion: "Es un hecho observable." },
      { situacion: "Estaba enojado conmigo.", opciones: HECHO(false), explicacion: "Es una interpretación: quizá estaba enojado, pero no necesariamente contigo." },
      { situacion: "Entregué el reporte a las 6 de la tarde.", opciones: HECHO(true), explicacion: "Es un hecho." },
      { situacion: "Nadie valora lo que hago.", opciones: HECHO(false), explicacion: "Es una interpretación que duele. Vale la pena buscar los hechos: ¿qué pasó exactamente?" },
    ],
    cierre: "En un desacuerdo, empieza por los hechos (\"Noté que…\") y después di cómo te afectó (\"Me sentí…\"). Así la otra persona escucha sin ponerse a la defensiva.",
  },
  emociones: {
    pregunta: "¿Qué emoción describe mejor la situación?",
    rondas: [
      {
        situacion: "Te dieron tres tareas urgentes al mismo tiempo y no sabes por dónde empezar.",
        opciones: [{ texto: "Agobio", correcta: true }, { texto: "Aburrimiento", correcta: false }, { texto: "Nostalgia", correcta: false }],
        explicacion: "Agobio: sentir que lo que hay que hacer supera lo que puedes hacer ahora. Ayuda elegir una sola tarea para empezar.",
      },
      {
        situacion: "Alguien presentó tu idea en la junta como si fuera suya.",
        opciones: [{ texto: "Frustración", correcta: true }, { texto: "Gratitud", correcta: false }, { texto: "Calma", correcta: false }],
        explicacion: "Frustración (y quizá enojo): algo que te importaba no salió como era justo. Es una señal de que necesitas reconocimiento.",
      },
      {
        situacion: "Mañana presentas los resultados frente a dirección.",
        opciones: [{ texto: "Nervios", correcta: true }, { texto: "Culpa", correcta: false }, { texto: "Envidia", correcta: false }],
        explicacion: "Nervios: el cuerpo se prepara para algo importante. Respirar lento antes de empezar ayuda.",
      },
      {
        situacion: "Tu equipo salió a comer y nadie te avisó.",
        opciones: [{ texto: "Sentirte fuera", correcta: true }, { texto: "Orgullo", correcta: false }, { texto: "Alivio", correcta: false }],
        explicacion: "Sentirse fuera del grupo duele. Antes de concluir algo, puede servir preguntar con calma qué pasó.",
      },
      {
        situacion: "Llevas tres noches durmiendo mal y hoy todo te molesta.",
        opciones: [{ texto: "Irritabilidad", correcta: true }, { texto: "Entusiasmo", correcta: false }, { texto: "Asombro", correcta: false }],
        explicacion: "Irritabilidad: el cansancio baja nuestra paciencia. No eres \"una persona enojona\": tu cuerpo pide descanso.",
      },
      {
        situacion: "Un compañero te ayudó a terminar sin que se lo pidieras.",
        opciones: [{ texto: "Gratitud", correcta: true }, { texto: "Vergüenza", correcta: false }, { texto: "Miedo", correcta: false }],
        explicacion: "Gratitud. Decirla en voz alta (\"gracias por echarme la mano\") fortalece al equipo.",
      },
      {
        situacion: "Te equivocaste frente a un cliente y todos lo notaron.",
        opciones: [{ texto: "Vergüenza", correcta: true }, { texto: "Alegría", correcta: false }, { texto: "Indiferencia", correcta: false }],
        explicacion: "Vergüenza. Es pasajera; lo que más ayuda es reconocer el error, corregir y seguir.",
      },
      {
        situacion: "Por fin terminaste un proyecto que te costó semanas.",
        opciones: [{ texto: "Satisfacción", correcta: true }, { texto: "Celos", correcta: false }, { texto: "Tristeza", correcta: false }],
        explicacion: "Satisfacción (y quizá alivio). Date un momento para notarla antes de saltar a lo siguiente.",
      },
    ],
    cierre: "No hay emociones buenas o malas: todas dan información. Ponerles nombre preciso (no solo \"mal\" o \"bien\") ayuda a saber qué necesitas.",
  },
  asertividad: {
    pregunta: "¿Cuál respuesta es asertiva?",
    rondas: [
      {
        situacion: "Un compañero te interrumpe en cada junta.",
        opciones: [
          { texto: "No digo nada; ya me acostumbré.", correcta: false, etiqueta: "Pasiva" },
          { texto: "\"¡Ya déjame hablar, siempre haces lo mismo!\"", correcta: false, etiqueta: "Agresiva" },
          { texto: "\"Déjame terminar mi idea y luego te escucho.\"", correcta: true, etiqueta: "Asertiva" },
        ],
        explicacion: "La asertiva pide lo que necesitas en el momento, sin atacar a la persona.",
      },
      {
        situacion: "Te piden quedarte tarde por tercera vez esta semana.",
        opciones: [
          { texto: "\"Hoy no puedo quedarme. Mañana temprano lo avanzo.\"", correcta: true, etiqueta: "Asertiva" },
          { texto: "Me quedo otra vez aunque tenía planes.", correcta: false, etiqueta: "Pasiva" },
          { texto: "\"¿Otra vez? Aquí nadie respeta mi tiempo.\"", correcta: false, etiqueta: "Agresiva" },
        ],
        explicacion: "Poner un límite y ofrecer una alternativa cuida tu descanso y la relación.",
      },
      {
        situacion: "Un compañero hace bromas que te incomodan.",
        opciones: [
          { texto: "Me río para no verme mal.", correcta: false, etiqueta: "Pasiva" },
          { texto: "\"Esas bromas no me gustan. Te pido que ya no las hagas.\"", correcta: true, etiqueta: "Asertiva" },
          { texto: "Le hago una broma peor para que vea qué se siente.", correcta: false, etiqueta: "Agresiva" },
        ],
        explicacion: "Decir con claridad qué te molesta y qué pides es lo más directo y respetuoso.",
      },
      {
        situacion: "Te dejan una tarea sin fecha de entrega clara.",
        opciones: [
          { texto: "Adivino la fecha y espero que esté bien.", correcta: false, etiqueta: "Pasiva" },
          { texto: "\"¿Para cuándo la necesitas? Así la organizo con lo demás.\"", correcta: true, etiqueta: "Asertiva" },
          { texto: "\"Si no me dices la fecha, no es mi problema.\"", correcta: false, etiqueta: "Agresiva" },
        ],
        explicacion: "Preguntar lo que necesitas saber evita malentendidos y retrabajo.",
      },
      {
        situacion: "Una persona del equipo no entregó su parte y te afecta.",
        opciones: [
          { texto: "\"Necesito tu parte para avanzar. ¿Cuándo me la puedes pasar?\"", correcta: true, etiqueta: "Asertiva" },
          { texto: "La hago yo y no digo nada.", correcta: false, etiqueta: "Pasiva" },
          { texto: "Me quejo de esa persona con los demás.", correcta: false, etiqueta: "Agresiva" },
        ],
        explicacion: "Hablar directo con la persona, con un hecho y una petición, resuelve más que cargar o quejarse.",
      },
      {
        situacion: "No estás de acuerdo con una decisión del equipo.",
        opciones: [
          { texto: "\"Esa idea no va a funcionar, es obvio.\"", correcta: false, etiqueta: "Agresiva" },
          { texto: "Me quedo con la duda y luego me quejo.", correcta: false, etiqueta: "Pasiva" },
          { texto: "\"Veo un riesgo en esto. ¿Puedo proponer otra opción?\"", correcta: true, etiqueta: "Asertiva" },
        ],
        explicacion: "Puedes estar en desacuerdo con la idea sin descalificar a las personas.",
      },
    ],
    cierre: "Fórmula asertiva: hecho + cómo te afecta + qué pides. \"Cuando pasa X, me siento Y. ¿Podemos hacer Z?\"",
  },
  pensamientos: {
    pregunta: "¿Cuál es una forma más justa de verlo?",
    rondas: [
      {
        situacion: "\"Me equivoqué en el reporte. Soy un desastre.\"",
        opciones: [
          { texto: "\"Cometí un error en el reporte. Lo puedo corregir y revisar mejor la próxima.\"", correcta: true },
          { texto: "\"No pasó nada, todo está perfecto.\"", correcta: false },
          { texto: "\"Siempre lo arruino todo.\"", correcta: false },
        ],
        explicacion: "Trampa: etiquetarte. Un error habla de una acción, no de quién eres.",
      },
      {
        situacion: "\"Si no termino hoy, me van a correr.\"",
        opciones: [
          { texto: "\"Ya me corrieron, seguro.\"", correcta: false },
          { texto: "\"Si no termino hoy puede haber un problema; aviso y propongo una nueva hora.\"", correcta: true },
          { texto: "\"Da igual, no importa nada.\"", correcta: false },
        ],
        explicacion: "Trampa: catastrofizar (imaginar lo peor como si fuera seguro). Ayuda pensar qué es lo más probable y qué puedes hacer.",
      },
      {
        situacion: "\"No me saludó. Seguro está molesto conmigo.\"",
        opciones: [
          { texto: "\"Quizá no me vio o anda en lo suyo. Si me queda la duda, le pregunto.\"", correcta: true },
          { texto: "\"Todos en el trabajo me odian.\"", correcta: false },
          { texto: "\"Nunca más lo voy a saludar.\"", correcta: false },
        ],
        explicacion: "Trampa: leer la mente. No sabemos lo que el otro piensa hasta que lo platicamos.",
      },
      {
        situacion: "\"Si no me sale perfecto, no sirve.\"",
        opciones: [
          { texto: "\"Entonces mejor ni lo intento.\"", correcta: false },
          { texto: "\"Algo bien hecho y entregado vale más que algo perfecto que nunca termino.\"", correcta: true },
          { texto: "\"Tiene que salir perfecto sí o sí.\"", correcta: false },
        ],
        explicacion: "Trampa: todo o nada. Entre \"perfecto\" y \"no sirve\" hay muchos puntos intermedios.",
      },
      {
        situacion: "\"Me fue mal en esta junta. Siempre me va mal.\"",
        opciones: [
          { texto: "\"Esta junta no salió como quería. Otras sí han salido bien.\"", correcta: true },
          { texto: "\"Ya no voy a hablar en ninguna junta.\"", correcta: false },
          { texto: "\"Me fue increíble, la verdad.\"", correcta: false },
        ],
        explicacion: "Trampa: generalizar. Un mal momento no define todos los demás.",
      },
      {
        situacion: "\"Debería poder con todo sin pedir ayuda.\"",
        opciones: [
          { texto: "\"Pedir ayuda es de débiles.\"", correcta: false },
          { texto: "\"Pedir ayuda cuando la necesito también es hacer bien mi trabajo.\"", correcta: true },
          { texto: "\"Que lo hagan otros, yo ya no.\"", correcta: false },
        ],
        explicacion: "Trampa: los \"debería\". Exigencias rígidas que nos cargan de presión.",
      },
    ],
    cierre: "Cambiar un pensamiento no es \"pensar positivo\": es buscar una forma más justa y realista de verlo. Pregúntate: ¿qué le diría a un amigo en mi lugar?",
  },
};

/* ---------------------------------------------------------
   Memorama del autocuidado
--------------------------------------------------------- */

export const PARES_MEMORAMA = [
  { id: "dormir", texto: "Dormir", tip: "Dormir a una hora parecida cada día ayuda más que dormir mucho el fin de semana." },
  { id: "moverte", texto: "Moverte", tip: "Una caminata de 10 minutos ya mejora el ánimo y la energía." },
  { id: "respirar", texto: "Respirar", tip: "Exhalar más largo de lo que inhalas ayuda a calmar el cuerpo." },
  { id: "platicar", texto: "Platicar", tip: "Contarle a alguien cómo estás aligera la carga, aunque no te resuelva nada." },
  { id: "agua", texto: "Tomar agua", tip: "La deshidratación leve se siente como cansancio y falta de concentración." },
  { id: "pausa", texto: "Hacer pausas", tip: "Una pausa corta cada 90 minutos rinde más que trabajar de corrido." },
] as const;

/* ---------------------------------------------------------
   Récords (solo en este dispositivo)
--------------------------------------------------------- */

export type RecordJuego = { mejor: number; veces: number; unidad: "%" | "aciertos" | "movimientos" };
const CLAVE = "psyqus_juegos";

export function leerRecords(): Partial<{ [K in IdJuego]: RecordJuego }> {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? JSON.parse(crudo) : {};
  } catch {
    return {};
  }
}

/** Guarda el resultado; `menorEsMejor` para el memorama (menos movimientos). Regresa si fue récord. */
export function guardarResultado(id: IdJuego, valor: number, unidad: RecordJuego["unidad"], menorEsMejor = false) {
  const todos = leerRecords();
  const previo = todos[id];
  const esRecord = !previo || (menorEsMejor ? valor < previo.mejor : valor > previo.mejor);
  todos[id] = {
    mejor: esRecord ? valor : previo!.mejor,
    veces: (previo?.veces ?? 0) + 1,
    unidad,
  };
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(todos));
  } catch {
    /* sin almacenamiento local */
  }
  return esRecord;
}

export function revolver<T>(lista: readonly T[]): T[] {
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
