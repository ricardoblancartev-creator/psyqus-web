import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { tipo, mensaje, emailUsuario } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Psyqus Alerta <onboarding@resend.dev>',
      to: ['tu-correo-psicologo@gmail.com'], // <-- CORREO DONDE LLEGAN LOS REPORTES
      subject: `🚨 NUEVA INCIDENCIA: ${tipo.toUpperCase()}`,
      html: `
        <h1>Alerta de Bienestar Psyqus</h1>
        <p><strong>Tipo:</strong> ${tipo}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
        <p><strong>Enviado por:</strong> ${emailUsuario}</p>
        <hr />
        <p>Revisa los detalles completos en el panel de administrador.</p>
      `,
    });

    if (error) return NextResponse.json({ error });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error });
  }
}