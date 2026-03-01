import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from '@supabase/supabase-js';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: Request) {
  try {
    const { message, sessionId } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Eres Psyqus AI, un psicólogo organizacional experto en apoyo emocional. 
    Tu tono es empático, breve y profesional. No das diagnósticos médicos. 
    Ayuda al usuario con este problema: ${message}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Guardar en la tabla que ya verificamos que existe
    await supabase.from('incidencias').insert([{ 
      mensaje: `AI Chat (${sessionId}): ${message}`,
      area: 'PSICOLOGO_VIRTUAL' 
    }]);

    return Response.json({ reply: text });
  } catch (error) {
    return Response.json({ error: "Error en el cerebro de IA" }, { status: 500 });
  }
}