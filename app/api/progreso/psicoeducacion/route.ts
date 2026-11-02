import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerUsuario,
  respuestaNoAutorizado,
} from "@/lib/auth-servidor";

const ID_VALIDO = /^[a-z0-9_-]{1,60}$/i;

/*
  Progreso de lecciones (/psicoeducacion).
  El user_id sale de la sesión de Clerk.
*/
export async function GET() {
  try {
    const userId = await obtenerUsuario();

    if (!userId) {
      return respuestaNoAutorizado();
    }

    const { data, error } = await supabaseAdmin
      .from("progreso_psicoeducacion")
      .select("lesson_id, stage, completed, quiz_passed")
      .eq("user_id", userId);

    if (error) {
      console.error(
        "Error leyendo progreso_psicoeducacion:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ progreso: data || [] });
  } catch (error) {
    console.error("GET /api/progreso/psicoeducacion:", error);

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

    const lessonId = body?.lesson_id;
    const stage = body?.stage;
    const completed = body?.completed;
    const quizPassed = body?.quiz_passed;

    if (
      typeof lessonId !== "string" ||
      !ID_VALIDO.test(lessonId) ||
      typeof stage !== "number" ||
      !Number.isInteger(stage) ||
      stage < 1 ||
      stage > 100 ||
      typeof completed !== "boolean" ||
      typeof quizPassed !== "boolean"
    ) {
      return Response.json(
        { error: "INVALID_DATA" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("progreso_psicoeducacion")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          stage,
          completed,
          quiz_passed: quizPassed,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,lesson_id",
        }
      );

    if (error) {
      console.error(
        "Error guardando progreso_psicoeducacion:",
        error
      );

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("POST /api/progreso/psicoeducacion:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
