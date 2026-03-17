"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Definimos qué recibe el componente
interface Props {
  selectedDepto?: string;
}

export default function DepartmentRisk({ selectedDepto = "General" }: Props) {
  // Datos de ejemplo
  const data = [
    { name: 'Ventas', riesgo: 85 },
    { name: 'Operaciones', riesgo: 40 },
    { name: 'RH', riesgo: 25 },
    { name: 'Sistemas', riesgo: 60 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
            itemStyle={{ color: '#22d3ee' }}
          />
          <Bar dataKey="riesgo">
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                // Si el nombre coincide con el botón, brilla en Cyan, si no, se queda en gris/azul
                fill={entry.name === selectedDepto ? '#22d3ee' : '#1e293b'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}