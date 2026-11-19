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

import * as XLSX from "xlsx";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { PersonaRed } from "./RedOrganizacion3D";

// three.js solo se carga en el navegador y al abrir la pestaña.
const RedOrganizacion3D = dynamic(() => import("./RedOrganizacion3D"), {
  ssr: false,
  loading: () => (
    <div className="h-[560px] rounded-3xl border border-white/10 bg-slate-900/40 flex items-center justify-center text-slate-400">
      Cargando red 3D…
    </div>
  ),
});
import type { EmpresaNom035 } from "@/lib/nom035-empresas";
import {
  agregarHojaGraficas,
  descargarBlob,
  insertarPastelesExcel,
  type PreguntaParaGrafica,
} from "@/lib/nom035-excel-graficas";
import {
  describirPregunta,
  hechosVerificados,
  interpretacionGeneralRespaldo,
  interpretacionGrupal,
  resumirBloques,
} from "@/lib/nom035-reporte-datos";
import type {
  DatosReporte,
  InterpretacionGeneral,
  PreguntaReporte,
} from "@/lib/nom035-reporte-word";

// El generador de Word (y la librería docx) se carga solo al usarlo.
async function generarReporteWord(datos: DatosReporte) {
  const modulo = await import("@/lib/nom035-reporte-word");
  return modulo.generarReporteWord(datos);
}

const OPCIONES_I = ["Sí", "No"];

const OPCIONES_II = [
  "Siempre",
  "Casi siempre",
  "Algunas veces",
  "Casi nunca",
  "Nunca",
];

