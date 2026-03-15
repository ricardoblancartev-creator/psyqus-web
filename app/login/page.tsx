"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="relative min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden">
      {/* 1. EL FONDO DE MALLA (GRID) - La esencia de tu diseño anterior */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
        {/* Luces de neón de fondo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO TIPO PSYQUS */}
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block"
          >
            <h1 className="text-6xl font-black italic text-white tracking-tighter uppercase leading-none">
              PSY<span className="text-cyan-500 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">QUS</span>
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mt-2" />
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-4">
              Inteligencia • Bienestar • Futuro
            </p>
          </motion.div>
        </div>

        {/* CONTENEDOR GLASSMORPHISM */}
        <div className="bg-slate-900/40 border border-white/10 p-1 rounded-[3rem] backdrop-blur-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
          <div className="bg-[#020617]/60 p-8 rounded-[2.8rem] border border-white/5">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="clerk-container"
                >
                  <SignIn 
                    routing="hash" 
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-tighter transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
                        card: "bg-transparent shadow-none",
                        headerTitle: "text-white text-xl font-bold",
                        headerSubtitle: "text-slate-400",
                        socialButtonsBlockButton: "bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors",
                        socialButtonsBlockButtonText: "text-white font-medium",
                        dividerRow: "hidden",
                        formFieldLabel: "text-slate-400 font-bold text-[10px] uppercase tracking-widest",
                        formFieldInput: "bg-white/5 border-white/10 text-white focus:border-cyan-500/50 transition-all",
                        footerActionLink: "text-cyan-500 hover:text-cyan-400 font-bold",
                        identityPreviewText: "text-white",
                        identityPreviewEditButtonIcon: "text-cyan-500"
                      }
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <SignUp 
                    routing="hash"
                    appearance={{
                      elements: {
                        formButtonPrimary: "bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-tighter transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]",
                        card: "bg-transparent shadow-none",
                        headerTitle: "text-white text-xl font-bold",
                        headerSubtitle: "text-slate-400",
                        formFieldLabel: "text-slate-400 font-bold text-[10px] uppercase tracking-widest",
                        formFieldInput: "bg-white/5 border-white/10 text-white",
                        footerActionLink: "text-cyan-500 hover:text-cyan-400 font-bold"
                      }
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* BOTÓN DE CAMBIO */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white transition-all border border-white/5 rounded-full bg-white/5 backdrop-blur-sm"
        >
          {isLogin ? "Crear una nueva cuenta" : "Ya tengo cuenta, ingresar"}
        </motion.button>
      </div>
    </main>
  );
}