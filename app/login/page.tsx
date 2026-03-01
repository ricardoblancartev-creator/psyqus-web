"use client";
import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Luces de fondo neón */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">
            PSYQUS<span className="text-cyan-500">.</span>
          </h1>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] mt-2 font-bold">Acceso de Especialista</p>
        </div>

        <SignIn 
          appearance={{
            variables: {
              colorPrimary: "#22d3ee", // Color cian neón
              colorText: "white",
              colorBackground: "#0f172a", // Fondo pizarra oscuro
              colorInputBackground: "#1e293b",
              colorInputText: "white",
            },
            elements: {
              card: "bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl rounded-[2.5rem]",
              headerTitle: "text-white text-xl font-bold",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "bg-slate-800 border-slate-700 hover:bg-slate-700 text-white",
              formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest transition-all",
              footerActionLink: "text-cyan-400 hover:text-cyan-300",
              dividerLine: "bg-slate-800",
              dividerText: "text-slate-500 text-[10px] font-bold uppercase"
            }
          }}
          routing="path"
          path="/login"
          afterSignInUrl="/dashboard"
        />
      </motion.div>
    </main>
  );
}