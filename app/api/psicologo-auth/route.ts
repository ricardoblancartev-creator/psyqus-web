import { NextResponse } from "next/server";
import {
  obtenerIp,
  revisarLimite,
  respuestaLimite,
} from "@/lib/limite-uso";

export async function POST(req: Request) {
  // Frena intentos repetidos de adivinar la contraseña.
  const limite = revisarLimite(
    `psicologo-auth:${obtenerIp(req)}`,
    10,
    15 * 60_000
  );

  if (!limite.permitido) {
    return respuestaLimite(limite);
  }

  try {
    const body = await req.json();
    const password = typeof body?.password === "string" ? body.password : "";
    const expected = process.env.PSICOLOGO_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: "Falta configurar PSICOLOGO_PASSWORD en .env.local" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json(
        { ok: false, error: "Acceso denegado" },
        { status: 401 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Solicitud inválida" },
      { status: 400 }
    );
  }
}