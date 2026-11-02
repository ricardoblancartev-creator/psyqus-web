import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerProfesional,
  respuestaNoAutorizado,
  respuestaProhibido,
} from "@/lib/auth-servidor";

/*
  Resultados de clima organizacional para
  profesionales (admin o psicologo).

  Ninguna página la consume hoy; se devuelven solo
  campos para análisis por área, sin datos de
  identificación.
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
      .from("resultados_encuestas")
      .select(
        `
          id,
          created_at,
          area,
          puesto,
          puntaje_total,
          riesgo
        `
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error leyendo resultados_encuestas:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json(data || []);
  } catch (error) {
    console.error("GET /api/resultados:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
