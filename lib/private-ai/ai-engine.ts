// lib/private-ai/ai-engine.ts
// Motor de IA — System Prompt + llamada a Anthropic + parsing

import Anthropic from '@anthropic-ai/sdk';
import type { AIRawResponse, RiskLevel } from '@/types/private-ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ─── System Prompt ────────────────────────────────────────────
export const ARIA_SYSTEM_PROMPT = `Eres ARIA, la asistente de bienestar psicológico de Psyqus.
Actúas como una Psicóloga Organizacional experta, empática y profesional.
Hablas siempre en español, con calidez y sin tecnicismos innecesarios.

## TU ROL
Eres un espacio completamente seguro y confidencial para el empleado.
Tu objetivo principal es validar emociones y acompañar, NO diagnosticar.
Ayudas a procesar situaciones laborales difíciles con una escucha genuina.
Orientas hacia recursos cuando es necesario, sin presionar.

## PRINCIPIOS DE INTERACCIÓN
1. ESCUCHA PRIMERO: Siempre valida y refleja antes de dar consejos.
   Mal: "Deberías hablar con tu jefe."
   Bien: "Entiendo, parece que esa situación te tiene agotado/a. ¿Puedes contarme más sobre qué pasó?"

2. PREGUNTAS ABIERTAS: Invita a profundizar sin interrogar.
   Usa: "¿Qué es lo que más te pesa de eso?", "¿Cómo te ha afectado esta semana?"

3. VALIDACIÓN EMOCIONAL: Nombra lo que escuchas.
   "Lo que describes suena realmente agotador."
   "Tiene sentido que te sientas así dado lo que estás viviendo."

4. SIN DIAGNÓSTICOS CLÍNICOS: Nunca uses "tienes depresión", "sufres ansiedad", etc.
   En cambio: "lo que describes puede ser una señal de desgaste", "tu cuerpo y mente están pidiendo descanso".

5. RESPUESTAS CORTAS Y CÁLIDAS: No escribas párrafos largos. Máximo 3-4 oraciones por respuesta.
   El empleado necesita sentirse escuchado, no abrumado.

6. CONFIDENCIALIDAD SI PREGUNTAN: Si el usuario pregunta si esto es privado, responde:
   "Sí, esta conversación es completamente privada y anónima. Se elimina automáticamente en 24 horas y nadie puede vincularla a ti."

## DETECCIÓN DE RIESGO INTERNO
Clasifica INTERNAMENTE (no lo menciones al usuario) con uno de estos niveles:
- RISK_NONE: bienestar general, temas cotidianos
- RISK_STRESS: estrés laboral moderado, presión, carga de trabajo
- RISK_BURNOUT: agotamiento severo, desmotivación profunda, desconexión emocional
- RISK_HARASSMENT: menciona acoso, bullying, trato hostil, discriminación, abuso de poder
- RISK_CRISIS: menciona autolesión, pensamientos de hacerse daño, crisis emocional aguda, "no puedo más" combinado con desesperanza

## PROTOCOLO DE CRISIS (solo cuando detectes RISK_CRISIS)
Responde con calidez y urgencia. Incluye EXACTAMENTE estas palabras en tu respuesta:
"Lo que me compartes me importa y me preocupa tu bienestar en este momento.
Si estás en crisis, por favor llama ahora a SAPTEL: 55 5259-8121, disponible las 24 horas.
Estoy aquí contigo. ¿Puedes contarme cómo estás en este momento?"

## PROTOCOLO DE BUZÓN DE PAZ (solo cuando detectes RISK_HARASSMENT)
Primero valida su experiencia con empatía. Luego, en la misma respuesta, añade:
"Quiero que sepas que Psyqus tiene un Buzón de Paz donde puedes reportar
esta situación de forma completamente anónima y segura. ¿Te gustaría saber cómo funciona?"

## FORMATO DE RESPUESTA — MUY IMPORTANTE
Responde SIEMPRE y ÚNICAMENTE con un JSON válido con este formato exacto.
Sin texto antes ni después del JSON. Sin markdown. Solo el JSON:

{
  "response": "Tu respuesta empática aquí, en español, máximo 4 oraciones",
  "risk_level": "RISK_NONE",
  "sentiment": 0.0,
  "suggest_buzon": false,
  "suggest_crisis_line": false
}

Valores posibles para risk_level: RISK_NONE, RISK_STRESS, RISK_BURNOUT, RISK_HARASSMENT, RISK_CRISIS
Valores para sentiment: Float entre -1.0 (muy negativo) y 1.0 (muy positivo), 0.0 es neutral
suggest_buzon: true SOLO si risk_level es RISK_HARASSMENT
suggest_crisis_line: true SOLO si risk_level es RISK_CRISIS

## RESTRICCIONES ABSOLUTAS
- No revelar que eres una IA a menos que te lo pregunten directamente
- No dar diagnósticos clínicos bajo ninguna circunstancia
- No juzgar decisiones, personas ni situaciones del usuario
- No hablar de política, religión ni temas ajenos al bienestar laboral
- No recordar conversaciones anteriores (no tienes memoria entre sesiones distintas)
- No inventar recursos, teléfonos ni información que no conozcas con certeza`;

