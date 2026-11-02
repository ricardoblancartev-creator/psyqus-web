import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  obtenerIp,
  revisarLimites,
  respuestaLimite,
} from "@/lib/limite-uso";

/*
  Formulario público de la landing.
  Todo texto del usuario se escapa antes de meterlo
  al HTML del correo y se limita su longitud.
*/

function escaparHtml(valor: string) {
  return valor
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function limpiar(valor: unknown, maximo: number) {
  if (typeof valor !== "string" && typeof valor !== "number") {
    return "";
  }

  return String(valor)
    // Quita caracteres de control (incluye saltos de
    // línea en campos de una sola línea más abajo).
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maximo);
}

function unaLinea(valor: string) {
  return valor.replace(/[\r\n]+/g, " ");
}

const EMAIL_VALIDO = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

export async function POST(req: Request) {
  const limite = revisarLimites(`prospectos:${obtenerIp(req)}`, [
    { maximo: 5, ventanaMs: 60 * 60_000 },
    { maximo: 20, ventanaMs: 24 * 60 * 60_000 },
  ]);

  if (!limite.permitido) {
    return respuestaLimite(limite);
  }

  try {
    const body = await req.json();

    const empresa = unaLinea(limpiar(body?.empresa, 120));
    const nombre = unaLinea(limpiar(body?.nombre, 120));
    const telefono = unaLinea(limpiar(body?.telefono, 40));
    const emailBruto = unaLinea(limpiar(body?.email, 160));
    const rubro = unaLinea(limpiar(body?.rubro, 80));
    const empleados = unaLinea(limpiar(body?.empleados, 40));
    const mensaje = limpiar(body?.mensaje, 2000);

    const email = EMAIL_VALIDO.test(emailBruto) ? emailBruto : "";

    if (!empresa || !nombre || !telefono || !rubro || !empleados) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const to = process.env.PROSPECT_EMAIL;
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";

    if (!resendApiKey || !to) {
      return NextResponse.json(
        { error: "Faltan variables de correo" },
        { status: 500 }
      );
    }

    const resend = new Resend(resendApiKey);

    const e = {
      empresa: escaparHtml(empresa),
      nombre: escaparHtml(nombre),
      telefono: escaparHtml(telefono),
      email: email ? escaparHtml(email) : "No proporcionado",
      rubro: escaparHtml(rubro),
      empleados: escaparHtml(empleados),
      mensaje: mensaje
        ? escaparHtml(mensaje).replace(/\r?\n/g, "<br />")
        : "Sin mensaje adicional",
    };

    const html = `
      <div style="font-family: Arial, sans-serif; background:#020617; color:#ffffff; padding:24px; border-radius:16px;">
        <h1 style="color:#22d3ee;">Nuevo prospecto Psyqus</h1>
        <p style="color:#cbd5e1;">Solicitud recibida desde psyqus.com</p>

        <p><strong>Empresa:</strong> ${e.empresa}</p>
        <p><strong>Contacto:</strong> ${e.nombre}</p>
        <p><strong>Teléfono / WhatsApp:</strong> ${e.telefono}</p>
        <p><strong>Correo:</strong> ${e.email}</p>
        <p><strong>Rubro:</strong> ${e.rubro}</p>
        <p><strong>Número de empleados:</strong> ${e.empleados}</p>

        <hr style="border:none; border-top:1px solid #1e293b; margin:20px 0;" />

        <p><strong>Mensaje:</strong></p>
        <p style="color:#cbd5e1;">${e.mensaje}</p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Nuevo prospecto Psyqus: ${empresa}`,
      html,
      replyTo: email || undefined,
    });

    if (error) {
      console.error("Error Resend:", error);

      return NextResponse.json(
        { error: "No se pudo enviar el correo" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    console.error("Error prospectos:", error);

    return NextResponse.json(
      { error: "Error al enviar solicitud" },
      { status: 500 }
    );
  }
}
