import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/* =========================================================
   CLIENTE SUPABASE AUTENTICADO
========================================================= */

async function getSupabaseAuthed() {
  const {
    userId,
    getToken,
  } = await auth();

  if (!userId) {
    return {
      userId: null,
      supabase: null,
    };
  }

  const token =
    await getToken();

  const supabase =
    createClient(
      process.env
        .NEXT_PUBLIC_SUPABASE_URL!,

      process.env
        .NEXT_PUBLIC_SUPABASE_ANON_KEY!,

      {
        accessToken:
          async () =>
            token,
      }
    );

  return {
    userId,
    supabase,
  };
}

const CAMPOS_PULSO =
  "id, semana_inicio, energia, desconexion, apoyo, dificultad";

/*
  La columna "sentido" (dimensión espiritual) se agrega con
  supabase/pulso-sentido.sql. Mientras no exista, el pulso
  sigue funcionando sin ella.
*/
function esColumnaFaltante(error: {
  code?: string;
  message?: string;
}) {
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    /sentido/.test(error.message || "")
  );
}

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: Request
) {
  try {
    const {
      userId,
      supabase,
    } =
      await getSupabaseAuthed();

    if (
      !userId ||
      !supabase
    ) {
      return Response.json(
        {
          error:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const url =
      new URL(
        request.url
      );

    const semana =
      url.searchParams.get(
        "semana"
      );

    if (!semana) {
      return Response.json(
        {
          error:
            "SEMANA_REQUERIDA",
        },
        {
          status: 400,
        }
      );
    }

    const leer = (campos: string) =>
      supabase
        .from(
          "pulsos_semanales"
        )
        .select(campos)
        .eq(
          "user_id",
          userId
        )
        .eq(
          "semana_inicio",
          semana
        )
        .maybeSingle();

    let {
      data,
      error,
    } = await leer(
      `${CAMPOS_PULSO}, sentido`
    );

    // Si la columna "sentido" aún no existe, se lee sin ella.
    if (error && esColumnaFaltante(error)) {
      ({ data, error } = await leer(CAMPOS_PULSO));
    }

    if (error) {
      console.error(
        "Error leyendo pulso:",
        error
      );

      return Response.json(
        {
          error:
            "DATABASE_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      pulso:
        data || null,
    });
  } catch (error) {
    console.error(
      "GET /api/pulso:",
      error
    );

    return Response.json(
      {
        error:
          "INTERNAL_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
========================================================= */

export async function POST(
  request: Request
) {
  try {
    const {
      userId,
      supabase,
    } =
      await getSupabaseAuthed();

    if (
      !userId ||
      !supabase
    ) {
      return Response.json(
        {
          error:
            "UNAUTHORIZED",
        },
        {
          status: 401,
        }
      );
    }

    const body =
      await request.json();

    const {
      semana_inicio,
      energia,
      desconexion,
      apoyo,
      sentido,
      dificultad,
    } = body;

    /* VALIDACIÓN */

    const validScale = (
      value: unknown
    ) =>
      typeof value ===
        "number" &&
      Number.isInteger(
        value
      ) &&
      value >= 1 &&
      value <= 5;

    if (
      typeof semana_inicio !==
        "string" ||
      !validScale(
        energia
      ) ||
      !validScale(
        desconexion
      ) ||
      !validScale(
        apoyo
      )
    ) {
      return Response.json(
        {
          error:
            "INVALID_DATA",
        },
        {
          status: 400,
        }
      );
    }

    const cleanDifficulty =
      typeof dificultad ===
        "string"
        ? dificultad
            .trim()
            .slice(
              0,
              100
            )
        : null;

    /* sentido es opcional para no romper pulsos anteriores */
    if (
      sentido !== undefined &&
      sentido !== null &&
      !validScale(sentido)
    ) {
      return Response.json(
        {
          error:
            "INVALID_DATA",
        },
        {
          status: 400,
        }
      );
    }

    /* UPSERT */

    const fila: Record<string, unknown> = {
      user_id:
        userId,

      semana_inicio,

      energia,

      desconexion,

      apoyo,

      dificultad:
        cleanDifficulty ||
        null,

      updated_at:
        new Date()
          .toISOString(),
    };

    const guardar = (valores: Record<string, unknown>) =>
      supabase
        .from(
          "pulsos_semanales"
        )
        .upsert(valores, {
          onConflict:
            "user_id,semana_inicio",
        })
        .select()
        .single();

    let {
      data,
      error,
    } = await guardar(
      validScale(sentido)
        ? { ...fila, sentido }
        : fila
    );

    // Si la columna "sentido" aún no existe, se guarda sin ella.
    if (
      error &&
      validScale(sentido) &&
      esColumnaFaltante(error)
    ) {
      ({ data, error } = await guardar(fila));
    }

    if (error) {
      console.error(
        "Error guardando pulso:",
        error
      );

      return Response.json(
        {
          error:
            "DATABASE_ERROR",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      pulso: data,
    });
  } catch (error) {
    console.error(
      "POST /api/pulso:",
      error
    );

    return Response.json(
      {
        error:
          "INTERNAL_ERROR",
      },
      {
        status: 500,
      }
    );
  }
}
