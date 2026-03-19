// components/charts/DepartmentRisk.tsx
"use client";

import { DepartmentRiskData } from "@/lib/mockData";

interface DepartmentRiskProps {
  data: DepartmentRiskData[];
  showTotal?: boolean;
  onDepartmentClick?: (dept: string) => void;
}

export default function DepartmentRisk({ 
  data, 
  showTotal = true,
  onDepartmentClick 
}: DepartmentRiskProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Riesgo por Departamento</h3>
      <div className="space-y-3">
        {data.map((dept) => (
          <div 
            key={dept.departamento}
            onClick={() => onDepartmentClick?.(dept.departamento)}
            className="p-3 border rounded hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{dept.departamento}</span>
              {showTotal && (
                <span className="text-sm text-gray-500">
                  Total: {dept.totalEmpleados}
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-2 text-sm">
              <span className="text-red-600">Alto: {dept.riesgoAlto}</span>
              <span className="text-yellow-600">Medio: {dept.riesgoMedio}</span>
              <span className="text-green-600">Bajo: {dept.riesgoBajo}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}