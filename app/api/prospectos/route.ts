import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      empresa,
      nombre,
      telefono,
      email,
      rubro,
      empleados,
      mensaje,
    } = body;

    if (!empresa || !nombre || !telefono || !rubro || !empleados) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const to = process.env.PROSPECT_EMAIL;
    const from = process.env.RESEND_FROM || "onboarding@resend.dev";

    if (!process.env.RESEND_API_KEY || !to) {
      return NextResponse.json(
        { error: "Faltan variables de correo" },
        { status: 500 }
      );
    }

    const subject = `Nuevo prospecto Psyqus: ${empresa}`;

    const html = `
      <div style="font-family: Arial, sans-serif; background:#020617; color:#ffffff; padding:24px; border-radius:16px;">
        <h1 style="color:#22d3ee; margin-bottom:8px;">Nuevo prospecto Psyqus</h1>
        <p style="color:#cbd5e1;">Solicitud recibida desde la landing de psyqus.com</p>

        <hr style="border:none; border-top:1px solid #1e293b; margin:20px 0;" />

        <p><strong>Empresa:</strong> ${empresa}</p>
        <p><strong>Contacto:</strong> ${nombre}</p>
        <p><strong>Teléfono / WhatsApp:</strong> ${telefono}</p>
        <p><strong>Correo:</strong> ${email || "No proporcionado"}</p>
        <p><strong>Rubro:</strong> ${rubro}</p>
        <p><strong>Número de empleados:</strong> ${empleados}</p>

        <hr style="border:none; border-top:1px solid #1e293b; margin:20px 0;" />

        <p><strong>Mensaje:</strong></p>
        <p style="color:#cbd5e1;">${mensaje || "Sin mensaje adicional"}</p>

        <div style="margin-top:24px; padding:16px; background:#0f172a; border:1px solid #1e293b; border-radius:12px;">
          <p style="margin:0; color:#22d3ee;"><strong>Siguiente paso sugerido:</strong></p>
          <p style="margin:8px 0 0; color:#cbd5e1;">Contactar por teléfono o WhatsApp para agendar demo o cotización.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
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