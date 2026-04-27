import { NextResponse } from "next/server";

export async function POST(req: Request) {
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