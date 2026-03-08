"use client";
import React from 'react';
import {
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

interface RadarProps {
  scores: number[]; // Recibe un array de 6 números (promedios de los módulos)
}

export default function RadarBienestar({ scores }: RadarProps) {
  // Mapeamos tus 6 módulos definidos en el Punto 3
  const data = [
    { subject: 'Ambiente', A: scores[0] || 0, fullMark: 5 },
    { subject: 'Liderazgo', A: scores[1] || 0, fullMark: 5 },
    { subject: 'Emociones', A: scores[2] || 0, fullMark: 5 },
    { subject: 'Violencia', A: scores[3] || 0, fullMark: 5 },
    { subject: 'Comunicación', A: scores[4] || 0, fullMark: 5 },
    { subject: 'Desarrollo', A: scores[5] || 0, fullMark: 5 },
  ];

  return (
    <div className="w-full h-[350px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 5]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Bienestar"
            dataKey="A"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}