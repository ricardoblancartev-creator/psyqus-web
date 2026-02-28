"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { subject: 'Comunicación', A: 120, fullMark: 150 },
  { subject: 'Liderazgo', A: 98, fullMark: 150 },
  { subject: 'Carga Mental', A: 86, fullMark: 150 },
  { subject: 'Empatía', A: 99, fullMark: 150 },
  { subject: 'Reconocimiento', A: 85, fullMark: 150 },
];

export default function RadarBienestar() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
        Análisis de Impacto Organizacional
      </h3>
      
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Radar
              name="Bienestar"
              dataKey="A"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <p className="mt-4 text-xs text-slate-400 text-center uppercase tracking-widest">
        Métrica en tiempo real basada en IA de Psyqus
      </p>
    </motion.div>
  );
}