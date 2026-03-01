"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BotonExportarPDF } from '../dashboard/components/ReportePDF';

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [status, setStatus] = useState("Esperando test...");

  // EL BOTÓN MÁGICO DE DIAGNÓSTICO
  const probarConexion = async () => {
    setStatus("Probando...");
    try {
      const { data, error, status: httpStatus } = await supabase
        .from('incidencias')
        .select('*')
        .limit(1);

      if (error) {
        setStatus(`ERROR: ${error.message} (Código: ${error.code})`);
      } else {
        setStatus(`¡CONECTADO! Tabla encontrada. Status HTTP: ${httpStatus}`);
        fetchRealData();
      }
    } catch (err: any) {
      setStatus(`ERROR CRÍTICO: ${err.message}`);
    }
  };

  const fetchRealData = async () => {
    const { data, error } = await supabase
      .from('incidencias')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setIncidencias(data);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white">
        <div className="bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-800 text-center">
          <h2 className="mb-6 font-black italic">ACCESO ESPERANZA2026</h2>
          <input 
            type="password" 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-slate-700 p-4 rounded-xl text-cyan-400 mb-4"
            placeholder="Clave"
          />
          <button 
            onClick={() => { if(password.toUpperCase() === "ESPERANZA2026") setIsAuthenticated(true) }}
            className="w-full bg-cyan-500 text-black font-bold py-4 rounded-xl"
          >ENTRAR</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] p-10 text-white">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-black italic">PSYQUS <span className="text-cyan-500">ADMIN</span></h1>
          <div className="flex gap-4">
            <button 
              onClick={probarConexion}
              className="px-4 py-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 rounded-lg text-[10px] font-bold"
            >TEST DE CONEXIÓN</button>
            <BotonExportarPDF />
          </div>
        </header>

        {/* BARRA DE STATUS */}
        <div className="mb-6 p-4 bg-slate-900 border border-slate-800 rounded-xl text-[10px] font-mono">
          <span className="text-slate-500 uppercase mr-2">Sistema:</span>
          <span className={status.includes("ERROR") ? "text-red-500" : "text-green-500"}>{status}</span>
        </div>

        <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
          <h3 className="mb-6 font-bold uppercase tracking-widest text-slate-400">Mensajes del Buzón</h3>
          <div className="space-y-4">
            {incidencias.length > 0 ? incidencias.map((inc, i) => (
              <div key={i} className="p-4 bg-black/40 border border-slate-800 rounded-xl">
                <p className="text-sm italic">"{inc.mensaje}"</p>
                <span className="text-[9px] text-slate-600 uppercase mt-2 block">{new Date(inc.created_at).toLocaleString()}</span>
              </div>
            )) : <p className="text-slate-600 italic">No hay mensajes cargados.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}