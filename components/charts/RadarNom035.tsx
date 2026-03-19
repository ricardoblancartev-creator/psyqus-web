// components/charts/RadarNom035.tsx
"use client";

import { Nom035Data } from "@/lib/mockData";

interface RadarNom035Props {
  data: Nom035Data[];
  title?: string;
  height?: number;
}

export default function RadarNom035({ 
  data, 
  title = "NOM-035 Dimensiones", 
  height = 400 
}: RadarNom035Props) {
  // Aquí tu lógica del gráfico (Recharts, Chart.js, etc.)
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        {/* Tu implementación del gráfico radar */}
        <pre className="text-sm text-gray-600">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
}