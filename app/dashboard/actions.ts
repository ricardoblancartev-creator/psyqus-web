"use server";

import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getUserScores() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("resultados_encuesta")
    .select("modulo_1_score, modulo_2_score, modulo_3_score, modulo_4_score, modulo_5_score, modulo_6_score")
    .eq("usuario_id", userId)
    .single();

  if (error || !data) return [0, 0, 0, 0, 0, 0];

  return [
    data.modulo_1_score,
    data.modulo_2_score,
    data.modulo_3_score,
    data.modulo_4_score,
    data.modulo_5_score,
    data.modulo_6_score
  ];
}

export async function saveSurveyResults(scores: number[]) {
  const { userId } = await auth();
  if (!userId) throw new Error("No autorizado");

  const supabase = getSupabaseAdmin();

  const { error } = await supabase
    .from("resultados_encuesta")
    .upsert({
      usuario_id: userId,
      modulo_1_score: scores[0],
      modulo_2_score: scores[1],
      modulo_3_score: scores[2],
      modulo_4_score: scores[3],
      modulo_5_score: scores[4],
      modulo_6_score: scores[5],
      updated_at: new Date().toISOString(),
    }, { onConflict: 'usuario_id' });

  if (error) {
    console.error("Error Supabase:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  return { success: true };
}