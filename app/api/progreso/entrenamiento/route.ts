import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerUsuario,
  respuestaNoAutorizado,
} from "@/lib/auth-servidor";

const ID_VALIDO = /^[a-z0-9_-]{1,60}$/i;

/*
  Progreso del simulador laboral (/entrenamiento).
  El user_id sale de la sesión de Clerk.
*/
export async function GET() {
  try {
    const userId = await obtenerUsuario();

    if (!userId) {
      return respuestaNoAutorizado();
    }

    const { data, error } = await supabaseAdmin
      .from("progreso_entrenamiento")
      .select("track_id, station, completed")
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Error leyendo progreso_entrenamiento:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ progreso: data || [] });
  } catch (error) {
    console.error("GET /api/progreso/entrenamiento:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const userId = await obtenerUsuario();

    if (!userId) {
      return respuestaNoAutorizado();
    }

    const body = await request.json().catch(() => null);

    const trackId = body?.track_id;
    const station = body?.station;
    const completed = body?.completed;

    if (
      typeof trackId !== "string" ||
      !ID_VALIDO.test(trackId) ||
      typeof station !== "number" ||
      !Number.isInteger(station) ||
      station < 1 ||
      station > 100 ||
      typeof completed !== "boolean"
    ) {
      return Response.json(
        { error: "INVALID_DATA" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("progreso_entrenamiento")
      .upsert(
        {
          user_id: userId,
          track_id: trackId,
          station,
          started: true,
          completed,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,track_id",
        }
      );

    if (error) {
      console.error(
        "Error guardando progreso_entrenamiento:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("POST /api/progreso/entrenamiento:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
