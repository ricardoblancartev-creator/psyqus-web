"use client";
import React, { useState } from 'react';
import Link from 'next/link'; // <--- ESTA ES LA QUE FALTA
import { motion } from 'framer-motion';
{/* Botón Liberado */}
<Link href="/encuesta">
  <button 
    className="w-full py-5 rounded-2xl font-black uppercase text-[12px] tracking-[0.3em] bg-white text-black hover:bg-cyan-500 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] cursor-pointer"
  >
    COMENZAR EVALUACIÓN
  </button>
</Link>