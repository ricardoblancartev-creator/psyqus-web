"use client";
import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Fondo Cyberpunk real */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.1),transparent)] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -top-48 -left-48" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            PSYQUS<span className="text-cyan-500">.</span>
          </h1>
          <p className="text-cyan-500/50 text-[10px] uppercase tracking-[0.5em] mt-3 font-bold">Unidad de Acceso Cifrado</p>
        </div>

        <SignIn 
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-slate-900/40 border border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-[2.5rem] overflow-hidden",
              headerTitle: "text-white text-2xl font-black tracking-tight",
              headerSubtitle: "text-slate-400 text-sm",
              socialButtonsBlockButton: "bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-white rounded-2xl transition-all",
              formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)]",
              formLabel: "text-slate-400 font-bold uppercase text-[10px] tracking-widest",
              formInput: "bg-slate-800/50 border-slate-700 text-white rounded-xl focus:border-cyan-500 transition-all",
              footerActionLink: "text-cyan-400 hover:text-cyan-300 font-bold",
              dividerLine: "bg-slate-800",
              dividerText: "text-slate-500 font-mono text-[10px]"
            }
          }}
        />
      </motion.div>
    </main>
  );
}