"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function PrivateAIChat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generar ID de sesión anónimo al entrar
  useEffect(() => {
    setSessionId(Math.random().toString(36).substring(7));
  }, []);

  // Auto-scroll al final del chat
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, sessionId })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: "Lo siento, mi conexión cerebral falló. Intenta de nuevo." }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    if(confirm("¿Seguro? Esto borrará tu historial local para siempre.")) {
      setMessages([]);
    }
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col items-center p-4 lg:p-10 relative overflow-hidden">
      {/* Fondo Neón Suave */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/5 blur-[120px] rounded-full" />
      
      {/* HEADER MINIMALISTA */}
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 z-10">
        <div>
          <h1 className="text-xl font-black italic text-white tracking-tighter uppercase">
            PSYQUS <span className="text-cyan-500">PRIVATE AI</span>
          </h1>
          <p className="text-[9px] font-bold text-slate-500 tracking-[0.3em] uppercase">Estatus: Encriptado & Anónimo</p>
        </div>
        <button onClick={clearChat} className="p-2 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500 transition-all group">
            <span className="text-[10px] font-bold text-red-500 group-hover:text-white px-2">DESTRUIR SESIÓN</span>
        </button>
      </header>

      {/* ZONA DE CHAT */}
      <div className="w-full max-w-2xl flex-1 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 overflow-y-auto mb-6 backdrop-blur-sm custom-scrollbar relative">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
            <p className="text-sm font-light italic">"¿Cómo te sientes hoy? Aquí nadie te juzga, ni guarda tu nombre."</p>
            <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px]">Sin Logs</span>
                <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px]">Sin Cookies</span>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-cyan-600 text-white font-medium rounded-tr-none' 
                : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
               <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* INPUT DE MENSAJE */}
      <form onSubmit={sendMessage} className="w-full max-w-2xl relative z-10">
        <div className="flex gap-2 items-center bg-black/40 border border-slate-700 p-2 rounded-3xl focus-within:border-cyan-500 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-white"
            placeholder="Escribe lo que sientes..."
          />
          <button 
            type="submit" 
            className="bg-cyan-500 p-3 rounded-2xl hover:bg-white transition-all group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black group-hover:scale-110 transition-transform">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <p className="text-[8px] text-center text-slate-600 mt-4 uppercase tracking-widest">
            Privacidad Radical por Psyqus. Tus datos no se almacenan para entrenamiento.
        </p>
      </form>
    </main>
  );
}