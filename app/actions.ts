"use server";

export async function saveSurveyResults(data: any) {
  console.log("Resultados encuesta:", data);

  // aquí después conectaremos base de datos
  return {
    success: true
  };
}