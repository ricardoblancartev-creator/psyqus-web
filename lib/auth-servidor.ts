import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";

export type RolProfesional = "admin" | "psicologo";

/*
  Devuelve el userId de la sesión de Clerk o null.
  El userId SIEMPRE sale de aquí, nunca del cuerpo
  de la petición.
*/
export async function obtenerUsuario(): Promise<string | null> {
  const { userId } = await auth();

  return userId || null;
}

/*
  Verifica sesión y rol profesional (admin o psicologo),
  con el mismo criterio que los layouts de los paneles:
  privateMetadata.role en Clerk.
*/
export async function obtenerProfesional(): Promise<{
  userId: string | null;
  rol: RolProfesional | null;
}> {
  const { userId } = await auth();

  if (!userId) {
    return { userId: null, rol: null };
  }

  const user = await currentUser();

  const rol = user?.privateMetadata?.role;

  if (rol === "admin" || rol === "psicologo") {
    return { userId, rol };
  }

  return { userId, rol: null };
}

export function respuestaNoAutorizado() {
  return Response.json(
    { error: "UNAUTHORIZED" },
    { status: 401 }
  );
}

export function respuestaProhibido() {
  return Response.json(
    { error: "FORBIDDEN" },
    { status: 403 }
  );
}
