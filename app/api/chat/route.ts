import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1', // 🔥 FORZADO
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const messages = Array.isArray(body?.messages)
      ? body.messages
      : []

    if (messages.length === 0) {
      return new Response('No messages', { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
    })

    const reply =
      completion.choices?.[0]?.message?.content || ''

    return Response.json({ reply })
  } catch (error) {
    console.error(error)
    return new Response('Error', { status: 500 })
  }
}