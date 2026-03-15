"use client";

import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export default function RadarBienestar({ scores }: { scores: number[] }) {

  const data = {
    labels: [
      "Atención",
      "Resiliencia",
      "Empatía",
      "Liderazgo",
      "Enfoque",
      "Balance",
    ],
    datasets: [
      {
        data: scores,
        backgroundColor: "rgba(6,182,212,0.25)",
        borderColor: "#06b6d4",
        borderWidth: 3,
        pointBackgroundColor: "#06b6d4",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      r: {
        angleLines: {
          color: "rgba(255,255,255,0.1)",
        },

        grid: {
          color: "rgba(255,255,255,0.1)",
        },

        pointLabels: {
          color: "#94a3b8",
          font: {
            size: 11,
          },
        },

        ticks: {
          display: false,
        },

        suggestedMin: 0,
        suggestedMax: 10,
      },
    },

    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
      <Radar data={data} options={options} />
    </div>
  );
}