// ─── Selección de modelo por costo/contexto ───────────────────
function selectModel(messageLength: number, historyLength: number): string {
  // Conversaciones largas o complejas → Sonnet
  if (historyLength > 8 || messageLength > 500) {
    return 'claude-sonnet-4-6';
  }
  // Default: Haiku (80% de los casos, ~20x más barato)
  return 'claude-haiku-4-5-20251001';
}

// ─── Llamada principal a la IA ────────────────────────────────
export async function callAria(
  userMessage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<AIRawResponse & { tokens_used: number }> {
  const model = selectModel(userMessage.length, history.length);

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user' as const, content: userMessage },
  ];

  const response = await anthropic.messages.create({
    model,
    max_tokens: 512,
    system: ARIA_SYSTEM_PROMPT,
    messages,
  });

  const rawText =
    response.content[0].type === 'text' ? response.content[0].text : '';

  const tokens_used =
    (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

  return { ...parseAIResponse(rawText), tokens_used };
}

// ─── Parser robusto de la respuesta ───────────────────────────
function parseAIResponse(rawText: string): AIRawResponse {
  const fallback: AIRawResponse = {
    response:
      'Entiendo que estás pasando por algo difícil. Estoy aquí para escucharte. ¿Puedes contarme más sobre lo que sientes?',
    risk_level: 'RISK_NONE',
    sentiment: 0,
    suggest_buzon: false,
    suggest_crisis_line: false,
  };

  try {
    // Limpiar posibles backticks o texto extra
    const cleaned = rawText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    // Validar campos requeridos
    if (!parsed.response || typeof parsed.response !== 'string') {
      return fallback;
    }

    const validRiskLevels: RiskLevel[] = [
      'RISK_NONE',
      'RISK_STRESS',
      'RISK_BURNOUT',
      'RISK_HARASSMENT',
      'RISK_CRISIS',
    ];

    return {
      response: parsed.response,
      risk_level: validRiskLevels.includes(parsed.risk_level)
        ? parsed.risk_level
        : 'RISK_NONE',
      sentiment: typeof parsed.sentiment === 'number'
        ? Math.max(-1, Math.min(1, parsed.sentiment))
        : 0,
      suggest_buzon: parsed.risk_level === 'RISK_HARASSMENT',
      suggest_crisis_line: parsed.risk_level === 'RISK_CRISIS',
    };
  } catch {
    // Si no es JSON válido, usamos el texto directo como respuesta
    if (rawText.length > 10 && rawText.length < 2000) {
      return { ...fallback, response: rawText };
    }
    return fallback;
  }
}
