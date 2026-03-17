"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function FormularioCaptura({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const { error } = await supabase.from('prospectos').insert([{
      nombre: formData.get('nombre'),
      email: formData.get('email'),
      empresa: formData.get('empresa'),
      empleados: formData.get('empleados'),
      created_at: new Date()
    }]);

    setLoading(false);
    if (!error) setEnviado(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] max-w-md w-full relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white">✕</button>
            
            {!enviado ? (
              <>
                <h3 className="text-2xl font-black italic text-white mb-2 uppercase tracking-tighter">Solicitar Demo <span className="text-cyan-500">VIP</span></h3>
                <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">Diagnóstico NOM-035 para tu empresa</p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input name="nombre" placeholder="TU NOMBRE" required className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:border-cyan-500 outline-none" />
                  <input name="email" type="email" placeholder="CORREO CORPORATIVO" required className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:border-cyan-500 outline-none" />
                  <input name="empresa" placeholder="NOMBRE DE LA EMPRESA" required className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-cyan-400 focus:border-cyan-500 outline-none" />
                  <select name="empleados" className="w-full bg-black/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-400 outline-none">
                    <option>1-50 Empleados</option>
                    <option>51-200 Empleados</option>
                    <option>201+ Empleados</option>
                  </select>
                  <button 
                    disabled={loading}
                    className="w-full bg-cyan-500 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-xs tracking-widest mt-4"
                  >
                    {loading ? 'Procesando...' : 'Enviar Solicitud'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10">
                <span className="text-5xl mb-4 block">🚀</span>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">¡Recibido, Socio!</h3>
                <p className="text-slate-400 text-sm mt-4">La Mtra. Esperanza se pondrá en contacto contigo en menos de 24 horas.</p>
                <button onClick={onClose} className="mt-8 text-cyan-500 font-bold text-xs uppercase tracking-widest underline">Cerrar</button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}