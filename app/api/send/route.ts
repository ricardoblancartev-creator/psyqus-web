import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Asegúrate de tener esta variable en Vercel
});

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // O gpt-4 si tienes créditos
      messages: [
        {
          role: "system",
          content: "Eres Psyqus AI, un experto en psicología organizacional y la NOM-035-STPS-2018. Tu objetivo es dar consejos breves, profesionales y empáticos sobre bienestar laboral. Mantén el anonimato del usuario siempre."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
    });

    return NextResponse.json({ reply: response.choices[0].message.content });
  } catch (error: any) {
    console.error("OpenAI Error:", error);
    return NextResponse.json({ error: "Error en el cerebro de la IA" }, { status: 500 });
  }
}