"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const questions = [
  { id: 1, text: "Mi trabajo me exige mucho esfuerzo físico", category: "Condiciones" },
  { id: 2, text: "Considero que mi carga de trabajo es excesiva", category: "Carga" },
  { id: 3, text: "Mi trabajo me permite desarrollar nuevas habilidades", category: "Control" },
];

export default function EncuestaPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const handleAnswer = (val: number) => {
    setAnswers({ ...answers, [questions[step].id]: val });
    if (step < questions.length - 1) setStep(step + 1);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] backdrop-blur-xl shadow-2xl">
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-8">
          <div 
            className="h-full bg-cyan-500 transition-all duration-500" 
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>

        <p className="text-cyan-500 text-xs font-bold tracking-widest uppercase mb-2">
          Pregunta {step + 1} de {questions.length}
        </p>
        
        <h2 className="text-2xl font-semibold mb-8 leading-tight">
          {questions[step].text}
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {[
            { label: "Siempre", val: 4 },
            { label: "Casi siempre", val: 3 },
            { label: "A veces", val: 2 },
            { label: "Casi nunca", val: 1 },
            { label: "Nunca", val: 0 }
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => handleAnswer(opt.val)}
              className="w-full p-4 text-left rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500 hover:bg-cyan-500/10 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-white transition-colors">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-8 text-[10px] text-slate-500 tracking-widest uppercase">NOM-035 • Guía de Referencia II</p>
    </main>
  );
}