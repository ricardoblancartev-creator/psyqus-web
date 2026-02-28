export const BANCO_PREGUNTAS = [
  { id: 1, texto: "¿Sientes que el tiempo te alcanza para tus tareas?", categoria: "Estrés" },
  { id: 2, texto: "¿Has tenido problemas para dormir por pensar en el trabajo?", categoria: "Burnout" },
  { id: 3, texto: "¿Sientes que tus compañeros valoran tu esfuerzo?", categoria: "Social" },
  { id: 4, texto: "¿Te sientes motivado al iniciar tu jornada?", categoria: "Ánimo" },
  { id: 5, texto: "¿Has sentido tensión física (cuello, espalda) hoy?", categoria: "Físico" },
  // ... aquí puedes meter 100 si quieres
];

export const OBTENER_DIAGNOSTICO = (score: number) => {
  if (score > 80) return "Tu equilibrio emocional es ejemplar. Sigue cultivando tus hábitos de resiliencia.";
  if (score > 50) return "Nivel de estrés moderado. Se recomienda practicar los ejercicios de la esfera de calma.";
  return "Alerta de Burnout detectada. Es vital tomar un respiro y contactar al Buzón de Paz.";
};

export const FIRMA_MTRA = {
  nombre: "Mtra. Esperanza P.",
  cedula: "CED. PROF. XXXXXXX", // Pon la real aquí
  puesto: "Directora de Salud Mental Psyqus"
};