function sufijoArchivo(nombre: string) {
  return nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

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

export default function ResultadosNom035({
  empresa,
}: {
  empresa: EmpresaNom035;
}) {
  const archivoEmpresa = sufijoArchivo(empresa.nombre);
  const [data, setData] = useState<Nom035Resultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [miembroAbierto, setMiembroAbierto] =
    useState<string | null>(null);

  const [preguntaAbierta, setPreguntaAbierta] =
    useState<string | null>(null);

  const [filtroDesglose, setFiltroDesglose] =
    useState<"I" | "II">("II");

  const [pestana, setPestana] = useState<
    "resumen" | "red" | "personas" | "reactivos"
  >("resumen");

  const [busqueda, setBusqueda] = useState("");

  const [progresoReporte, setProgresoReporte] =
    useState<string | null>(null);

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
          `/api/nom035-resultados?empresa=${encodeURIComponent(
            empresa.id
          )}`,
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

        const filas: Nom035Resultado[] = Array.isArray(json)
          ? json
          : [];

        setData(filas);

        /*
          Si la empresa solo tiene Cuestionario I
          (p. ej. 3P), el desglose abre en I.
        */
        if (
          !filas.some((x) => x.tipo_cuestionario === "II")
        ) {
          setFiltroDesglose("I");
        }
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
  }, [empresa.id]);

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
    INDICADORES PARA LA PESTAÑA RESUMEN
  */

  const indicadores = useMemo(() => {
    const conI = miembros.filter((m: any) => m.cuestionarioI);

    const afirmativasI = conI.filter((m: any) =>
      Object.values(m.cuestionarioI.respuestas || {}).some(
        (v) => Number(v) === 1
      )
    ).length;

    const seguimientoI = conI.filter(
      (m: any) =>
        m.cuestionarioI.calificacion?.requiereValoracionClinica
    ).length;

    const niveles = [
      "Nulo o despreciable",
      "Bajo",
      "Medio",
      "Alto",
      "Muy alto",
    ];

    const conII = miembros.filter(
      (m: any) => m.cuestionarioII?.calificacion
    );

    const distribucionII = niveles.map((nivel) => ({
      nivel,
      cantidad: conII.filter(
        (m: any) =>
          m.cuestionarioII.calificacion.nivelFinal === nivel
      ).length,
    }));

    return {
      totalI: conI.length,
      afirmativasI,
      seguimientoI,
      totalII: conII.length,
      distribucionII,
      altoII: conII.filter((m: any) =>
        ["Alto", "Muy alto"].includes(
          m.cuestionarioII.calificacion.nivelFinal
        )
      ).length,
    };
  }, [miembros]);


  /*
    DATOS DE LA EVALUACIÓN (los mismos del Excel), para el
    reporte detallado y la red 3D.
  */

  const datosEvaluacion = useMemo(() => {
    // Indicadores (los mismos datos del Excel).
    const conI = miembros.filter((m: any) => m.cuestionarioI);
    const si = (m: any, i: number) =>
      Number((m.cuestionarioI.respuestas || {})[String(i)]) === 1;
    const posteriores = Array.from({ length: 14 }, (_, k) => k + 2);

    // Criterio DOF: sin "Sí" en la Sección I no hay valoración clínica.
    const requiereDOF = (m: any) =>
      si(m, 1) &&
      Boolean(m.cuestionarioI.calificacion?.requiereValoracionClinica);

    const cuestionarioI = conI.length
      ? {
          total: conI.length,
          conAcontecimiento: conI.filter((m: any) => si(m, 1)).length,
          conAlgunSi: conI.filter(
            (m: any) => si(m, 1) || posteriores.some((k) => si(m, k))
          ).length,
          requierenValoracion: conI.filter(requiereDOF).length,
          sinAcontecimientoConSi: conI.filter(
            (m: any) => !si(m, 1) && posteriores.some((k) => si(m, k))
          ).length,
          personasSeguimiento: conI
            .filter(requiereDOF)
            .map((m: any) => String(m.nombre)),
        }
      : undefined;

    const conII = miembros.filter(
      (m: any) => m.cuestionarioII?.calificacion
    );
    const calificacionesII = conII.map(
      (m: any) => m.cuestionarioII.calificacion
    );

    const cuestionarioII = conII.length
      ? {
          total: conII.length,
          distribucion: Object.fromEntries(
            indicadores.distribucionII.map((x) => [x.nivel, x.cantidad])
          ),
          categorias: resumirBloques(calificacionesII, "categorias"),
          dominios: resumirBloques(calificacionesII, "dominios"),
          personasAltas: conII
            .filter((m: any) =>
              ["Alto", "Muy alto"].includes(
                m.cuestionarioII.calificacion.nivelFinal
              )
            )
            .map((m: any) => ({
              nombre: String(m.nombre),
              nivel: String(m.cuestionarioII.calificacion.nivelFinal),
            })),
        }
      : undefined;

    return { cuestionarioI, cuestionarioII };
  }, [miembros, indicadores]);

  const personasRed = useMemo<PersonaRed[]>(() => {
    return miembros.map((m: any) => {
      const r = m.cuestionarioI?.respuestas || {};
      const si = (i: number) => Number(r[String(i)]) === 1;
      const posteriores = Array.from({ length: 14 }, (_, k) => k + 2);

      return {
        id: String(m.clave),
        nombre: String(m.nombre),
        area: String(m.area || "Sin área"),
        nivel: m.cuestionarioII?.calificacion?.nivelFinal || null,
        seguimientoI: Boolean(
          m.cuestionarioI &&
            si(1) &&
            m.cuestionarioI.calificacion?.requiereValoracionClinica
        ),
        siSinAcontecimiento: Boolean(
          m.cuestionarioI && !si(1) && posteriores.some((k) => si(k))
        ),
      };
    });
  }, [miembros]);

  const [lecturaRed, setLecturaRed] = useState<{
    cargando: boolean;
    tendencia?: string;
    focos?: string[];
    resumen?: string;
    error?: boolean;
  }>({ cargando: false });

  async function pedirLecturaRed() {
    setLecturaRed({ cargando: true });

    const { cuestionarioI, cuestionarioII } = datosEvaluacion;

    const preguntas = (desglosePorPregunta as any[]).map((item) => {
      const clave = String(item.pregunta);
      return {
        clave,
        texto: describirPregunta(clave, String(item.texto)).texto,
        respuestas: item.respuestas,
        total: Number(item.total || 0),
        interpretacion: interpretacionGrupal(
          clave,
          item.respuestas,
          Number(item.total || 0)
        ).interpretacion,
      };
    });

    try {
      const response = await fetch("/api/nom035/interpretacion-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hechos: hechosVerificados({
            personas: resumen.miembros,
            preguntas,
            cuestionarioI,
            cuestionarioII,
          }),
          guias: [cuestionarioI && "I", cuestionarioII && "II"].filter(Boolean),
          personas: resumen.miembros,
          cuestionarioI: cuestionarioI && {
            total: cuestionarioI.total,
            conAcontecimiento: cuestionarioI.conAcontecimiento,
            conAlgunSi: cuestionarioI.conAlgunSi,
            requierenValoracionSegunDOF: cuestionarioI.requierenValoracion,
            respuestasSinAcontecimiento: cuestionarioI.sinAcontecimientoConSi,
          },
          cuestionarioII: cuestionarioII && {
            total: cuestionarioII.total,
            distribucionNivelFinal: cuestionarioII.distribucion,
            categorias: cuestionarioII.categorias,
            dominios: cuestionarioII.dominios,
          },
          preguntas: preguntas.map((q) => ({
            clave: q.clave,
            texto: q.texto,
            distribucion: q.respuestas,
            total: q.total,
            interpretacion: q.interpretacion,
          })),
        }),
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const json = await response.json();

      setLecturaRed({
        cargando: false,
        resumen: json.resumenEjecutivo,
        tendencia: json.tendencia,
        focos: json.focosDeAtencion,
      });
    } catch (error) {
      console.error("Lectura inteligente de la red no disponible:", error);
      setLecturaRed({ cargando: false, error: true });
    }
  }

  const miembrosFiltrados = useMemo(() => {
    const texto = busqueda
      .trim()
      .toLocaleLowerCase("es-MX");

    if (!texto) return miembros;

    return miembros.filter((m: any) =>
      [m.nombre, m.area, m.puesto]
        .join(" ")
        .toLocaleLowerCase("es-MX")
        .includes(texto)
    );
  }, [miembros, busqueda]);

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

    /*
      Todas las opciones aparecen, en orden fijo,
      aunque nadie las haya elegido (p. ej. "Sí: 0").
    */
    Object.values(conteo).forEach((item: any) => {
      const opciones = String(item.pregunta).startsWith("I.")
        ? OPCIONES_I
        : OPCIONES_II;

      const ordenadas: Record<string, number> = {};

      opciones.forEach((opcion) => {
        ordenadas[opcion] = item.respuestas[opcion] || 0;
      });

      Object.entries(item.respuestas).forEach(
        ([respuesta, cantidad]) => {
          if (!(respuesta in ordenadas)) {
            ordenadas[respuesta] = Number(cantidad);
          }
        }
      );

      item.respuestas = ordenadas;
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

    /*
      A Groq solo se envía la respuesta de cada caso,
      sin nombre, área ni puesto: es un tercero y son
      datos sensibles. Los nombres siguen visibles
      para el profesional dentro de Psyqus.
    */
    const casosParaIA = casosRelevantes.map(
      (persona: any, index: number) => ({
        caso: index + 1,
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

  async function exportarExcel() {
    const workbook = XLSX.utils.book_new();

    const evaluacionesI = miembros.filter(
      (m: any) => m.cuestionarioI
    );

    const conSeguimientoI = evaluacionesI.filter(
      (m: any) =>
        m.cuestionarioI.calificacion?.requiereValoracionClinica
    ).length;

    const conAfirmativasI = evaluacionesI.filter((m: any) =>
      Object.values(m.cuestionarioI.respuestas || {}).some(
        (v) => Number(v) === 1
      )
    ).length;

    const resumenExcel: any[][] = [
      ["PSYQUS - RESULTADOS NOM-035"],
      ["Empresa", empresa.nombre],
      [
        "Fecha de exportación",
        new Date().toLocaleDateString("es-MX", {
          dateStyle: "long",
        }),
      ],
      [],
      ["Miembros evaluados", resumen.miembros],
      ["Cuestionario I", resumen.cuestionarioI],
      ["Cuestionario II", resumen.cuestionarioII],
      ["Áreas", resumen.areas],
    ];

    if (evaluacionesI.length) {
      resumenExcel.push(
        [],
        ["CUESTIONARIO I · ACONTECIMIENTOS TRAUMÁTICOS SEVEROS"],
        [
          "Personas con al menos una respuesta «Sí»",
          conAfirmativasI,
        ],
        [
          "Personas que alcanzan criterio de seguimiento",
          conSeguimientoI,
        ],
        [
          "Personas sin criterio de seguimiento",
          evaluacionesI.length - conSeguimientoI,
        ]
      );
    }

    const hojaResumen =
      XLSX.utils.aoa_to_sheet(resumenExcel);

    hojaResumen["!cols"] = [
      { wch: 48 },
      { wch: 28 },
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

    /*
      CUESTIONARIO I POR PERSONA
    */

    if (evaluacionesI.length) {
      const filasPersonasI: any[][] = [
        [
          "Colaborador",
          "Área",
          "Puesto",
          "Fecha",
          "Respuestas «Sí»",
          "Preguntas con «Sí»",
          "Sección II (2-3)",
          "Sección III (4-10)",
          "Sección IV (11-15)",
          "Criterio de seguimiento",
          "Resultado",
        ],
      ];

      evaluacionesI.forEach((m: any) => {
        const ev = m.cuestionarioI;
        const cal = ev.calificacion || {};

        const afirmativas = Object.entries(
          ev.respuestas || {}
        )
          .filter(([, v]) => Number(v) === 1)
          .map(([n]) => Number(n))
          .sort((a, b) => a - b);

        filasPersonasI.push([
          m.nombre,
          ev.area || "Sin área",
          ev.puesto || "Sin puesto",
          ev.created_at
            ? new Date(ev.created_at).toLocaleDateString(
                "es-MX"
              )
            : "",
          afirmativas.length,
          afirmativas.length
            ? afirmativas.map((n) => `I.${n}`).join(", ")
            : "Ninguna",
          cal.seccionII ?? 0,
          cal.seccionIII ?? 0,
          cal.seccionIV ?? 0,
          cal.requiereValoracionClinica ? "Sí" : "No",
          cal.mensaje || "",
        ]);
      });

      const hojaPersonasI =
        XLSX.utils.aoa_to_sheet(filasPersonasI);

      hojaPersonasI["!cols"] = [
        { wch: 34 },
        { wch: 18 },
        { wch: 24 },
        { wch: 12 },
        { wch: 14 },
        { wch: 22 },
        { wch: 14 },
        { wch: 16 },
        { wch: 16 },
        { wch: 22 },
        { wch: 90 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        hojaPersonasI,
        "Cuestionario I"
      );

      /*
        MATRIZ PERSONA × PREGUNTA
      */

      const filasMatriz: any[][] = [
        [
          "Colaborador",
          ...Array.from({ length: 15 }, (_, i) => `I.${i + 1}`),
        ],
        [
          "Pregunta",
          ...Array.from(
            { length: 15 },
            (_, i) => preguntasNom035[`I.${i + 1}`]
          ),
        ],
      ];

      evaluacionesI.forEach((m: any) => {
        const respuestas = m.cuestionarioI.respuestas || {};

        filasMatriz.push([
          m.nombre,
          ...Array.from({ length: 15 }, (_, i) =>
            respuestaTexto(
              "I",
              Number(respuestas[String(i + 1)] || 0)
            )
          ),
        ]);
      });

      filasMatriz.push([
        "Total «Sí»",
        ...Array.from(
          { length: 15 },
          (_, i) =>
            evaluacionesI.filter(
              (m: any) =>
                Number(
                  (m.cuestionarioI.respuestas || {})[
                    String(i + 1)
                  ]
                ) === 1
            ).length
        ),
      ]);

      const hojaMatriz =
        XLSX.utils.aoa_to_sheet(filasMatriz);

      hojaMatriz["!cols"] = [
        { wch: 34 },
        ...Array.from({ length: 15 }, () => ({ wch: 14 })),
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        hojaMatriz,
        "Matriz Cuestionario I"
      );
    }

    /*
      HOJA "GRÁFICAS": un pastel nativo de Excel por
      pregunta, que lee las celdas de esa hoja.
    */

    const preguntasGraficas: PreguntaParaGrafica[] = (
      desglosePorPregunta as any[]
    ).map((item) => ({
      clave: String(item.pregunta),
      texto: String(item.texto),
      respuestas: item.respuestas,
      total: Number(item.total || 0),
    }));

    agregarHojaGraficas(workbook, preguntasGraficas);

    const nombreArchivo = `Psyqus_Resultados_NOM035_${archivoEmpresa}.xlsx`;

    try {
      const libro = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      }) as ArrayBuffer;

      const conGraficas = await insertarPastelesExcel(
        libro,
        preguntasGraficas
      );

      descargarBlob(conGraficas, nombreArchivo);
    } catch (error) {
      console.error(
        "No se pudieron insertar las gráficas en el Excel:",
        error
      );

      // Respaldo: el Excel sin gráficas, para no dejar
      // al usuario sin archivo.
      XLSX.writeFile(workbook, nombreArchivo);
    }
  }

  /*
    REPORTE DETALLADO (WORD)

    1. Lee los mismos datos del Excel (desglose y calificaciones).
    2. Obtiene la interpretación de cada pregunta (IA con datos
       anónimos; si falla, la de Psyqus).
    3. Pide la interpretación general de toda la evaluación.
    4. Genera el .docx con gráficas nativas y el logo.
  */

  async function obtenerInterpretacionIA(item: any) {
    const clave = String(item.pregunta);

    if (interpretacionesIA[clave]?.interpretacion) {
      return {
        interpretacion: interpretacionesIA[clave].interpretacion,
        accion: interpretacionesIA[clave].accionSugerida,
      };
    }

    const esI = clave.startsWith("I.");

    const casos = (item.individuales || [])
      .filter((persona: any) =>
        esI
          ? persona.respuesta === "Sí"
          : esRespuestaRelevanteII(clave, String(persona.respuesta))
      )
      .map((persona: any, index: number) => ({
        caso: index + 1,
        respuesta: persona.respuesta,
      }));

    try {
      const response = await fetch("/api/nom035/interpretar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cuestionario: esI ? "I" : "II",
          numeroPregunta: clave,
          pregunta: item.texto,
          distribucion: item.respuestas,
          total: item.total,
          casosRelevantes: casos,
        }),
      });

      if (!response.ok) return null;

      const json = await response.json();

      if (!json.interpretacion) return null;

      return {
        interpretacion: String(json.interpretacion),
        accion: String(json.accionSugerida || ""),
      };
    } catch {
      return null;
    }
  }

  async function descargarReporteDetallado() {
    if (progresoReporte) return;

    try {
      const items = desglosePorPregunta as any[];
      const preguntas: PreguntaReporte[] = new Array(items.length);
      let hechas = 0;
      let siguiente = 0;

      setProgresoReporte(
        `Interpretando preguntas (0 de ${items.length})…`
      );

      // Interpretación por pregunta, 4 a la vez.
      const trabajador = async () => {
        while (siguiente < items.length) {
          const indice = siguiente++;
          const item = items[indice];
          const clave = String(item.pregunta);
          const descripcion = describirPregunta(clave, String(item.texto));
          const ia = await obtenerInterpretacionIA(item);
          const respaldo = interpretacionGrupal(
            clave,
            item.respuestas,
            Number(item.total || 0)
          );

          preguntas[indice] = {
            clave,
            texto: descripcion.texto,
            seccion: descripcion.seccion,
            constructo: descripcion.constructo,
            respuestas: item.respuestas,
            total: Number(item.total || 0),
            interpretacion: ia?.interpretacion || respaldo.interpretacion,
            accion: ia?.accion || respaldo.accion,
            fuente: ia ? "ia" : "psyqus",
          };

          hechas += 1;
          setProgresoReporte(
            `Interpretando preguntas (${hechas} de ${items.length})…`
          );
        }
      };

      await Promise.all([0, 1, 2, 3].map(() => trabajador()));

      const { cuestionarioI, cuestionarioII } = datosEvaluacion;

      // Interpretación general (IA con datos anónimos y agregados).
      setProgresoReporte("Redactando la interpretación general…");

      let general: InterpretacionGeneral = interpretacionGeneralRespaldo({
        personas: resumen.miembros,
        cuestionarioI,
        cuestionarioII,
      });

      try {
        const response = await fetch("/api/nom035/interpretacion-general", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hechos: hechosVerificados({
              personas: resumen.miembros,
              preguntas,
              cuestionarioI,
              cuestionarioII,
            }),
            guias: [cuestionarioI && "I", cuestionarioII && "II"].filter(
              Boolean
            ),
            personas: resumen.miembros,
            cuestionarioI: cuestionarioI && {
              total: cuestionarioI.total,
              conAcontecimiento: cuestionarioI.conAcontecimiento,
              conAlgunSi: cuestionarioI.conAlgunSi,
              requierenValoracionSegunDOF: cuestionarioI.requierenValoracion,
              respuestasSinAcontecimiento:
                cuestionarioI.sinAcontecimientoConSi,
            },
            cuestionarioII: cuestionarioII && {
              total: cuestionarioII.total,
              distribucionNivelFinal: cuestionarioII.distribucion,
              categorias: cuestionarioII.categorias,
              dominios: cuestionarioII.dominios,
            },
            preguntas: preguntas.map((p) => ({
              clave: p.clave,
              texto: p.texto,
              seccion: p.seccion,
              distribucion: p.respuestas,
              total: p.total,
              interpretacion: p.interpretacion,
            })),
          }),
        });

        if (response.ok) {
          const json = await response.json();

          if (json.resumenEjecutivo && json.interpretacionGeneral?.length) {
            general = {
              ...json,
              planDeAccion: json.planDeAccion?.length
                ? json.planDeAccion
                : general.planDeAccion,
              fuente: "ia",
            };
          }
        }
      } catch (error) {
        console.error("Interpretación general con IA no disponible:", error);
      }

      setProgresoReporte("Armando el documento…");

      const logo = await (await fetch("/logo.jpg")).arrayBuffer();

      const blob = await generarReporteWord({
        empresa: empresa.nombre,
        fecha: new Date().toLocaleDateString("es-MX", { dateStyle: "long" }),
        personas: resumen.miembros,
        preguntas,
        cuestionarioI,
        cuestionarioII,
        general,
        logo,
      });

      descargarBlob(blob, `Psyqus_Reporte_NOM035_${archivoEmpresa}.docx`);
    } catch (error) {
      console.error("No se pudo generar el reporte detallado:", error);
      alert("No fue posible generar el reporte. Intenta de nuevo.");
    } finally {
      setProgresoReporte(null);
    }
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
    <main className="min-h-screen bg-[#020617] text-white px-4 sm:px-8 py-10 sm:py-14">
      <section className="max-w-6xl mx-auto">

        {/* ENCABEZADO */}

        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-8 border-b border-white/10">
          <div>
            <Link
              href="/nom035-resultados"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-cyan-300 transition"
            >
              ← Cambiar empresa
            </Link>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-cyan-400">
              Psyqus · {empresa.nombre}
            </p>

            <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight text-white">
              Resultados NOM-035
            </h1>

            <p className="mt-3 text-slate-400">
              {empresa.descripcion}
            </p>
          </div>

          <div className="flex flex-col items-start lg:items-end gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={exportarExcel}
              className="rounded-xl border border-emerald-400/40 px-5 py-3 text-sm font-black text-emerald-300 hover:bg-emerald-500/10 transition"
            >
              Exportar Excel
            </button>

            <button
              onClick={descargarReporteDetallado}
              disabled={Boolean(progresoReporte) || data.length === 0}
              className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-60"
            >
              {progresoReporte ? "Generando…" : "Reporte detallado (Word)"}
            </button>
          </div>

          {progresoReporte && (
            <p className="text-sm text-cyan-300">{progresoReporte}</p>
          )}
          </div>
        </header>

        {/* PESTAÑAS */}

        <nav className="mt-8 mb-10 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60 p-1.5 w-full sm:w-fit">
          {(
            [
              ["resumen", "Resumen"],
              ["red", "Red 3D"],
              ["personas", `Personas (${resumen.miembros})`],
              ["reactivos", "Por reactivo"],
            ] as const
          ).map(([id, etiqueta]) => (
            <button
              key={id}
              onClick={() => setPestana(id)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                pestana === id
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {etiqueta}
            </button>
          ))}
        </nav>

        {/* RESUMEN */}

        {pestana === "resumen" && (
          <div className="space-y-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                ["Personas evaluadas", resumen.miembros, "text-cyan-300"],
                ["Cuestionario I", resumen.cuestionarioI, "text-white"],
                ["Cuestionario II", resumen.cuestionarioII, "text-white"],
                ["Áreas", resumen.areas, "text-white"],
              ].map(([titulo, valor, color]) => (
                <div
                  key={String(titulo)}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-6"
                >
                  <p className="text-sm text-slate-400">{titulo}</p>
                  <p className={`mt-3 text-4xl font-black ${color}`}>
                    {valor}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {indicadores.totalI > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    Cuestionario I · Acontecimientos traumáticos
                  </p>

                  <p className="mt-5 text-5xl font-black text-white">
                    {indicadores.seguimientoI}
                    <span className="text-xl font-bold text-slate-500">
                      {" "}/ {indicadores.totalI}
                    </span>
                  </p>

                  <p className="mt-2 text-slate-300">
                    personas alcanzan el criterio de seguimiento
                  </p>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">
                        Con al menos un «Sí»
                      </span>
                      <span className="font-bold text-white">
                        {indicadores.afirmativasI}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-400">
                        Sin respuestas afirmativas
                      </span>
                      <span className="font-bold text-white">
                        {indicadores.totalI - indicadores.afirmativasI}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {indicadores.totalII > 0 && (
                <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
                    Cuestionario II · Nivel de riesgo
                  </p>

                  <p className="mt-5 text-5xl font-black text-white">
                    {indicadores.altoII}
                    <span className="text-xl font-bold text-slate-500">
                      {" "}/ {indicadores.totalII}
                    </span>
                  </p>

                  <p className="mt-2 text-slate-300">
                    personas en nivel Alto o Muy alto
                  </p>

                  <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                    {indicadores.distribucionII.map(
                      ({ nivel, cantidad }) => (
                        <div key={nivel}>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-slate-400">{nivel}</span>
                            <span className="font-bold text-white">
                              {cantidad}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-violet-400"
                              style={{
                                width: `${
                                  (cantidad / indicadores.totalII) * 100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <p className="text-sm text-slate-500">
              Consulta el detalle en las pestañas «Personas» y «Por
              reactivo». Las descargas incluyen solo a {empresa.nombre}.
            </p>
          </div>
        )}

        {/* RED 3D */}

        {pestana === "red" && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white">
                Red de la organización
              </h2>
              <p className="mt-2 max-w-3xl text-slate-400">
                Cada avatar es una persona evaluada, conectada a su área y al núcleo de la organización. El color indica su nivel; la flecha señala hacia dónde se concentra el riesgo.
              </p>
            </div>

            <RedOrganizacion3D
              personas={personasRed}
              dominios={datosEvaluacion.cuestionarioII?.dominios || []}
              lecturaIA={lecturaRed}
              onPedirLectura={pedirLecturaRed}
            />
          </div>
        )}

        {/* MIEMBROS */}

        {pestana === "personas" && (
        <div>

          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h2 className="text-2xl font-black text-white">
                Personas evaluadas
              </h2>

              <p className="mt-2 text-slate-400">
                Abre a una persona para ver sus resultados individuales.
              </p>
            </div>

            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, área o puesto"
              className="w-full sm:w-80 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60"
            />
          </div>

          {miembrosFiltrados.length === 0 && (
            <p className="rounded-2xl border border-white/10 p-8 text-center text-slate-400">
              No hay personas que coincidan con la búsqueda.
            </p>
          )}

          <div className="space-y-4">

            {miembrosFiltrados.map((miembro: any) => {
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

                    <div className="flex shrink-0 items-center gap-3">
                      {evaluacionI && (
                        <span
                          className={`hidden sm:inline rounded-full px-3 py-1 text-xs font-bold ${
                            evaluacionI.calificacion
                              ?.requiereValoracionClinica
                              ? "bg-amber-400/15 text-amber-300"
                              : "bg-white/5 text-slate-400"
                          }`}
                        >
                          {evaluacionI.calificacion
                            ?.requiereValoracionClinica
                            ? "C-I: seguimiento"
                            : "C-I: sin criterio"}
                        </span>
                      )}

                      {evaluacionII?.calificacion?.nivelFinal && (
                        <span className="hidden sm:inline rounded-full bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                          C-II: {evaluacionII.calificacion.nivelFinal}
                        </span>
                      )}

                      <span className="w-6 text-center text-cyan-300 text-xl">
                        {abierto ? "−" : "+"}
                      </span>
                    </div>
                  </button>

                  {abierto && (
                    <div className="border-t border-white/10 p-5 sm:p-8">

                      <div
                        className={`grid gap-6 ${
                          resumen.cuestionarioII > 0
                            ? "lg:grid-cols-2"
                            : ""
                        }`}
                      >

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

                        {resumen.cuestionarioII > 0 && (
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
                        )}

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* DESGLOSE */}

        {pestana === "reactivos" && (
        <div>

          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">

            <div>
              <h2 className="text-2xl font-black text-white">
                Desglose por reactivo
              </h2>

              <p className="mt-2 text-slate-400">
                Abre una pregunta para ver su distribución, los casos relevantes y la interpretación.
              </p>
            </div>
          </div>

          {/* SELECTOR I / II */}

          {resumen.cuestionarioI > 0 &&
            resumen.cuestionarioII > 0 && (

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
          )}

          <div className="space-y-4">

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
    ? interpretacionDeterministica(item, casosRelevantes)
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

        )}

        {/* NOTA METODOLÓGICA */}

        {pestana === "reactivos" && resumen.cuestionarioII > 0 && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-slate-900/40 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">
            Nota metodológica
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Para esta aplicación, los reactivos II.41–II.43 se analizan únicamente en puestos con atención directa identificable a clientes o usuarios. Los reactivos II.44–II.46 se analizan únicamente en puestos con funciones explícitas de coordinación o jefatura. Esta corrección se aplica al análisis mostrado y no modifica las respuestas originales almacenadas.
          </p>
        </div>
        )}

      </section>
    </main>
  );
}
