import "server-only";

/*
  Límite de uso en memoria (ventana deslizante).

  LIMITACIÓN: en Vercel cada instancia de la función
  tiene su propia memoria y se reinicia sin aviso, así
  que el límite es aproximado (por instancia). Frena
  abusos casuales y bucles accidentales; para un límite
  global hace falta un almacén compartido
  (p. ej. Upstash Redis o una tabla en Supabase).
*/

type Registro = number[];

const registros = new Map<string, Registro>();

const MAX_CLAVES = 10_000;

export type ResultadoLimite = {
  permitido: boolean;
  reintentarEnSegundos: number;
};

export function revisarLimite(
  clave: string,
  maximo: number,
  ventanaMs: number
): ResultadoLimite {
  const ahora = Date.now();
  const desde = ahora - ventanaMs;

  const previos = (registros.get(clave) || []).filter(
    (momento) => momento > desde
  );

  if (previos.length >= maximo) {
    registros.set(clave, previos);

    return {
      permitido: false,
      reintentarEnSegundos: Math.max(
        1,
        Math.ceil((previos[0] + ventanaMs - ahora) / 1000)
      ),
    };
  }

  previos.push(ahora);
  registros.set(clave, previos);

  // Evita que el mapa crezca sin control.
  if (registros.size > MAX_CLAVES) {
    for (const [otraClave, momentos] of registros) {
      if (!momentos.some((momento) => momento > desde)) {
        registros.delete(otraClave);
      }
    }
  }

  return { permitido: true, reintentarEnSegundos: 0 };
}

/*
  Aplica varios límites a la vez (p. ej. por minuto y
  por día). Si alguno se rebasa, no se consume cupo
  en los siguientes.
*/
export function revisarLimites(
  clave: string,
  limites: { maximo: number; ventanaMs: number }[]
): ResultadoLimite {
  for (const { maximo, ventanaMs } of limites) {
    const resultado = revisarLimite(
      `${clave}:${ventanaMs}`,
      maximo,
      ventanaMs
    );

    if (!resultado.permitido) {
      return resultado;
    }
  }

  return { permitido: true, reintentarEnSegundos: 0 };
}

export function respuestaLimite(resultado: ResultadoLimite) {
  return Response.json(
    { error: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "Retry-After": String(resultado.reintentarEnSegundos),
      },
    }
  );
}

/*
  IP del cliente detrás del proxy de Vercel.
*/
export function obtenerIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "desconocida";
}
