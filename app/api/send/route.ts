import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "system",
          content:
            "Eres Psyqus AI, experto en psicología organizacional y NOM-035."
        },
        {
          role: "user",
          content: message
        }
      ]
    })

    const reply = response.output_text || "Sin respuesta"

    return NextResponse.json({ reply })

  } catch (error: any) {
    console.error("🔥 OPENAI ERROR:", error)

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}