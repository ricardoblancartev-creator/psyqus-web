"use client";

import {
  calificarCuestionarioI,
  calificarCuestionarioII,
} from "@/lib/nom035-calificacion";

import { useEffect, useMemo, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import JSZip from "jszip";
import * as XLSX from "xlsx";

type Nom035Resultado = {
  id: string;
  created_at?: string;
  user_id?: string | null;

  nombre?: string | null;
  apellido?: string | null;
  email?: string | null;

  area?: string | null;
  puesto?: string | null;

  tipo_cuestionario?: "I" | "II" | string;
  nombre_cuestionario?: string | null;

  respuestas?: Record<string, number> | null;
  puntaje_total?: number | null;
};

type InterpretacionIA = {
  interpretacion: string;
  accionSugerida: string;
  cargando?: boolean;
  error?: boolean;
};

const preguntasNom035: Record<string, string> = {
  "I.1":
    "¿Ha presenciado o sufrido alguna vez, durante o con motivo del trabajo, un acontecimiento traumático severo?",
  "I.2":
    "¿Ha tenido recuerdos recurrentes sobre el acontecimiento que le provoquen malestares?",
  "I.3":
    "¿Ha tenido sueños recurrentes sobre el acontecimiento que le producen malestar?",
  "I.4":
    "¿Se ha esforzado por evitar sentimientos, conversaciones o situaciones que le puedan recordar el acontecimiento?",
  "I.5":
    "¿Se ha esforzado por evitar actividades, lugares o personas que motivan recuerdos del acontecimiento?",
  "I.6":
    "¿Ha tenido dificultad para recordar alguna parte importante del evento?",
  "I.7":
    "¿Ha disminuido su interés en sus actividades cotidianas?",
  "I.8":
    "¿Se ha sentido alejado o distante de los demás?",
  "I.9":
    "¿Ha notado que tiene dificultad para expresar sus sentimientos?",
  "I.10":
    "¿Ha tenido la impresión de que su vida se va a acortar?",
  "I.11":
    "¿Ha tenido dificultades para dormir?",
  "I.12":
    "¿Ha estado particularmente irritable o le han dado arranques de coraje?",
  "I.13":
    "¿Ha tenido dificultad para concentrarse?",
  "I.14":
    "¿Ha estado nervioso o constantemente en alerta?",
  "I.15":
    "¿Se ha sobresaltado fácilmente por cualquier cosa?",

  "II.1":
    "Mi trabajo me exige hacer mucho esfuerzo físico",
  "II.2":
    "Me preocupa sufrir un accidente en mi trabajo",
  "II.3":
    "Considero que las actividades que realizo son peligrosas",
  "II.4":
    "Por la cantidad de trabajo que tengo debo quedarme tiempo adicional a mi turno",
  "II.5":
    "Por la cantidad de trabajo que tengo debo trabajar sin parar",
  "II.6":
    "Considero que es necesario mantener un ritmo de trabajo acelerado",
  "II.7":
    "Mi trabajo exige que esté muy concentrado",
  "II.8":
    "Mi trabajo requiere que memorice mucha información",
  "II.9":
    "Mi trabajo exige que atienda varios asuntos al mismo tiempo",
  "II.10":
    "En mi trabajo soy responsable de cosas de mucho valor",
  "II.11":
    "Respondo ante mi jefe por los resultados de toda mi área de trabajo",
  "II.12":
    "En mi trabajo me dan órdenes contradictorias",
  "II.13":
    "Considero que en mi trabajo me piden hacer cosas que no son necesarias",
  "II.14":
    "Trabajo horas extras más de tres veces a la semana",
  "II.15":
    "Mi trabajo me exige laborar en días de descanso, festivos o fines de semana",
  "II.16":
    "Considero que el tiempo en el trabajo es mucho y perjudica mis actividades familiares o personales",
  "II.17":
    "Pienso en las actividades familiares o personales cuando estoy en mi trabajo",
  "II.18":
    "Mi trabajo permite que desarrolle nuevas habilidades",
  "II.19":
    "En mi trabajo puedo aspirar a un mejor puesto",
  "II.20":
    "Durante mi jornada de trabajo puedo tomar pausas cuando las necesito",
  "II.21":
    "Puedo decidir la velocidad a la que realizo mis actividades en mi trabajo",
  "II.22":
    "Puedo cambiar el orden de las actividades que realizo en mi trabajo",
  "II.23":
    "Me informan con claridad cuáles son mis funciones",
  "II.24":
    "Me explican claramente los resultados que debo obtener en mi trabajo",
  "II.25":
    "Me informan con quién puedo resolver problemas o asuntos de trabajo",
  "II.26":
    "Me permiten asistir a capacitaciones relacionadas con mi trabajo",
  "II.27":
    "Recibo capacitación útil para hacer mi trabajo",
  "II.28":
    "Mi jefe tiene en cuenta mis puntos de vista y opiniones",
  "II.29":
    "Mi jefe ayuda a solucionar los problemas que se presentan en el trabajo",
  "II.30":
    "Puedo confiar en mis compañeros de trabajo",
  "II.31":
    "Cuando tenemos que realizar trabajo de equipo los compañeros colaboran",
  "II.32":
    "Mis compañeros de trabajo me ayudan cuando tengo dificultades",
  "II.33":
    "En mi trabajo puedo expresarme libremente sin interrupciones",
  "II.34":
    "Recibo críticas constantes a mi persona y/o trabajo",
  "II.35":
    "Recibo burlas, calumnias, difamaciones, humillaciones o ridiculizaciones",
  "II.36":
    "Se ignora mi presencia o se me excluye de las reuniones de trabajo y en la toma de decisiones",
  "II.37":
    "Se manipulan las situaciones de trabajo para hacerme parecer un mal trabajador",
  "II.38":
    "Se ignoran mis éxitos laborales y se atribuyen a otros trabajadores",
  "II.39":
    "Me bloquean o impiden las oportunidades que tengo para obtener ascenso o mejora en mi trabajo",
  "II.40":
    "He presenciado actos de violencia en mi centro de trabajo",
  "II.41":
    "Atiendo clientes o usuarios muy enojados",
  "II.42":
    "Mi trabajo me exige atender personas muy necesitadas de ayuda o enfermas",
  "II.43":
    "Para hacer mi trabajo debo demostrar sentimientos distintos a los míos",
  "II.44":
    "Comunican tarde los asuntos de trabajo",
  "II.45":
    "Dificultan el logro de los resultados del trabajo",
  "II.46":
    "Ignoran las sugerencias para mejorar su trabajo",
};

const PIE_COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#facc15",
  "#fb7185",
  "#86efac",
];

