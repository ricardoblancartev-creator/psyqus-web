'use client';
import React from 'react';

const datosDummy = [
  { depto: 'Ventas', riesgo: 'Muy Alto', puntaje: 145, color: 'bg-red-500' },
  { depto: 'Operaciones', riesgo: 'Alto', puntaje: 110, color: 'bg-orange-500' },
  { depto: 'Sistemas', riesgo: 'Medio', puntaje: 85, color: 'bg-yellow-500' },
  { depto: 'RH', riesgo: 'Bajo', puntaje: 55, color: 'bg-green-500' },
];

export default function MapaCalor() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold mb-4">Riesgo Psicosocial por Departamento</h3>
      <div className="space-y-4">
        {datosDummy.map((item) => (
          <div key={item.depto} className="flex items-center justify-between">
            <span className="font-medium text-slate-700 w-24">{item.depto}</span>
            <div className="flex-1 mx-4 bg-slate-100 h-4 rounded-full overflow-hidden">
              <div 
                className={`${item.color} h-full`} 
                style={{ width: `${(item.puntaje / 175) * 100}%` }}
              ></div>
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${item.color} text-white`}>
              {item.riesgo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}