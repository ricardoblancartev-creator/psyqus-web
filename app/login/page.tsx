"use client";
import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Fondo Cyberpunk con degradados sutiles */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.08),transparent)] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -top-48 -left-48" />
      <div className="absolute w-[400px] h-[400px] bg-cyan-500/5 blur-[100px] rounded-full -bottom-24 -right-24" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        {/* Branding Superior */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            PSYQUS<span className="text-cyan-500">.</span>
          </h1>
          <p className="text-cyan-500/50 text-[10px] uppercase tracking-[0.6em] mt-3 font-bold">
            Protocolo de Acceso Inteligente
          </p>
        </div>

        {/* Componente SignIn con esteroides y redirección corregida */}
        <SignIn 
          routing="path" 
          path="/login" 
          // ESTAS DOS LÍNEAS MATAN EL ERROR 404
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full shadow-[0_0_60px_rgba(0,0,0,0.8)]",
              card: "bg-slate-900/60 border border-slate-800 backdrop-blur-3xl rounded-[2.5rem] overflow-hidden p-2",
              headerTitle: "text-white text-2xl font-black tracking-tight",
              headerSubtitle: "text-slate-400 text-sm font-medium",
              socialButtonsBlockButton: "bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/60 text-white rounded-2xl transition-all py-3",
              socialButtonsBlockButtonText: "font-bold text-xs tracking-wide",
              formButtonPrimary: "bg-cyan-500 hover:bg-white text-black font-black uppercase tracking-[0.2em] py-4 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all active:scale-95",
              formLabel: "text-slate-500 font-bold uppercase text-[9px] tracking-widest ml-1",
              formInput: "bg-slate-800/40 border-slate-700 text-white rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all py-3",
              footerActionLink: "text-cyan-400 hover:text-cyan-300 font-bold transition-colors",
              dividerLine: "bg-slate-800",
              dividerText: "text-slate-600 font-mono text-[9px] uppercase tracking-tighter",
              identityPreviewText: "text-white font-medium",
              formResendCodeLink: "text-cyan-400",
              otpCodeFieldInput: "border-slate-700 bg-slate-800/50 text-cyan-400 font-bold",
            }
          }}
        />

        {/* Footer Legal de la App */}
        <div className="mt-12 text-center opacity-40">
           <div className="flex justify-center gap-4 mb-2">
              <div className="h-[1px] w-8 bg-slate-700 self-center"></div>
              <p className="text-[8px] text-slate-500 uppercase font-mono tracking-widest">Encriptación AES-256</p>
              <div className="h-[1px] w-8 bg-slate-700 self-center"></div>
           </div>
        </div>
      </motion.div>
    </main>
  );
}