const ITEMS_INVERSOS_II = new Set([
  18, 19, 20, 21, 22, 23, 24, 25,
  26, 27, 28, 29, 30, 31, 32, 33,
]);

function formatDate(date?: string) {
  if (!date) return "Sin fecha";

  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatearNombre(nombre: string = "") {
  return nombre
    .trim()
    .toLocaleLowerCase("es-MX")
    .replace(/(^|\s|-)([a-záéíóúüñ])/g, (texto) =>
      texto.toLocaleUpperCase("es-MX")
    );
}

function nombreCompleto(item: Nom035Resultado) {
  return (
    formatearNombre(
      [item.nombre, item.apellido]
        .filter(Boolean)
        .join(" ")
    ) || "Colaborador"
  );
}

function numeroPreguntaII(pregunta: string) {
  const match = String(pregunta).match(/II\.(\d+)/);
  return match ? Number(match[1]) : null;
}

function esRespuestaRelevanteII(
  pregunta: string,
  respuesta: string
) {
  const numero = numeroPreguntaII(pregunta);

  if (!numero) return false;

  if (ITEMS_INVERSOS_II.has(numero)) {
    return (
      respuesta === "Nunca" ||
      respuesta === "Casi nunca"
    );
  }

  return (
    respuesta === "Siempre" ||
    respuesta === "Casi siempre"
  );
}

function respuestaTexto(
  tipo: string | undefined,
  valor: number
) {
  if (tipo === "I") {
    return Number(valor) === 1 ? "Sí" : "No";
  }

  const equivalencias: Record<number, string> = {
    4: "Siempre",
    3: "Casi siempre",
    2: "Algunas veces",
    1: "Casi nunca",
    0: "Nunca",
  };

  return equivalencias[Number(valor)] ?? String(valor);
}

/*
  FILTROS RETROSPECTIVOS PARA ESTA APLICACIÓN.

  41-43:
  solamente puestos donde podemos justificar
  razonablemente atención a clientes o usuarios.

  44-46:
  solamente puestos con función explícita
  de jefatura/coordinación.
*/

function normalizarPuesto(puesto?: string | null) {
  return String(puesto || "")
    .trim()
    .toLocaleLowerCase("es-MX");
}

function aplicaBloqueClientes(
  evaluacion: Nom035Resultado
) {
  const puesto = normalizarPuesto(evaluacion.puesto);

  return (
    puesto.includes("oficial de caja") ||
    puesto.includes("oficial de cajas") ||
    puesto.includes("ejecutiva") ||
    puesto.includes("ejecutivo de cuenta") ||
    puesto.includes("gestor de cobranza") ||
    puesto.includes("une")
  );
}

function aplicaBloqueSubordinados(
  evaluacion: Nom035Resultado
) {
  const puesto = normalizarPuesto(evaluacion.puesto);

  return (
    puesto.includes("gerente general") ||
    puesto === "coordinador" ||
    puesto === "coordinadora"
  );
}

/*
  Para el cálculo individual del Cuestionario II
  eliminamos 41-43 o 44-46 cuando esos bloques
  no aplicaban a la persona.

  NO modificamos Supabase.
  Solamente calculamos correctamente al mostrar.
*/

function respuestasIIAplicables(
  evaluacion: Nom035Resultado
) {
  const originales = {
    ...(evaluacion.respuestas || {}),
  };

  if (!aplicaBloqueClientes(evaluacion)) {
    delete originales["41"];
    delete originales["42"];
    delete originales["43"];
  }

  if (!aplicaBloqueSubordinados(evaluacion)) {
    delete originales["44"];
    delete originales["45"];
    delete originales["46"];
  }

  return originales;
}

function recomendacionPreguntaII(
  numero: number | null
) {
  if (!numero) {
    return "Revisar el contexto laboral asociado con el reactivo.";
  }

  if (numero >= 1 && numero <= 3) {
    return "Revisar condiciones físicas del puesto, percepción de seguridad y medidas preventivas relacionadas con las actividades realizadas.";
  }

  if (numero >= 4 && numero <= 9) {
    return "Revisar carga y ritmo de trabajo, distribución de tareas, pausas disponibles y exigencias de concentración o atención simultánea.";
  }

  if (numero >= 10 && numero <= 13) {
    return "Revisar responsabilidades asignadas, claridad de instrucciones, coordinación y posibles demandas contradictorias.";
  }

  if (numero >= 14 && numero <= 17) {
    return "Revisar jornadas, horas adicionales, descansos y posibles interferencias entre el trabajo y las actividades personales.";
  }

  if (numero >= 18 && numero <= 22) {
    return "Revisar autonomía, capacidad de decisión, pausas y posibilidades de desarrollo dentro del trabajo.";
  }

  if (numero >= 23 && numero <= 27) {
    return "Mantener la claridad de funciones, la información disponible para resolver asuntos de trabajo y la capacitación relacionada con el puesto.";
  }

  if (numero >= 28 && numero <= 33) {
    return "Revisar liderazgo, apoyo entre compañeros, comunicación y posibilidades de participación y expresión dentro del equipo.";
  }

  if (numero >= 34 && numero <= 40) {
    return "Revisar posibles conductas de violencia laboral, exclusión, críticas recurrentes o bloqueo de oportunidades y fortalecer los mecanismos internos de atención.";
  }

  if (numero >= 41 && numero <= 43) {
    return "Revisar las demandas emocionales asociadas con la atención a clientes o usuarios y valorar capacitación, pausas y estrategias de manejo de situaciones difíciles.";
  }

  return "Revisar la comunicación con el personal supervisado, la coordinación de actividades y la recepción de sugerencias dentro del equipo.";
}

function interpretacionDeterministica(
  item: any,
  casosRelevantes: any[]
) {
  const clave = String(item.pregunta);
  const esI = clave.startsWith("I.");

  if (esI) {
    if (casosRelevantes.length === 0) {
      return `No se registraron respuestas afirmativas ante el reactivo “${item.texto}”. En este punto no se identifican respuestas que requieran seguimiento específico.`;
    }

    const nombres = casosRelevantes
      .map((persona: any) =>
        formatearNombre(
          [persona.nombre, persona.apellido]
            .filter(Boolean)
            .join(" ")
        )
      )
      .filter(Boolean);

    return `${nombres.join(", ")} ${
      casosRelevantes.length === 1
        ? "respondió"
        : "respondieron"
    } “Sí” ante el reactivo “${item.texto}”. Se recomienda revisar de manera individual y confidencial el contexto de ${
      casosRelevantes.length === 1
        ? "esta respuesta"
        : "estas respuestas"
    } y valorar la necesidad de seguimiento conforme a los criterios del Cuestionario I.`;
  }

  const numero = numeroPreguntaII(clave);

  if (casosRelevantes.length === 0) {
    return `En el reactivo “${item.texto}” no se identificaron respuestas ubicadas en las frecuencias de mayor exposición según el sentido de calificación del ítem. La distribución completa debe considerarse para conservar una lectura preventiva del resultado.`;
  }

  const nombres = casosRelevantes
    .map((persona: any) =>
      formatearNombre(
        [persona.nombre, persona.apellido]
          .filter(Boolean)
          .join(" ")
      )
    )
    .filter(Boolean);

  const frecuencia = numero && ITEMS_INVERSOS_II.has(numero)
    ? "Nunca o Casi nunca"
    : "Siempre o Casi siempre";

  return `${nombres.join(", ")} ${
    casosRelevantes.length === 1
      ? "presentó"
      : "presentaron"
  } una respuesta ubicada en “${frecuencia}” ante el reactivo “${item.texto}”. Estas respuestas requieren interpretarse junto con la distribución general y el contexto específico del puesto, sin asumir por sí solas la existencia de una afectación generalizada.`;
}

export default function Nom035ResultadosPage() {
  const [data, setData] = useState<Nom035Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [miembroAbierto, setMiembroAbierto] =
    useState<string | null>(null);

  const [preguntaAbierta, setPreguntaAbierta] =
    useState<string | null>(null);

  const [filtroDesglose, setFiltroDesglose] =
    useState<"I" | "II">("II");

  const [interpretacionesIA, setInterpretacionesIA] =
    useState<Record<string, InterpretacionIA>>({});

  /*
    CARGA DE DATOS
  */

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        setLoading(true);
        setErrorCarga("");

        const response = await fetch(
          "/api/nom035-resultados",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error ${response.status} cargando resultados`
          );
        }

        const json = await response.json();

        if (!activo) return;

        setData(Array.isArray(json) ? json : []);
      } catch (error) {
        console.error(
          "Error cargando resultados NOM-035:",
          error
        );

        if (!activo) return;

        setErrorCarga(
          "No fue posible cargar los resultados NOM-035."
        );
      } finally {
        if (activo) {
          setLoading(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, []);

  /*
    CALIFICACIONES
  */

  const resultadosCalificados = useMemo(() => {
    return data.map((evaluacion) => {
      if (evaluacion.tipo_cuestionario === "I") {
        return {
          ...evaluacion,
          calificacion: calificarCuestionarioI(
            evaluacion.respuestas || {}
          ),
        };
      }

      if (evaluacion.tipo_cuestionario === "II") {
        return {
          ...evaluacion,
          calificacion: calificarCuestionarioII(
            respuestasIIAplicables(evaluacion)
          ),
        };
      }

      return {
        ...evaluacion,
        calificacion: null,
      };
    });
  }, [data]);

  /*
    AGRUPAR 54 REGISTROS EN PERSONAS
  */

  const miembros = useMemo(() => {
    const mapa = new Map<string, any>();

    resultadosCalificados.forEach((item: any) => {
      const clave = String(
        item.user_id ||
          item.email ||
          `${item.nombre || ""}-${item.apellido || ""}`
      )
        .trim()
        .toLocaleLowerCase("es-MX");

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          clave,
          nombre: nombreCompleto(item),
          area: item.area || "Sin área",
          puesto: item.puesto || "Sin puesto",
          email: item.email || "",
          cuestionarioI: null,
          cuestionarioII: null,
        });
      }

      const miembro = mapa.get(clave);

      /*
        Conservamos área/puesto del registro II
        cuando existe porque es el que utilizamos
        para análisis organizacional.
      */

      if (item.tipo_cuestionario === "II") {
        miembro.area = item.area || miembro.area;
        miembro.puesto = item.puesto || miembro.puesto;
        miembro.cuestionarioII = item;
      }

      if (item.tipo_cuestionario === "I") {
        miembro.cuestionarioI = item;
      }
    });

    return Array.from(mapa.values()).sort(
      (a, b) =>
        String(a.nombre).localeCompare(
          String(b.nombre),
          "es-MX"
        )
    );
  }, [resultadosCalificados]);

  /*
    RESUMEN
  */

  const resumen = useMemo(() => {
    const cuestionarioI = data.filter(
      (x) => x.tipo_cuestionario === "I"
    ).length;

    const cuestionarioII = data.filter(
      (x) => x.tipo_cuestionario === "II"
    ).length;

    const areasNormalizadas = new Set(
      miembros.map((persona) =>
        String(persona.area || "Sin área")
          .trim()
          .toLocaleLowerCase("es-MX")
      )
    );

    return {
      miembros: miembros.length,
      cuestionarioI,
      cuestionarioII,
      areas: areasNormalizadas.size,
    };
  }, [data, miembros]);

  /*
    DESGLOSE REAL POR PREGUNTA
  */

  const desglosePorPregunta = useMemo(() => {
    const conteo: Record<string, any> = {};

    data.forEach((evaluacion) => {
      const respuestas =
        evaluacion.respuestas || {};

      Object.entries(respuestas).forEach(
        ([pregunta, valor]) => {
          const numero = Number(pregunta);

          /*
            FILTROS RETROSPECTIVOS
          */

          if (
            evaluacion.tipo_cuestionario === "II" &&
            numero >= 41 &&
            numero <= 43 &&
            !aplicaBloqueClientes(evaluacion)
          ) {
            return;
          }

          if (
            evaluacion.tipo_cuestionario === "II" &&
            numero >= 44 &&
            numero <= 46 &&
            !aplicaBloqueSubordinados(evaluacion)
          ) {
            return;
          }

          const clave =
            `${evaluacion.tipo_cuestionario}.${pregunta}`;

          if (!conteo[clave]) {
            conteo[clave] = {
              pregunta: clave,
              texto:
                preguntasNom035[clave] ||
                "Pregunta NOM-035",
              total: 0,
              respuestas: {},
              areas: {},
              puestos: {},
              individuales: [],
            };
          }

          const respuesta = respuestaTexto(
            evaluacion.tipo_cuestionario,
            Number(valor)
          );

          const area =
            evaluacion.area || "Sin área";

          const puesto =
            evaluacion.puesto || "Sin puesto";

          conteo[clave].respuestas[respuesta] =
            (conteo[clave].respuestas[respuesta] ||
              0) + 1;

          conteo[clave].areas[area] =
            (conteo[clave].areas[area] || 0) + 1;

          conteo[clave].puestos[puesto] =
            (conteo[clave].puestos[puesto] ||
              0) + 1;

          conteo[clave].individuales.push({
            id: evaluacion.id,
            nombre: evaluacion.nombre || "",
            apellido: evaluacion.apellido || "",
            area,
            puesto,
            respuesta,
          });

          conteo[clave].total += 1;
        }
      );
    });

    return Object.values(conteo).sort(
      (a: any, b: any) => {
        const [tipoA, numA] =
          String(a.pregunta).split(".");

        const [tipoB, numB] =
          String(b.pregunta).split(".");

        if (tipoA !== tipoB) {
          return tipoA.localeCompare(tipoB);
        }

        return Number(numA) - Number(numB);
      }
    );
  }, [data]);

  const preguntasFiltradas = useMemo(() => {
    return desglosePorPregunta.filter(
      (item: any) =>
        String(item.pregunta).startsWith(
          `${filtroDesglose}.`
        )
    );
  }, [desglosePorPregunta, filtroDesglose]);

  /*
    INTERPRETACIÓN IA BAJO DEMANDA

    Ya NO hacemos 61 fetch al abrir la página.
    Solo se pide interpretación cuando el usuario
    abre una pregunta.
  */

  async function cargarInterpretacion(item: any) {
    const clave = String(item.pregunta);

    if (
      interpretacionesIA[clave]?.interpretacion ||
      interpretacionesIA[clave]?.cargando
    ) {
      return;
    }

    const esI = clave.startsWith("I.");
    const esII = clave.startsWith("II.");

    const casosRelevantes =
      (item.individuales || []).filter(
        (persona: any) => {
          if (esI) {
            return persona.respuesta === "Sí";
          }

          if (esII) {
            return esRespuestaRelevanteII(
              clave,
              String(persona.respuesta)
            );
          }

          return false;
        }
      );

    const casosParaIA = casosRelevantes.map(
      (persona: any) => ({
        nombre:
          formatearNombre(
            [
              persona.nombre,
              persona.apellido,
            ]
              .filter(Boolean)
              .join(" ")
          ) || "Sin nombre",

        area: persona.area || "Sin área",
        puesto: persona.puesto || "Sin puesto",
        respuesta: persona.respuesta,
      })
    );

    setInterpretacionesIA((prev) => ({
      ...prev,
      [clave]: {
        interpretacion: "",
        accionSugerida: "",
        cargando: true,
        error: false,
      },
    }));

    try {
      const response = await fetch(
        "/api/nom035/interpretar",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            cuestionario: esI ? "I" : "II",
            numeroPregunta: clave,
            pregunta: item.texto,
            distribucion: item.respuestas,
            total: item.total,
            casosRelevantes: casosParaIA,
          }),
        }
      );

      if (!response.ok) {
        const texto = await response.text();

        console.error(
          `Error API interpretación ${clave}:`,
          response.status,
          texto
        );

        throw new Error(
          `Error ${response.status}`
        );
      }

      const resultado = await response.json();

      setInterpretacionesIA((prev) => ({
        ...prev,

        [clave]: {
          interpretacion:
            resultado.interpretacion || "",

          accionSugerida:
            resultado.accionSugerida || "",

          cargando: false,
          error: false,
        },
      }));
    } catch (error) {
      console.error(
        `No se pudo generar interpretación ${clave}:`,
        error
      );

      /*
        No dejamos la pantalla rota.
        La interpretación determinística
        queda disponible como respaldo.
      */

      setInterpretacionesIA((prev) => ({
        ...prev,

        [clave]: {
          interpretacion: "",
          accionSugerida: "",
          cargando: false,
          error: true,
        },
      }));
    }
  }

  function alternarPregunta(item: any) {
    const clave = String(item.pregunta);

    if (preguntaAbierta === clave) {
      setPreguntaAbierta(null);
      return;
    }

    setPreguntaAbierta(clave);
    cargarInterpretacion(item);
  }

  /*
    EXCEL BÁSICO
  */

  function exportarExcel() {
    const workbook = XLSX.utils.book_new();

    const resumenExcel = [
      ["PSYQUS - RESULTADOS NOM-035"],
      [],
      ["Miembros evaluados", resumen.miembros],
      ["Cuestionario I", resumen.cuestionarioI],
      ["Cuestionario II", resumen.cuestionarioII],
      ["Áreas", resumen.areas],
    ];

    const hojaResumen =
      XLSX.utils.aoa_to_sheet(resumenExcel);

    hojaResumen["!cols"] = [
      { wch: 28 },
      { wch: 18 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      hojaResumen,
      "Resumen"
    );

    const filasPreguntas: any[][] = [
      [
        "Cuestionario",
        "Pregunta",
        "Texto",
        "Respuesta",
        "Cantidad",
        "Porcentaje",
      ],
    ];

    desglosePorPregunta.forEach((item: any) => {
      const total = Number(item.total || 0);

      Object.entries(
        item.respuestas || {}
      ).forEach(([respuesta, cantidad]) => {
        const cantidadNumero =
          Number(cantidad);

        filasPreguntas.push([
          `Cuestionario ${
            String(item.pregunta).split(".")[0]
          }`,

          item.pregunta,
          item.texto,
          respuesta,
          cantidadNumero,

          total > 0
            ? cantidadNumero / total
            : 0,
        ]);
      });
    });

    const hojaPreguntas =
      XLSX.utils.aoa_to_sheet(
        filasPreguntas
      );

    hojaPreguntas["!cols"] = [
      { wch: 18 },
      { wch: 14 },
      { wch: 80 },
      { wch: 22 },
      { wch: 12 },
      { wch: 14 },
    ];

    const rango =
      XLSX.utils.decode_range(
        hojaPreguntas["!ref"] ||
          "A1:F1"
      );

    for (
      let fila = 1;
      fila <= rango.e.r;
      fila++
    ) {
      const celda =
        hojaPreguntas[
          XLSX.utils.encode_cell({
            r: fila,
            c: 5,
          })
        ];

      if (celda) {
        celda.z = "0.0%";
      }
    }

    XLSX.utils.book_append_sheet(
      workbook,
      hojaPreguntas,
      "Por pregunta"
    );

    const filasIndividuales: any[][] = [
      [
        "Cuestionario",
        "Pregunta",
        "Texto",
        "Colaborador",
        "Área",
        "Puesto",
        "Respuesta",
      ],
    ];

    desglosePorPregunta.forEach(
      (item: any) => {
        (item.individuales || []).forEach(
          (persona: any) => {
            filasIndividuales.push([
              `Cuestionario ${
                String(
                  item.pregunta
                ).split(".")[0]
              }`,

              item.pregunta,
              item.texto,

              formatearNombre(
                [
                  persona.nombre,
                  persona.apellido,
                ]
                  .filter(Boolean)
                  .join(" ")
              ),

              persona.area,
              persona.puesto,
              persona.respuesta,
            ]);
          }
        );
      }
    );

    const hojaIndividuales =
      XLSX.utils.aoa_to_sheet(
        filasIndividuales
      );

    hojaIndividuales["!cols"] = [
      { wch: 18 },
      { wch: 14 },
      { wch: 80 },
      { wch: 32 },
      { wch: 25 },
      { wch: 32 },
      { wch: 20 },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      hojaIndividuales,
      "Respuestas individuales"
    );

    XLSX.writeFile(
      workbook,
      "Psyqus_Resultados_NOM035.xlsx"
    );
  }

  /*
    DESCARGA DE GRÁFICAS
  */

  async function descargarTodasLasGraficas() {
    const zip = new JSZip();

    for (
      const item of desglosePorPregunta as any[]
    ) {
      const respuestas = Object.entries(
        item.respuestas || {}
      ) as [string, number][];

      const total = Number(item.total || 1);

      const canvas =
        document.createElement("canvas");

      canvas.width = 1400;
      canvas.height = 820;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) continue;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      ctx.fillStyle = "#0891b2";
      ctx.font = "bold 24px Arial";

      ctx.fillText(
        "PSYQUS · RESULTADOS NOM-035",
        70,
        60
      );

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 38px Arial";

      ctx.fillText(
        `Pregunta ${item.pregunta}`,
        70,
        120
      );

      ctx.fillStyle = "#334155";
      ctx.font = "24px Arial";

      const palabras =
        String(item.texto).split(" ");

      let linea = "";
      let y = 170;

      palabras.forEach(
        (palabra: string) => {
          const prueba =
            `${linea}${palabra} `;

          if (
            ctx.measureText(prueba)
              .width > 1200
          ) {
            ctx.fillText(
              linea,
              70,
              y
            );

            linea =
              `${palabra} `;

            y += 34;
          } else {
            linea = prueba;
          }
        }
      );

      ctx.fillText(linea, 70, y);

      const centerX = 300;
      const centerY = 450;
      const radius = 135;

      let inicio = -Math.PI / 2;

      respuestas.forEach(
        ([, cantidad], index) => {
          const value =
            Number(cantidad);

          const slice =
            (value / total) *
            Math.PI *
            2;

          ctx.beginPath();

          ctx.strokeStyle =
            PIE_COLORS[
              index %
                PIE_COLORS.length
            ];

          ctx.lineWidth = 70;

          ctx.arc(
            centerX,
            centerY,
            radius,
            inicio,
            inicio + slice
          );

          ctx.stroke();

          inicio += slice;
        }
      );

      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.font = "bold 42px Arial";

      ctx.fillText(
        String(total),
        centerX,
        centerY + 10
      );

      ctx.textAlign = "left";

      let legendY = 330;

      respuestas.forEach(
        (
          [respuesta, cantidad],
          index
        ) => {
          const value =
            Number(cantidad);

          const porcentaje =
            Math.round(
              (value / total) *
                1000
            ) / 10;

          ctx.fillStyle =
            PIE_COLORS[
              index %
                PIE_COLORS.length
            ];

          ctx.beginPath();

          ctx.arc(
            620,
            legendY - 8,
            10,
            0,
            Math.PI * 2
          );

          ctx.fill();

          ctx.fillStyle =
            "#0f172a";

          ctx.font =
            "bold 22px Arial";

          ctx.fillText(
            respuesta,
            650,
            legendY
          );

          ctx.fillStyle =
            "#475569";

          ctx.font =
            "20px Arial";

          ctx.fillText(
            `${value} personas · ${porcentaje}%`,
            930,
            legendY
          );

          legendY += 65;
        }
      );

      ctx.fillStyle = "#64748b";
      ctx.font = "18px Arial";

      ctx.fillText(
        `n = ${total} respuestas aplicables`,
        70,
        760
      );

      const blob =
        await new Promise<Blob | null>(
          (resolve) =>
            canvas.toBlob(
              resolve,
              "image/png",
              1
            )
        );

      if (!blob) continue;

      zip.file(
        `Pregunta_${String(
          item.pregunta
        ).replace(".", "_")}.png`,
        blob
      );
    }

    const archivo =
      await zip.generateAsync({
        type: "blob",
      });

    const url =
      URL.createObjectURL(archivo);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "Psyqus_Graficas_NOM035.zip";

    document.body.appendChild(link);

    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-cyan-300 font-black text-xl">
            Psyqus
          </p>

          <p className="mt-3 text-slate-400">
            Cargando resultados NOM-035...
          </p>
        </div>
      </main>
    );
  }

  if (errorCarga) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6">
        <div className="max-w-xl rounded-3xl border border-red-400/20 bg-red-500/5 p-8">
          <h1 className="text-2xl font-black text-red-300">
            No se pudieron cargar los resultados
          </h1>

          <p className="mt-4 text-slate-300">
            {errorCarga}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <section className="max-w-7xl mx-auto">

        {/* ENCABEZADO */}

        <div className="mb-10">
          <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm">
            Psyqus
          </p>

          <h1 className="mt-3 text-5xl font-black text-cyan-300">
            Resultados NOM-035
          </h1>

          <p className="mt-3 max-w-3xl text-slate-400">
            Resultados organizados por miembro evaluado y por reactivo.
            Los cuestionarios I y II se presentan de forma independiente.
          </p>
        </div>

        {/* RESUMEN */}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">

          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">
              Miembros evaluados
            </p>

            <p className="mt-2 text-4xl font-black text-cyan-300">
              {resumen.miembros}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-slate-400">
              Cuestionario I
            </p>

            <p className="mt-2 text-4xl font-black">
              {resumen.cuestionarioI}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <p className="text-slate-400">
              Cuestionario II
            </p>

            <p className="mt-2 text-4xl font-black">
              {resumen.cuestionarioII}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/70 p-6">
            <p className="text-slate-400">
              Áreas
            </p>

            <p className="mt-2 text-4xl font-black text-emerald-300">
              {resumen.areas}
            </p>
          </div>

        </div>

        {/* MIEMBROS */}

        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 mb-10">

          <div className="mb-6">
            <h2 className="text-3xl font-black text-white">
              Miembros evaluados
            </h2>

            <p className="mt-2 text-slate-400">
              Selecciona un colaborador para consultar sus resultados individuales.
            </p>
          </div>

          <div className="space-y-3">

            {miembros.map((miembro: any) => {
              const abierto =
                miembroAbierto ===
                miembro.clave;

              const evaluacionI =
                miembro.cuestionarioI;

              const evaluacionII =
                miembro.cuestionarioII;

              return (
                <div
                  key={miembro.clave}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70"
                >
                  <button
                    onClick={() =>
                      setMiembroAbierto(
                        abierto
                          ? null
                          : miembro.clave
                      )
                    }
                    className="w-full px-5 py-5 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-4">

                      <div className="w-11 h-11 rounded-full border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center text-xl">
                        👤
                      </div>

                      <div>
                        <p className="font-black text-lg text-white">
                          {miembro.nombre}
                        </p>

                        <p className="mt-1 text-sm text-slate-400">
                          {miembro.area} ·{" "}
                          {miembro.puesto}
                        </p>
                      </div>
                    </div>

                    <span className="text-cyan-300 text-xl">
                      {abierto ? "−" : "+"}
                    </span>
                  </button>

                  {abierto && (
                    <div className="border-t border-white/10 p-5">

                      <div className="grid lg:grid-cols-2 gap-5">

                        {/* CUESTIONARIO I */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-cyan-300 font-black">
                            Cuestionario I
                          </p>

                          {evaluacionI ? (
                            <>
                              <p className="mt-4 text-xl font-black text-white">
                                {evaluacionI.calificacion
                                  ?.requiereValoracionClinica
                                  ? "Requiere seguimiento conforme al criterio del cuestionario"
                                  : "Sin criterio de valoración"}
                              </p>

                              <p className="mt-3 text-sm leading-6 text-slate-300">
                                {evaluacionI.calificacion
                                  ?.mensaje ||
                                  "Sin información adicional."}
                              </p>

                              <details className="mt-5">
                                <summary className="cursor-pointer text-sm font-bold text-cyan-300">
                                  Ver respuestas
                                </summary>

                                <div className="mt-4 space-y-2">
                                  {Object.entries(
                                    evaluacionI.respuestas ||
                                      {}
                                  ).map(
                                    ([numero, valor]) => {
                                      const clave =
                                        `I.${numero}`;

                                      return (
                                        <div
                                          key={`${evaluacionI.id}-${numero}`}
                                          className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
                                        >
                                          <p className="text-xs font-bold text-cyan-300">
                                            Pregunta{" "}
                                            {numero}
                                          </p>

                                          <p className="mt-1 text-sm text-slate-300">
                                            {
                                              preguntasNom035[
                                                clave
                                              ]
                                            }
                                          </p>

                                          <p className="mt-2 text-sm font-black text-white">
                                            Respuesta:{" "}
                                            {respuestaTexto(
                                              "I",
                                              Number(
                                                valor
                                              )
                                            )}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </details>
                            </>
                          ) : (
                            <p className="mt-4 text-slate-500">
                              Sin registro.
                            </p>
                          )}
                        </div>

                        {/* CUESTIONARIO II */}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                          <p className="text-xs uppercase tracking-[0.22em] text-violet-300 font-black">
                            Cuestionario II
                          </p>

                          {evaluacionII ? (
                            <>
                              <div className="mt-4 grid grid-cols-2 gap-3">
                                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                  <p className="text-xs text-slate-500">
                                    Puntaje calculado
                                  </p>

                                  <p className="mt-2 text-3xl font-black text-cyan-300">
                                    {
                                      evaluacionII
                                        .calificacion
                                        ?.puntajeFinal
                                    }
                                  </p>
                                </div>

                                <div className="rounded-xl border border-white/10 bg-slate-950/60 p-4">
                                  <p className="text-xs text-slate-500">
                                    Nivel
                                  </p>

                                  <p className="mt-2 text-xl font-black text-white">
                                    {
                                      evaluacionII
                                        .calificacion
                                        ?.nivelFinal
                                    }
                                  </p>
                                </div>
                              </div>

                              <div className="mt-5">
                                <p className="text-sm font-black text-slate-300 mb-3">
                                  Categorías
                                </p>

                                <div className="space-y-2">
                                  {evaluacionII.calificacion?.categorias?.map(
                                    (
                                      categoria: any
                                    ) => (
                                      <div
                                        key={
                                          categoria.nombre
                                        }
                                        className="rounded-xl border border-white/10 bg-slate-950/50 p-3 flex justify-between gap-4"
                                      >
                                        <span className="text-sm text-slate-300">
                                          {
                                            categoria.nombre
                                          }
                                        </span>

                                        <span className="text-sm font-black text-cyan-300">
                                          {
                                            categoria.nivel
                                          }
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <details className="mt-5">
                                <summary className="cursor-pointer text-sm font-bold text-violet-300">
                                  Ver dominios
                                </summary>

                                <div className="mt-4 space-y-2">
                                  {evaluacionII.calificacion?.dominios?.map(
                                    (
                                      dominio: any
                                    ) => (
                                      <div
                                        key={
                                          dominio.nombre
                                        }
                                        className="rounded-xl border border-white/10 bg-slate-950/50 p-3 flex justify-between gap-4"
                                      >
                                        <span className="text-sm text-slate-300">
                                          {
                                            dominio.nombre
                                          }
                                        </span>

                                        <span className="text-sm font-black text-cyan-300">
                                          {
                                            dominio.puntaje
                                          }{" "}
                                          ·{" "}
                                          {
                                            dominio.nivel
                                          }
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </details>

                              <details className="mt-5">
                                <summary className="cursor-pointer text-sm font-bold text-violet-300">
                                  Ver respuestas
                                </summary>

                                <div className="mt-4 space-y-2">
                                  {Object.entries(
                                    respuestasIIAplicables(
                                      evaluacionII
                                    )
                                  ).map(
                                    ([numero, valor]) => {
                                      const clave =
                                        `II.${numero}`;

                                      return (
                                        <div
                                          key={`${evaluacionII.id}-${numero}`}
                                          className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
                                        >
                                          <p className="text-xs font-bold text-violet-300">
                                            Pregunta{" "}
                                            {numero}
                                          </p>

                                          <p className="mt-1 text-sm text-slate-300">
                                            {
                                              preguntasNom035[
                                                clave
                                              ]
                                            }
                                          </p>

                                          <p className="mt-2 text-sm font-black text-white">
                                            Respuesta:{" "}
                                            {respuestaTexto(
                                              "II",
                                              Number(
                                                valor
                                              )
                                            )}
                                          </p>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </details>
                            </>
                          ) : (
                            <p className="mt-4 text-slate-500">
                              Sin registro.
                            </p>
                          )}
                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* DESGLOSE */}

        <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-6">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-7">

            <div>
              <h2 className="text-3xl font-black text-cyan-300">
                Desglose por reactivo
              </h2>

              <p className="mt-2 text-slate-400">
                Consulta la distribución, casos relevantes e interpretación de cada pregunta.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={descargarTodasLasGraficas}
                className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-black text-cyan-300 hover:bg-cyan-500/20"
              >
                Descargar gráficas
              </button>

              <button
                onClick={exportarExcel}
                className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm font-black text-emerald-300 hover:bg-emerald-500/20"
              >
                Exportar Excel
              </button>

            </div>
          </div>

          {/* SELECTOR I / II */}

          <div className="inline-flex rounded-xl border border-white/10 bg-slate-950 p-1 mb-7">

            <button
              onClick={() => {
                setFiltroDesglose("I");
                setPreguntaAbierta(null);
              }}
              className={`rounded-lg px-5 py-2 text-sm font-black transition ${
                filtroDesglose === "I"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cuestionario I
            </button>

            <button
              onClick={() => {
                setFiltroDesglose("II");
                setPreguntaAbierta(null);
              }}
              className={`rounded-lg px-5 py-2 text-sm font-black transition ${
                filtroDesglose === "II"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cuestionario II
            </button>

          </div>

          <div className="space-y-3">

            {preguntasFiltradas.map(
              (item: any) => {
                const clave =
                  String(item.pregunta);

                const abierto =
                  preguntaAbierta === clave;

                const respuestas =
                  Object.entries(
                    item.respuestas || {}
                  );

                const total =
                  Number(item.total || 1);

                const chartData =
                  respuestas.map(
                    (
                      [respuesta, cantidad]
                    ) => ({
                      name: respuesta,
                      value:
                        Number(cantidad),
                    })
                  );

                const esI =
                  clave.startsWith("I.");

                const casosRelevantes =
                  (item.individuales ||
                    []).filter(
                    (persona: any) => {
                      if (esI) {
                        return (
                          persona.respuesta ===
                          "Sí"
                        );
                      }

                      return esRespuestaRelevanteII(
                        clave,
                        String(
                          persona.respuesta
                        )
                      );
                    }
                  );

                const interpretacionIA =
                  interpretacionesIA[
                    clave
                  ];



                const numeroII =
                  numeroPreguntaII(
                    clave
                  );

                return (
                  <div
                    key={clave}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70"
                  >
                    <button
                      onClick={() =>
                        alternarPregunta(
                          item
                        )
                      }
                      className="w-full px-5 py-5 text-left flex items-center justify-between gap-5 hover:bg-white/5 transition"
                    >
                      <div>
                        <p className="text-sm font-black text-cyan-300">
                          Pregunta {clave}
                        </p>

                        <p className="mt-2 text-white font-semibold">
                          {item.texto}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                          n = {item.total}{" "}
                          respuestas aplicables
                        </p>
                      </div>

                      <span className="shrink-0 text-xl text-cyan-300">
                        {abierto
                          ? "−"
                          : "+"}
                      </span>
                    </button>

                    {abierto && (
                      <div className="border-t border-white/10 p-5">

                        <div className="grid lg:grid-cols-[220px_1fr] gap-7 items-center">

                          <div className="w-52 h-52 mx-auto">
                            <ResponsiveContainer
                              width="100%"
                              height="100%"
                            >
                              <PieChart>
                                <Pie
                                  data={
                                    chartData
                                  }
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={
                                    55
                                  }
                                  outerRadius={
                                    88
                                  }
                                  paddingAngle={
                                    2
                                  }
                                >
                                  {chartData.map(
                                    (
                                      entry,
                                      index
                                    ) => (
                                      <Cell
                                        key={`${entry.name}-${index}`}
                                        fill={
                                          PIE_COLORS[
                                            index %
                                              PIE_COLORS.length
                                          ]
                                        }
                                      />
                                    )
                                  )}
                                </Pie>

                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>

                          <div className="space-y-4">

                            {respuestas.map(
                              (
                                [
                                  respuesta,
                                  cantidad,
                                ],
                                index
                              ) => {
                                const valor =
                                  Number(
                                    cantidad
                                  );

                                const porcentaje =
                                  total > 0
                                    ? Math.round(
                                        (valor /
                                          total) *
                                          1000
                                      ) /
                                      10
                                    : 0;

                                return (
                                  <div
                                    key={
                                      respuesta
                                    }
                                  >
                                    <div className="flex justify-between gap-4 text-sm">
                                      <span>
                                        {
                                          respuesta
                                        }
                                      </span>

                                      <span className="font-black text-cyan-300">
                                        {
                                          valor
                                        }{" "}
                                        ·{" "}
                                        {
                                          porcentaje
                                        }
                                        %
                                      </span>
                                    </div>

                                    <div className="mt-2 h-2 rounded-full bg-slate-800 overflow-hidden">
                                      <div
                                        className="h-full bg-cyan-400"
                                        style={{
                                          width: `${porcentaje}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                );
                              }
                            )}

                          </div>
                        </div>

                        {/* CASOS RELEVANTES */}

                        <div className="mt-7 rounded-2xl border border-amber-400/20 bg-amber-500/5 p-5">

                          <div className="flex justify-between gap-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 font-black">
                              Casos más relevantes
                            </p>

                            <span className="text-xs text-amber-200">
                              {
                                casosRelevantes.length
                              }{" "}
                              caso
                              {casosRelevantes.length ===
                              1
                                ? ""
                                : "s"}
                            </span>
                          </div>

                          {casosRelevantes.length >
                          0 ? (
                            <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                              {casosRelevantes.map(
                                (
                                  persona: any,
                                  index: number
                                ) => (
                                  <div
                                    key={`${clave}-${persona.id}-${index}`}
                                    className="rounded-xl border border-amber-400/15 bg-slate-950/60 p-4"
                                  >
                                    <p className="font-black text-white">
                                      {formatearNombre(
                                        [
                                          persona.nombre,
                                          persona.apellido,
                                        ]
                                          .filter(
                                            Boolean
                                          )
                                          .join(
                                            " "
                                          )
                                      )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      {
                                        persona.area
                                      }{" "}
                                      ·{" "}
                                      {
                                        persona.puesto
                                      }
                                    </p>

                                    <p className="mt-3 text-sm font-black text-amber-300">
                                      Respuesta:{" "}
                                      {
                                        persona.respuesta
                                      }
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <p className="mt-4 text-sm text-slate-400">
                              No se identificaron respuestas ubicadas en el criterio de mayor exposición definido para este reactivo.
                            </p>
                          )}

                          {/* INTERPRETACIÓN */}

                          <div className="mt-6 border-t border-white/10 pt-5">

                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">
                              Interpretación
                            </p>

<p className="mt-3 text-sm leading-7 text-slate-200">
  {interpretacionIA?.cargando
    ? "Analizando las respuestas reales de este reactivo..."
    : interpretacionIA?.interpretacion
    ? interpretacionIA.interpretacion
    : interpretacionIA?.error
    ? "No fue posible generar la interpretación automática. Los datos de distribución y las respuestas individuales permanecen disponibles para revisión."
    : "Preparando interpretación basada en las respuestas registradas..."}
</p>




                          </div>

                          {/* ACCIÓN */}

                          <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-500/5 p-4">

                            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-black">
                              Acción sugerida
                            </p>

<p className="mt-3 text-sm leading-7 text-slate-200">
  {interpretacionIA?.cargando
    ? "Preparando una recomendación a partir de los resultados..."
    : interpretacionIA?.accionSugerida
    ? interpretacionIA.accionSugerida
    : interpretacionIA?.error
    ? "No se generó una acción sugerida automática para este reactivo."
    : "Preparando acción sugerida..."}

                            </p>

                          </div>
                        </div>

                        {/* ÁREAS */}

                        <div className="mt-7">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-3">
                            Áreas representadas
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {Object.entries(
                              item.areas ||
                                {}
                            ).map(
                              ([
                                area,
                                cantidad,
                              ]) => (
                                <span
                                  key={area}
                                  className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-200"
                                >
                                  {area}:{" "}
                                  {String(
                                    cantidad
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        {/* RESPUESTAS INDIVIDUALES */}

                        <details className="mt-7 border-t border-white/10 pt-5">
                          <summary className="cursor-pointer text-sm font-black text-slate-300">
                            Ver respuestas individuales
                          </summary>

                          <div className="mt-4 overflow-x-auto">
                            <table className="w-full min-w-[700px] text-sm text-left">

                              <thead>
                                <tr className="border-b border-white/10 text-slate-500">
                                  <th className="py-3 pr-4">
                                    Colaborador
                                  </th>

                                  <th className="py-3 pr-4">
                                    Área
                                  </th>

                                  <th className="py-3 pr-4">
                                    Puesto
                                  </th>

                                  <th className="py-3 pr-4">
                                    Respuesta
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {item.individuales.map(
                                  (
                                    persona: any,
                                    index: number
                                  ) => (
                                    <tr
                                      key={`${clave}-${persona.id}-${index}`}
                                      className="border-b border-white/5"
                                    >
                                      <td className="py-3 pr-4 font-semibold text-white">
                                        {formatearNombre(
                                          [
                                            persona.nombre,
                                            persona.apellido,
                                          ]
                                            .filter(
                                              Boolean
                                            )
                                            .join(
                                              " "
                                            )
                                        )}
                                      </td>

                                      <td className="py-3 pr-4 text-slate-300">
                                        {
                                          persona.area
                                        }
                                      </td>

                                      <td className="py-3 pr-4 text-slate-300">
                                        {
                                          persona.puesto
                                        }
                                      </td>

                                      <td className="py-3 pr-4 font-black text-cyan-300">
                                        {
                                          persona.respuesta
                                        }
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </details>

                      </div>
                    )}
                  </div>
                );
              }
            )}

          </div>
        </div>

        {/* NOTA METODOLÓGICA */}

        <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
            Nota metodológica
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Para esta aplicación, los reactivos II.41–II.43 se analizan únicamente en puestos con atención directa identificable a clientes o usuarios. Los reactivos II.44–II.46 se analizan únicamente en puestos con funciones explícitas de coordinación o jefatura. Esta corrección se aplica al análisis mostrado y no modifica las respuestas originales almacenadas.
          </p>
        </div>

      </section>
    </main>
  );
}
