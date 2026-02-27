"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function EncuestaPage() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Ejemplo de estado para 3 preguntas iniciales
  const [p1, setP1] = useState(3);
  const [p2, setP2] = useState(3);
  const [p3, setP3] = useState(3);

  const guardar = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMensaje("Error: No hay sesión de usuario");
      setLoading(false);
      return;
    }

    const total = p1 + p2 + p3;
    const nivel = total > 10 ? "Alto" : "Bajo";

    const { error } = await supabase.from('respuestas').insert([
      { user_id: user.id, total, nivel }
    ]);

    if (error) setMensaje("Error al guardar: " + error.message);
    else setMensaje("¡Encuesta guardada con éxito!");
    
    setLoading(false);
  };

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Encuesta Psyqus</h1>
      {/* Aquí irían tus inputs de preguntas */}
      <button 
        onClick={guardar}
        disabled={loading}
        className="bg-blue-600 text-white p-2 rounded"
      >
        {loading ? "Enviando..." : "Guardar Encuesta"}
      </button>
      {mensaje && <p className="mt-4">{mensaje}</p>}
    </div>
  );
}