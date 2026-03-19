// lib/mockData.ts
// Tipos base
export interface Nom035Data {
  dimension: string;
  nivelRiesgo: number;
  interpretacion: string;
}

export interface DepartmentRiskData {
  departamento: string;
  riesgoAlto: number;
  riesgoMedio: number;
  riesgoBajo: number;
  totalEmpleados: number;
}

export interface HeatmapData {
  factor: string;
  severidad: number;
  frecuencia: number;
  impacto: number;
  categoria: string;
}

export interface BienestarData {
  indicador: string;
  puntaje: number;
  benchmark: number;
  tendencia: "up" | "down" | "stable";
}

// Mock data con tipado estricto
export const mockData: {
  nom035: Nom035Data[];
  departmentRisk: DepartmentRiskData[];
  heatmapData: HeatmapData[];
  bienestar: BienestarData[];
} = {
  nom035: [
    { dimension: "Ambiente de trabajo", nivelRiesgo: 45, interpretacion: "Bajo" },
    { dimension: "Factores propios", nivelRiesgo: 62, interpretacion: "Medio" },
    { dimension: "Organización del tiempo", nivelRiesgo: 38, interpretacion: "Bajo" },
    { dimension: "Liderazgo", nivelRiesgo: 71, interpretacion: "Alto" },
    { dimension: "Relaciones sociales", nivelRiesgo: 55, interpretacion: "Medio" },
  ],
  
  departmentRisk: [
    { departamento: "Ventas", riesgoAlto: 5, riesgoMedio: 12, riesgoBajo: 23, totalEmpleados: 40 },
    { departamento: "TI", riesgoAlto: 8, riesgoMedio: 15, riesgoBajo: 27, totalEmpleados: 50 },
    { departamento: "RH", riesgoAlto: 2, riesgoMedio: 8, riesgoBajo: 15, totalEmpleados: 25 },
    { departamento: "Operaciones", riesgoAlto: 12, riesgoMedio: 20, riesgoBajo: 30, totalEmpleados: 62 },
  ],
  
  heatmapData: [
    { factor: "Carga laboral", severidad: 4, frecuencia: 5, impacto: 20, categoria: "Alto" },
    { factor: "Falta de control", severidad: 3, frecuencia: 4, impacto: 12, categoria: "Medio" },
    { factor: "Comunicación", severidad: 2, frecuencia: 3, impacto: 6, categoria: "Bajo" },
  ],
  
  bienestar: [
    { indicador: "Salud física", puntaje: 78, benchmark: 75, tendencia: "up" },
    { indicador: "Salud mental", puntaje: 65, benchmark: 70, tendencia: "down" },
    { indicador: "Balance vida-trabajo", puntaje: 72, benchmark: 68, tendencia: "stable" },
    { indicador: "Satisfacción laboral", puntaje: 80, benchmark: 72, tendencia: "up" },
  ],
};