"use client";
export const dynamic = 'force-dynamic'; 

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function PrivateAIChat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      setMessages(prev => [...prev, { role: "assistant", content: "Sistema temporalmente fuera de línea. Intenta de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-slate-300 font-sans flex flex-col items-center p-4 lg:p-10 relative overflow-hidden">
      {/* Luces de ambiente */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      
      <header className="w-full max-w-2xl flex justify-between items-center mb-8 z-10 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black italic text-white tracking-tighter uppercase">
            PSYQUS <span className="text-cyan-500">PRIVATE AI</span>
          </h1>
          <p className="text-[10px] font-bold text-cyan-500/60 tracking-[0.3em] uppercase">Security Level: Ghost Mode</p>
        </div>
        <button onClick={() => setMessages([])} className="px-4 py-2 bg-red-500/5 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all text-[10px] font-bold text-red-500">
          WIPE SESSION
        </button>
      </header>

      <div className="w-full max-w-2xl flex-1 bg-slate-900/20 border border-slate-800/50 rounded-[2.5rem] p-6 overflow-y-auto mb-6 backdrop-blur-xl shadow-2xl relative custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <p className="text-sm italic mb-4">"Habla libremente. Tu identidad está protegida por encriptación de grado organizacional."</p>
            <div className="h-[1px] w-12 bg-slate-700"></div>
          </div>
        )}
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800/50 text-slate-200 border border-slate-700/50 rounded-tl-none'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          <div ref={scrollRef} />
        </div>
      </div>

      <form onSubmit={sendMessage} className="w-full max-w-2xl relative z-10">
        <div className="flex gap-3 bg-slate-900/80 border border-slate-700 p-3 rounded-[2rem] focus-within:border-cyan-500 transition-all shadow-2xl">
          <input 
            type="text" value={input} onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-white"
            placeholder="Escribe un mensaje anónimo..."
          />
          <button type="submit" className="bg-cyan-500 p-4 rounded-2xl hover:bg-white transition-all group">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black group-hover:scale-110"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-6 uppercase tracking-widest font-medium">Psyqus Engine v2.0 • No data retention policy</p>
      </form>
    </main>
  );
}