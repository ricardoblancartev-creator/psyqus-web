"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <main className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.05),transparent)] pointer-events-none" />

      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            PSYQUS<span className="text-cyan-500">.</span>
          </h1>
          <button 
            onClick={() => setShowRegister(!showRegister)}
            className="mt-4 text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] hover:text-white transition-all underline decoration-cyan-500/30 underline-offset-4"
          >
            {showRegister ? "← Ya tengo cuenta, entrar" : "¿Eres nuevo? Crea tu cuenta aquí →"}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={showRegister ? "signup" : "signin"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {showRegister ? (
              <SignUp routing="hash" afterSignUpUrl="/dashboard" />
            ) : (
              <SignIn routing="hash" afterSignInUrl="/dashboard" />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}