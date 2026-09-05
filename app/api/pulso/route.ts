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

    const {
      data,
      error,
    } = await supabase
      .from(
        "pulsos_semanales"
      )
      .select(
        `
          id,
          semana_inicio,
          energia,
          desconexion,
          apoyo,
          dificultad
        `
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "semana_inicio",
        semana
      )
      .maybeSingle();

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

    /* UPSERT */

    const {
      data,
      error,
    } = await supabase
      .from(
        "pulsos_semanales"
      )
      .upsert(
        {
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
        },
        {
          onConflict:
            "user_id,semana_inicio",
        }
      )
      .select()
      .single();

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
