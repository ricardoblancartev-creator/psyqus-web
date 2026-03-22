"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ModeloBPSE() {
  const [active, setActive] = useState<string | null>(null);

  const data = {
    bio: {
      title: "Biológico",
      text: "Cuerpo, energía, sueño y nutrición. Equilibrio físico para el bienestar integral.",
      color: "bg-emerald-500"
    },
    psico: {
      title: "Psicológico",
      text: "Pensamientos, emociones y resiliencia. Salud mental y gestión emocional.",
      color: "bg-purple-500"
    },
    social: {
      title: "Social",
      text: "Relaciones, apoyo y cultura laboral. Conexiones que fortalecen.",
      color: "bg-blue-500"
    },
    espiritual: {
      title: "Espiritual",
      text: "Sentido de vida, valores y propósito. Trascendencia y significado.",
      color: "bg-amber-500"
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text">
        Modelo Bio-Psico-Social-Espiritual
      </h2>

      <div className="relative w-80 h-80">
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => setActive("bio")}
          className={`absolute left-0 top-32 w-16 h-16 rounded-full cursor-pointer shadow-lg ${data.bio.color} hover:shadow-emerald-500/50 transition-all`}
        />
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => setActive("psico")}
          className={`absolute left-32 bottom-0 w-16 h-16 rounded-full cursor-pointer shadow-lg ${data.psico.color} hover:shadow-purple-500/50 transition-all`}
        />
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => setActive("social")}
          className={`absolute right-0 top-32 w-16 h-16 rounded-full cursor-pointer shadow-lg ${data.social.color} hover:shadow-blue-500/50 transition-all`}
        />
        <motion.div
          whileHover={{ scale: 1.1 }}
          onClick={() => setActive("espiritual")}
          className={`absolute left-32 top-0 w-16 h-16 rounded-full cursor-pointer shadow-lg ${data.espiritual.color} hover:shadow-amber-500/50 transition-all`}
        />
      </div>

      {active && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b] p-6 rounded-xl border border-cyan-500/30 max-w-md text-center"
        >
          <h3 className="text-xl font-semibold text-cyan-400">
            {data[active as keyof typeof data].title}
          </h3>
          <p className="text-slate-300 mt-3">
            {data[active as keyof typeof data].text}
          </p>
        </motion.div>
      )}
    </div>
  );
}