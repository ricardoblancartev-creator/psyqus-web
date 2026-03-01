'use client';
// components/private-ai/PrivateAIChat.tsx
// Componente principal del chat privado

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { usePrivateChat } from './usePrivateChat';
import { Shield, Trash2, Send, AlertTriangle, Phone, Inbox, RefreshCw, Lock } from 'lucide-react';

interface Props {
  orgId?: string;
  onOpenBuzon?: () => void; // Callback para abrir el Buzón de Paz existente
}

export function PrivateAIChat({ orgId, onOpenBuzon }: Props) {
  const [input, setInput] = useState('');
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    sessionToken,
    isLoading,
    isDestroyed,
    expiresAt,
    error,
    sendMessage,
    destroySession,
    restart,
  } = usePrivateChat(orgId);

  // ── Countdown timer ───────────────────────────────────────
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
      setTimeLeft(diff);
    };
    update();
    const interval = setInterval(update, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, [expiresAt]);

  // ── Auto-scroll ───────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Focus en input ────────────────────────────────────────
  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTimeLeft = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m} min`;
  };

  // ── Estado: Sesión destruida ──────────────────────────────
  if (isDestroyed) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-white p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
          <Trash2 className="text-slate-400" size={28} />
        </div>
        <h3 className="text-lg font-semibold mb-2">Conversación eliminada</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-xs">
          Todos tus mensajes han sido borrados permanentemente. Nadie tiene acceso a ellos.
        </p>
        <button
          onClick={restart}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} />
          Iniciar nueva conversación
        </button>
      </div>
    );
  }

  // ── Estado: Sin sesión (cargando) ─────────────────────────
  if (!sessionToken) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-950">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Iniciando espacio seguro...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <Shield className="text-teal-400" size={16} />
          </div>
          <div>
            <span className="text-teal-400 font-semibold text-sm tracking-wide">
              MODO PRIVADO ACTIVO
            </span>
            {timeLeft !== null && (
              <span className="text-slate-500 text-xs ml-2">
                · Elimina en {formatTimeLeft(timeLeft)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setShowDestroyConfirm(true)}
          className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-xs transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
        >
          <Trash2 size={13} />
          Borrar ahora
        </button>
      </div>

      {/* ── Confirm destroy modal ───────────────────────────── */}
      {showDestroyConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 mx-4 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="text-red-400" size={18} />
              </div>
              <h3 className="font-semibold">¿Eliminar conversación?</h3>
            </div>
            <p className="text-slate-400 text-sm mb-5">
              Todos los mensajes serán borrados permanentemente ahora mismo. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDestroyConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowDestroyConfirm(false); destroySession(); }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-sm font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mensajes ────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Mensaje de bienvenida */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center mb-4">
              <Lock className="text-white" size={24} />
            </div>
            <h3 className="font-semibold text-white mb-2">Espacio seguro y privado</h3>
            <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
              Esta conversación es completamente anónima. Nadie en tu empresa puede leerla.
              Se elimina automáticamente en 24 horas.
            </p>
            <div className="mt-4 flex flex-col gap-2 w-full max-w-xs">
              {[
                'Siento mucha presión en el trabajo',
                'Tengo conflictos con mi equipo',
                '¿Qué es el Buzón de Paz?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="text-left px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors border border-slate-700 hover:border-teal-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Burbujas de mensajes */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1.5 px-1">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">A</span>
                  </div>
                  <span className="text-slate-500 text-xs">ARIA</span>
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-teal-600 text-white rounded-br-sm'
                    : 'bg-slate-800 text-slate-100 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>

              {/* Botón Buzón de Paz */}
              {msg.suggest_buzon && (
                <button
                  onClick={onOpenBuzon}
                  className="flex items-center gap-2 mt-1 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-colors w-full"
                >
                  <Inbox size={14} />
                  Abrir Buzón de Paz (anónimo y seguro)
                </button>
              )}

              {/* Alerta de crisis */}
              {msg.suggest_crisis_line && (
                <div className="flex items-start gap-2 mt-1 px-3 py-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs w-full">
                  <Phone size={14} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">SAPTEL:</span> 55 5259-8121
                    <br />
                    <span className="text-red-400/80">Atención 24/7 · Gratuito · Confidencial</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Indicador "escribiendo" */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1.5 items-center">
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ──────────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-900">
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe en confianza… (Enter para enviar)"
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-sm border border-slate-700 focus:border-teal-500 outline-none resize-none min-h-[46px] max-h-32 transition-colors disabled:opacity-50 text-white placeholder:text-slate-500"
            style={{ lineHeight: '1.5' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="flex-shrink-0 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed p-3 rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-slate-600 text-xs text-center mt-2">
          Anónimo · Privado · Se elimina en 24h
        </p>
      </div>
    </div>
  );
}
