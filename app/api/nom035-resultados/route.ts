import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerProfesional,
  respuestaNoAutorizado,
  respuestaProhibido,
} from "@/lib/auth-servidor";

/*
  Resultados individuales NOM-035 para el panel
  profesional. Solo admin o psicologo.

  Campos limitados a lo que usa
  app/nom035-resultados/page.tsx (sin email).
*/
export async function GET() {
  try {
    const { userId, rol } = await obtenerProfesional();

    if (!userId) {
      return respuestaNoAutorizado();
    }

    if (!rol) {
      return respuestaProhibido();
    }

    const { data, error } = await supabaseAdmin
      .from("nom035_evaluaciones")
      .select(
        `
          id,
          created_at,
          user_id,
          nombre,
          apellido,
          area,
          puesto,
          tipo_cuestionario,
          nombre_cuestionario,
          respuestas,
          puntaje_total
        `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error leyendo nom035_evaluaciones:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("GET /api/nom035-resultados:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
