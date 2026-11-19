import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerProfesional,
  respuestaNoAutorizado,
  respuestaProhibido,
} from "@/lib/auth-servidor";
import {
  empresaDeEvaluacion,
  obtenerEmpresaNom035,
} from "@/lib/nom035-empresas";

/*
  Resultados individuales NOM-035 para el panel
  profesional. Solo admin o psicologo.

  Campos limitados a lo que usa
  app/nom035-resultados/ResultadosNom035.tsx (sin email).

  ?empresa=pocs|3p filtra por empresa
  (ver lib/nom035-empresas.ts). Sin parámetro
  devuelve todo, como antes.
*/
export async function GET(request: Request) {
  try {
    const empresaParam = new URL(request.url).searchParams.get(
      "empresa"
    );

    const empresa = empresaParam
      ? obtenerEmpresaNom035(empresaParam)
      : null;

    if (empresaParam && !empresa) {
      return Response.json(
        { error: "EMPRESA_INVALIDA" },
        { status: 400 }
      );
    }

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

    const filas = (data || []).filter(
      (fila) =>
        !empresa ||
        empresaDeEvaluacion(fila.user_id) === empresa.id
    );

    return Response.json(filas);
  } catch (error) {
    console.error("GET /api/nom035-resultados:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
