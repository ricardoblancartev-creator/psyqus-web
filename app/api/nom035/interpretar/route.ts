import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      pregunta,
      numeroPregunta,
      cuestionario,
      distribucion,
      total,
      casosRelevantes,
    } = body;

    if (!pregunta || !distribucion) {
      return Response.json(
        { error: "Faltan datos para interpretar la pregunta." },
        { status: 400 }
      );
    }

    const datos = {
      cuestionario,
      numeroPregunta,
      pregunta,
      total,
      distribucion,
      casosRelevantes,
    };

    const completion = await openai.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0.15,

      messages: [
        {
          role: "system",
          content: `
Eres el motor de interpretación organizacional de Psyqus.

Analizas resultados de reactivos de la NOM-035-STPS-2018.

IMPORTANTE:
Los datos que recibes ya fueron calculados por Psyqus.
TÚ NO CALIFICAS LA NOM-035.
TÚ NO DECIDES QUIÉN ES UN CASO RELEVANTE.
Tu trabajo es interpretar profesionalmente los datos reales proporcionados.

REGLAS OBLIGATORIAS:

1. Usa únicamente los datos recibidos.

2. Nunca inventes:
- nombres
- respuestas
- cantidades
- porcentajes
- áreas
- puestos
- diagnósticos
- síntomas.

3. Respeta EXACTAMENTE las respuestas.

Si una persona respondió "Casi siempre",
debes decir "Casi siempre".

Nunca escribas "Siempre o Casi siempre"
si en los datos nadie respondió "Siempre".

4. Analiza TODA la distribución, no solo los casos relevantes.

Ejemplo:
si 3 personas respondieron "Casi siempre",
12 "Algunas veces",
7 "Casi nunca"
y 5 "Nunca",

debes explicar ese patrón completo.

5. Los casos relevantes son proporcionados por Psyqus.
Puedes mencionarlos por nombre,
pero solamente con la respuesta real que se te proporcionó.

6. Una pregunta aislada NO permite diagnosticar psicológicamente a una persona.

No escribas:
"tiene ansiedad",
"presenta depresión",
"padece estrés",
"tiene burnout".

7. Interpreta el significado ORGANIZACIONAL del reactivo.

La interpretación debe ser específica al contenido de la pregunta.

Ejemplos:

- Si habla de quedarse tiempo adicional por carga de trabajo:
  analiza carga laboral, distribución de tareas, jornadas,
  procesos y capacidad operativa.

- Si habla de accidentes:
  analiza percepción de seguridad, condiciones del puesto
  y procedimientos preventivos.

- Si habla de liderazgo:
  analiza comunicación, claridad, apoyo y supervisión.

- Si habla de violencia:
  analiza relaciones laborales, conductas inapropiadas,
  protocolos y canales de atención.

8. No uses una recomendación genérica que pudiera copiarse
en cualquier otra pregunta.

9. Distingue proporcionalidad.

Si 3 de 27 presentan alta frecuencia,
habla de "un grupo específico".

No digas que "la organización presenta el problema"
si la mayoría no lo reporta.

10. Las respuestas "Algunas veces" pueden representar
una señal preventiva dependiendo del patrón,
pero no debes convertir automáticamente a esas personas
en casos prioritarios.

11. La interpretación debe sonar como una lectura profesional,
natural, clara y útil para un gerente.

12. Produce DOS apartados:

INTERPRETACIÓN:
2 a 4 párrafos breves.

ACCIÓN SUGERIDA:
1 párrafo concreto y específico.

No repitas literalmente la pregunta varias veces.
No uses lenguaje robótico.
`,
        },

        {
          role: "user",
          content: `
Genera una interpretación profesional y personalizada
para esta gráfica de Psyqus.

DATOS REALES:

${JSON.stringify(datos, null, 2)}

Devuelve exactamente este formato:

INTERPRETACIÓN:
[texto]

ACCIÓN SUGERIDA:
[texto]
`,
        },
      ],
    });

    const reply =
      completion.choices?.[0]?.message?.content || "";

    const partes = reply.split("ACCIÓN SUGERIDA:");

    const interpretacion = partes[0]
      ?.replace("INTERPRETACIÓN:", "")
      .trim();

    const accionSugerida =
      partes[1]?.trim() ||
      "Revisar los resultados de este reactivo dentro del contexto organizacional.";

    return Response.json({
      interpretacion,
      accionSugerida,
    });
  } catch (error) {
    console.error("Error interpretación NOM-035:", error);

    return Response.json(
      {
        error: "No fue posible generar la interpretación.",
      },
      { status: 500 }
    );
  }
}
