"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Shield, User, Bot, Lock } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Mensaje {
  id: string;
  texto: string;
  tipo: "usuario" | "ia";
  timestamp: Date;
}

export default function BuzonPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: "1",
      texto: "Hola, soy Psyqus AI. Este es un espacio seguro y anónimo donde puedes expresar lo que sientes sobre tu ambiente laboral. ¿Qué te gustaría compartir hoy?",
      tipo: "ia",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [mensajes]);

  const enviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || cargando) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      texto: input,
      tipo: "usuario",
      timestamp: new Date(),
    };

    setMensajes((prev) => [...prev, mensajeUsuario]);
    setInput("");
    setCargando(true);

    // Guardar en Supabase (anónimo)
    try {
      await supabase.from("buzon_mensajes").insert({
        mensaje: input,
        tipo: "desahogo",
        fecha: new Date().toISOString(),
      });
    } catch (error) {
      console.log("Error guardando:", error);
    }

    // Simular respuesta de IA (luego conectamos OpenAI)
    setTimeout(() => {
      const respuestaIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        texto: generarRespuestaIA(input),
        tipo: "ia",
        timestamp: new Date(),
      };
      setMensajes((prev) => [...prev, respuestaIA]);
      setCargando(false);
    }, 1500);
  };

  const generarRespuestaIA = (texto: string): string => {
    const lower = texto.toLowerCase();
    if (lower.includes("estrés") || lower.includes("estres")) {
      return "Entiendo que el estrés laboral puede ser abrumador. Es importante identificar qué situaciones específicas lo activan. ¿Hay algún factor particular en tu ambiente de trabajo que esté contribuyendo a esto?";
    }
    if (lower.includes("jefe") || lower.includes("lider")) {
      return "Las relaciones con la autoridad pueden ser complejas. Tu bienestar es prioritario. ¿Has considerado documentar estas situaciones o hablar con alguien de confianza en RH?";
    }
    if (lower.includes("cansado") || lower.includes("agotado")) {
      return "El agotamiento es una señal importante. El descanso y los límites saludables son fundamentales. ¿Has podido desconectar después del trabajo últimamente?";
    }
    return "Gracias por compartir esto conmigo. Tu experiencia es válida y merece ser escuchada. ¿Hay algo más específico sobre tu situación laboral que te gustaría explorar? Recuerda que también puedes contactar a un profesional de RH si lo consideras necesario.";
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="font-bold">Buzón de Paz</h1>
              <p className="text-xs text-slate-400">Canal anónimo y seguro</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400">Anónimo</span>
          </div>
        </div>
      </header>

      {/* Chat */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-140px)] flex flex-col">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2"
        >
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.tipo === "usuario" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.tipo === "ia" ? "bg-cyan-500/20" : "bg-slate-700"
              }`}>
                {msg.tipo === "ia" ? (
                  <Bot className="w-4 h-4 text-cyan-400" />
                ) : (
                  <User className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.tipo === "ia" 
                  ? "bg-slate-900/50 border border-white/5" 
                  : "bg-cyan-500/10 border border-cyan-500/20"
              }`}>
                <p className="text-sm leading-relaxed">{msg.texto}</p>
                <span className="text-xs text-slate-500 mt-2 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {cargando && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={enviarMensaje} className="relative">
          <div className="flex gap-2 p-2 bg-slate-900/50 border border-white/10 rounded-2xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje anónimo..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={cargando || !input.trim()}
              className="px-4 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
            <Lock className="w-3 h-3" />
            <span>Tus mensajes son anónimos y confidenciales</span>
          </div>
        </form>
      </div>
    </div>
  );
}
