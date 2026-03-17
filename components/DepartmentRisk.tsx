"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { departamento: "Ventas", riesgo: 85 },
  { departamento: "Operaciones", riesgo: 62 },
  { departamento: "Administración", riesgo: 45 },
  { departamento: "TI", riesgo: 38 },
  { departamento: "RH", riesgo: 25 },
];

export default function DepartmentRisk() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8" }} />
        <YAxis dataKey="departamento" type="category" tick={{ fill: "#94a3b8" }} width={100} />
        <Tooltip 
          contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px" }}
          itemStyle={{ color: "#e2e8f0" }}
        />
        <Bar dataKey="riesgo" fill="#ef4444" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}