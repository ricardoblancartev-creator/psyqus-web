import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import {
  obtenerUsuario,
  respuestaNoAutorizado,
} from "@/lib/auth-servidor";

const MAX_MENSAJE = 2000;

/*
  "Pedir ayuda" del buzón.
  El user_id sale de la sesión de Clerk.
*/
export async function POST(request: Request) {
  try {
    const userId = await obtenerUsuario();

    if (!userId) {
      return respuestaNoAutorizado();
    }

    const body = await request.json().catch(() => null);

    const mensaje =
      typeof body?.mensaje === "string"
        ? body.mensaje.trim().slice(0, MAX_MENSAJE)
        : "";

    if (!mensaje) {
      return Response.json(
        { error: "MENSAJE_REQUERIDO" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("interacciones_psyqus")
      .insert([
        {
          user_id: userId,
          tipo: "buzon",
          mensaje,
          respuesta: null,
          resumen_riesgo: null,
        },
      ]);

    if (error) {
      console.error("Error guardando buzón:", error);

      return Response.json(
        { error: "DATABASE_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("POST /api/buzon:", error);

    return Response.json(
      { error: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
