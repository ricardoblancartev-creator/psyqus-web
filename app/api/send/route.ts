import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // MOVER EL NEW RESEND AQUÍ ADENTRO 👇
  const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

  try {
    const { tipo, mensaje, emailUsuario } = await req.json();

    const { data, error } = await resend.emails.send({
      from: 'Psyqus <onboarding@resend.dev>',
      to: ['tu-correo-psicologo@gmail.com'], 
      subject: `🚨 ALERTA: ${tipo}`,
      html: `<p><strong>Mensaje:</strong> ${mensaje}</p>`,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}