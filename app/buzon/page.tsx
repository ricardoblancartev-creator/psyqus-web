"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BuzonPage() {
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState("sugerencia");
  const [enviando, setEnviando] = useState(false);
  const router = useRouter();

  const enviarReporte = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('reportes').insert([
      { user_id: user?.id, tipo, mensaje }
    ]);

    if (!error) {
      alert("Tu mensaje ha sido recibido de forma segura.");
      router.push('/dashboard');
    }
    setEnviando(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen bg-gray-50">
      <Link href="/dashboard" className="text-blue-600 mb-6 block">← Regresar</Link>
      
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Buzón de Paz y Retroalimentación</h1>
        <p className="text-gray-500 mb-6 italic text-sm">
          Este espacio es para reportar situaciones de riesgo, solicitar contención emocional o dar sugerencias de mejora.
        </p>

        <form onSubmit={enviarReporte} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">¿De qué trata tu mensaje?</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="sugerencia">Sugerencia de mejora</option>
              <option value="queja">Reportar situación de riesgo / Violencia</option>
              <option value="contencion">Solicito apoyo/contención emocional</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Mensaje</label>
            <textarea 
              required
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full p-3 border rounded-xl bg-gray-50 h-32 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Escribe aquí con total libertad..."
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all"
          >
            {enviando ? "Enviando..." : "Enviar Mensaje Seguro"}
          </button>
        </form>
      </div>
    </div>
  );
}