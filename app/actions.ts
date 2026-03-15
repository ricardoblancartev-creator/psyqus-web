"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getUserScores() {
  try {
    const { data, error } = await supabase
      .from('resultados_encuesta')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error al obtener puntajes:", error);
    return null;
  }
}

export async function saveSurveyResults(scores: any) {
  try {
    const { data, error } = await supabase
      .from('resultados_encuesta')
      .insert([scores])
      .select();

    if (error) throw error;
    revalidatePath('/dashboard');
    return { success: true, data };
  } catch (error) {
    console.error("Error al guardar:", error);
    return { success: false, error };
  }
}