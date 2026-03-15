"use client";
import React, { useState, useEffect } from 'react';
import { createClerkSupabaseClient } from '@/lib/supabase'; 
import { useSession } from "@clerk/nextjs";
import BotonExportarPDF from '../dashboard/components/GeneradorPDF';
import RadarBienestar from '../dashboard/components/RadarBienestar';
import { motion } from 'framer-motion';

// ... (Manten las interfaces Prospecto e Incidencia igual que las tenías)

export default function AdminDashboard() {
  const { session } = useSession();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [prospectos, setProspectos] = useState<any[]>([]);
  const [radarScores, setRadarScores] = useState<number[]>([0, 0, 0, 0, 0, 0]);

  // FIX: Uso del nuevo cliente
  const supabase = createClerkSupabaseClient(session);

  const fetchData = async () => {
    if (!session) return;
    const { data: p } = await supabase.from('prospectos').select('*');
    const { data: i } = await supabase.from('incidencias').select('*');
    if (p) setProspectos(p);
    if (i) setIncidencias(i);
  };

  useEffect(() => {
    if (isAuthenticated && session) fetchData();
  }, [isAuthenticated, session]);

  if (!isAuthenticated) {
     // ... (Tu código de login de admin aquí)
     return <button onClick={() => setIsAuthenticated(true)}>Login Temporal (Usa tu clave)</button>
  }

  return (
    <div className="p-10 text-white">
      <h1 className="text-4xl font-black italic">PSYQUS ADMIN</h1>
      <RadarBienestar scores={radarScores} />
      {/* Resto de tu tabla de prospectos */}
    </div>
  );
}