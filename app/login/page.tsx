"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from "@clerk/nextjs"; // Importamos el componente de SignIn

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      
      {/* Fondo Decorativo: Radial Gradient y Cuadrícula Sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(79,70,229,0.15),transparent)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />

      {/* Contenedor del Formulario con Animación */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        {/* Header del Login */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-white italic tracking-tighter">
            PSYQUS<span className="text-cyan-500">.</span>
          </h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-3 font-bold">Portal de Comunicación Segura</p>
          <p className="mt-4 text-xs text-slate-400 font-medium max-w-xs mx-auto">Bienvenido, Especialista. Tu sesión está cifrada de extremo a extremo.</p>
        </div>

        {/* EL COMPONENTE DE CLERK TOTALMENTE ESTILIZADO */}
        {/* Aquí es donde ocurre la magia: le pasamos temas de CSS */}
        <SignIn 
          appearance={{
            elements: {
              card: "bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl",
              headerTitle: "text-xl font-bold text-white",
              headerSubtitle: "text-sm text-slate-400",
              socialButtonsBlockButton: "border border-slate-700 bg-slate-800 hover:bg-slate-700 rounded-xl py-3 text-sm text-slate-300",
              socialButtonsBlockButtonText: "font-bold",
              socialButtonsBlockButtonArrow: "hidden",
              dividerLine: "bg-slate-700",
              dividerText: "text-[10px] text-slate-500 uppercase",
              formLabel: "text-[10px] font-bold text-slate-400 uppercase",
              formInput: "bg-slate-800/60 border border-slate-700 rounded-xl text-white py-3 px-4",
              formButtonPrimary: "w-full py-4 bg-white text-black font-black rounded-xl hover:bg-cyan-400 transition-all uppercase text-sm tracking-widest",
              footerActionText: "text-slate-500 text-xs",
              footerActionLink: "text-cyan-400 hover:text-cyan-300 font-bold",
              identityPreviewText: "text-white text-sm",
              identityPreviewEditButton: "text-cyan-400",
            }
          }}
          routing="path"
          path="/login"
          afterSignInUrl="/dashboard"
        />

        {/* Firma de la Mtra. Esperanza P. */}
        <div className="mt-12 text-center border-t border-slate-800/50 pt-8">
            <p className="font-bold text-white text-sm uppercase">Mtra. Esperanza P.</p>
            <p className="text-[9px] text-slate-600 tracking-[0.2em] font-medium">Validación Clínico-Digital</p>
        </div>

      </motion.div>
    </main>
  );
}