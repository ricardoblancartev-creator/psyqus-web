// components/private-ai/usePrivateChat.ts
// Hook de React para manejar todo el estado del chat privado

import { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid'; // npm install nanoid
import type { ChatMessage, PrivateChatState } from '@/types/private-ai';

const SESSION_KEY = 'psyqus_session_token';
const EXPIRES_KEY = 'psyqus_session_expires';

export function usePrivateChat(orgId?: string) {
  const [state, setState] = useState<PrivateChatState>({
    messages: [],
    sessionToken: null,
    isLoading: false,
    isDestroyed: false,
    expiresAt: null,
    error: null,
  });

  const initializingRef = useRef(false);

  // ── Inicializar sesión al montar ─────────────────────────
  useEffect(() => {
    if (initializingRef.current) return;
    initializingRef.current = true;
    initSession();
  }, []);

  const initSession = useCallback(async () => {
    // Recuperar token existente de sessionStorage
    const existingToken = sessionStorage.getItem(SESSION_KEY);
    const existingExpires = sessionStorage.getItem(EXPIRES_KEY);

    // Verificar si el token existente sigue válido
    if (existingToken && existingExpires) {
      const expiresAt = new Date(existingExpires);
      if (expiresAt > new Date()) {
        setState((prev) => ({
          ...prev,
          sessionToken: existingToken,
          expiresAt,
        }));
        return;
      }
    }

    // Crear nueva sesión
    try {
      const res = await fetch('/api/private-ai/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'web', orgId }),
      });

      if (!res.ok) throw new Error('Failed to create session');

      const { sessionToken, expiresAt } = await res.json();

      sessionStorage.setItem(SESSION_KEY, sessionToken);
      sessionStorage.setItem(EXPIRES_KEY, expiresAt);

      setState((prev) => ({
        ...prev,
        sessionToken,
        expiresAt: new Date(expiresAt),
        error: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: 'No se pudo iniciar la sesión privada.',
      }));
    }
  }, [orgId]);

  // ── Enviar mensaje ────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      if (!state.sessionToken || state.isLoading || !content.trim()) return;

      const userMessage: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));

      try {
        const res = await fetch('/api/private-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            sessionToken: state.sessionToken,
          }),
        });

        if (res.status === 429) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Demasiados mensajes. Espera unos minutos.',
          }));
          return;
        }

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const assistantMessage: ChatMessage = {
          id: nanoid(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          suggest_buzon: data.suggest_buzon,
          suggest_crisis_line: data.suggest_crisis_line,
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
          isLoading: false,
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Error de conexión. Por favor intenta de nuevo.',
        }));
      }
    },
    [state.sessionToken, state.isLoading]
  );

  // ── Autodestrucción ───────────────────────────────────────
  const destroySession = useCallback(async () => {
    if (!state.sessionToken) return;

    try {
      await fetch('/api/private-ai/destroy', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionToken: state.sessionToken }),
      });
    } catch {
      // Silent fail — limpiamos local de todas formas
    }

    // Limpiar estado local
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);

    setState({
      messages: [],
      sessionToken: null,
      isLoading: false,
      isDestroyed: true,
      expiresAt: null,
      error: null,
    });
  }, [state.sessionToken]);

  // ── Reiniciar después de destruir ────────────────────────
  const restart = useCallback(async () => {
    setState((prev) => ({ ...prev, isDestroyed: false }));
    initializingRef.current = false;
    await initSession();
  }, [initSession]);

  return {
    ...state,
    sendMessage,
    destroySession,
    restart,
  };
}
