"use client";
export const dynamic = 'force-dynamic'; 

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Loader2, Send, Trash2, LogOut, ShieldCheck, Bot, User } from "lucide-react";

export default function PrivateAIChat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Scroll automático al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- FUNCIÓN MAESTRA: RESUMEN IA + GUARDAR EN SUPABASE ---
  const finalizarYGuardarSesion = async () => {
    if (messages.length < 2) {
      alert("La conversación es muy breve para generar un reporte.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Solicitamos a la IA que genere un resumen profesional para el psicólogo
      const resResumen = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `ACTÚA COMO PSICÓLOGO ORGANIZACIONAL. Resume los puntos clave, sentimientos y preocupaciones de esta charla en un párrafo breve y profesional. No menciones nombres. Chat: ${JSON.stringify(messages)}` 
        })
      });
      
      const dataResumen = await resResumen.json();
      const resumenProfesional = dataResumen.reply || "Sesión finalizada sin resumen detallado.";

      // 2. Lógica para detectar si se requiere intervención de RH
      const solicitaRH = messages.some(m => 
        m.content.toLowerCase().includes("rh") || 
        m.content.toLowerCase().includes("recursos humanos") ||
        m.content.toLowerCase().includes("ayuda") ||
        m.content.toLowerCase().includes("denuncia")
      );

      // 3. Insertar datos reales en la tabla 'chats' de Supabase
      const { error } = await supabase
        .from('chats')
        .insert([
          {
            empleado_nombre: "Usuario Anónimo", 
            resumen_ia: resumenProfesional,
            solicita_rh: solicitaRH,
            departamento: "General",
            created_at: new Date()
          }
        ]);

      if (error) throw error;

      // 4. Redirigir al dashboard tras éxito
      router.push("/dashboard");

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al procesar el reporte. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, mi conexión se interrumpió. ¿Podrías repetir eso?" }]);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col items-center p-4 lg:p-10 relative overflow-hidden">
      {/* Efectos visuales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
      
      {/* Header del Chat */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 z-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase flex items-center gap-2">
            PSYQUS <span className="text-cyan-500 underline decoration-cyan-500/30">PRIVATE AI</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
             <ShieldCheck className="w-3 h-3 text-cyan-500/60" />
             <p className="text-[9px] font-bold text-cyan-500/60 tracking-[0.2em] uppercase">Encriptación de Grado Organizacional</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setMessages([])} 
            title="Limpiar pantalla"
            className="p-2 bg-slate-800 border border-slate-700 rounded-xl hover:bg-red-500/10 hover:border-red-500/30 transition-all text-slate-400"
          >
            <Trash2 size={16} />
          </button>
          
          <button 
            onClick={finalizarYGuardarSesion}
            disabled={isSaving || messages.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/40 rounded-xl hover:bg-cyan-500 hover:text-black transition-all text-[10px] font-bold text-cyan-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isSaving ? <Loader2 className="animate-spin w-3 h-3" /> : <><LogOut size={14}/> FINALIZAR SESIÓN</>}
          </button>
        </div>
      </header>

      {/* Contenedor de Mensajes */}
      <div className="w-full max-w-2xl flex-1 bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-6 overflow-y-auto mb-6 backdrop-blur-xl shadow-2xl relative custom-scrollbar flex flex-col">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-10">
            <Bot className="w-12 h-12 mb-4 text-cyan-500" />
            <p className="text-sm italic">"Este es tu espacio seguro. Nada de lo que digas aquí será vinculado a tu identidad. ¿Cómo va tu día en la oficina?"</p>
          </div>
        )}
        
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              key={i} 
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role !== 'user' && <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"><Bot size={14} className="text-cyan-500"/></div>}
              
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-tl-none'
              }`}>
                {msg.content}
              </div>

              {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><User size={14} className="text-slate-400"/></div>}
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Input de Chat */}
      <form onSubmit={sendMessage} className="w-full max-w-2xl relative z-10 group">
        <div className="flex gap-3 bg-slate-900/80 border border-slate-700 p-3 rounded-[2rem] group-focus-within:border-cyan-500 transition-all shadow-2xl backdrop-blur-md">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            disabled={loading || isSaving}
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-white placeholder-slate-500"
            placeholder="Escribe aquí con total libertad..."
          />
          <button 
            type="submit" 
            disabled={loading || !input.trim() || isSaving}
            className="bg-cyan-500 p-4 rounded-2xl hover:bg-white transition-all group disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Send size={20} className="text-black group-hover:scale-110 transition-transform"/>}
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-6 uppercase tracking-[0.3em] font-medium">Psyqus Engine v2.0 • Sin retención de datos personales</p>
      </form>
    </main>
  );
}