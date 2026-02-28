"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Tu conexión real
import Link from 'next/link';

export default function AdminDashboard() {
  const [mensajesReales, setMensajesReales] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  // EFECTO PARA TRAER DATOS REALES
  useEffect(() => {
    const fetchMensajes = async () => {
      const { data, error } = await supabase
        .from('buzon_mensajes') // La tabla que creamos
        .select('*')
        .order('fecha', { ascending: false });

      if (!error) setMensajesReales(data);
      setCargando(false);
    };

    fetchMensajes();
  }, []);

  // ... (Aquí va el resto de tu diseño del dashboard)

  return (
    // ... dentro de la sección del Buzón de Paz:
    <div className="space-y-4">
      {cargando ? (
        <p className="text-slate-500 animate-pulse text-xs">Conectando con la base de datos...</p>
      ) : mensajesReales.length > 0 ? (
        mensajesReales.map((msg) => (
          <div key={msg.id} className="p-5 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-200 italic mb-1">"{msg.contenido}"</p>
              <span className="text-[9px] font-mono text-slate-500 uppercase">
                {new Date(msg.fecha).toLocaleDateString()}
              </span>
            </div>
            <span className="text-[8px] font-bold px-3 py-1 rounded-full bg-slate-700 text-slate-400">
              REAL
            </span>
          </div>
        ))
      ) : (
        <p className="text-slate-500 text-xs italic">Aún no hay mensajes reales en la base de datos.</p>
      )}
    </div>
  );
}