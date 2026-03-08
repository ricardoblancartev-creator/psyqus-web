'use client';
import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarProps {
  scores: number[]; // Array de 6 números (promedios de cada módulo)
}

export default function RadarBienestar({ scores }: RadarProps) {
  const data = {
    labels: [
      'Ambiente',
      'Liderazgo',
      'Emoción',
      'Violencia',
      'Empatía',
      'Desarrollo'
    ],
    datasets: [
      {
        label: 'Tu Nivel de Bienestar',
        data: scores,
        backgroundColor: 'rgba(99, 102, 241, 0.2)', // Indigo claro
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: { display: true },
        suggestedMin: 0,
        suggestedMax: 4, // Escala del 0 al 4 (Nunca a Siempre)
      },
    },
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-2xl shadow-sm">
      <Radar data={data} options={options} />
    </div>
  );
}