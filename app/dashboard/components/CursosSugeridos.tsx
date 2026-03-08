'use client';
import React from 'react';

interface Curso {
  id: string;
  titulo: string;
  categoria: string;
  duracion: string;
  imagen: string;
}

interface Props {
  moduloBajo: string; // Recibe el nombre del módulo con menor puntaje
}

export default function CursosSugeridos({ moduloBajo }: Props) {
  // Diccionario de cursos según el fallo del Radar
  const recomendaciones: Record<string, Curso[]> = {
    'Ambiente': [
      { id: '1', titulo: 'Ergonomía en el Home Office', categoria: 'Salud', duracion: '15 min', imagen: 'https://images.unsplash.com/photo-1593642532400-2682810df593' },
    ],
    'Liderazgo': [
      { id: '2', titulo: 'Feedback Efectivo para Líderes', categoria: 'Soft Skills', duracion: '20 min', imagen: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d' },
    ],
    'Emoción': [
      { id: '3', titulo: 'Mindfulness para el Estrés', categoria: 'Bienestar', duracion: '10 min', imagen: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773' },
    ],
    'Empatía': [
      { id: '4', titulo: 'Comunicación No Violenta', categoria: 'Relaciones', duracion: '30 min', imagen: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e' },
    ]
  };

  const cursos = recomendaciones[moduloBajo] || recomendaciones['Emoción'];

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-slate-800 mb-4">
        Basado en tu Radar: <span className="text-indigo-600">Plan de Acción</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <div key={curso.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-md transition cursor-pointer">
            <img src={curso.imagen} alt={curso.titulo} className="h-32 w-full object-cover" />
            <div className="p-4">
              <span className="text-xs font-bold text-indigo-500 uppercase">{curso.categoria}</span>
              <h4 className="font-bold text-slate-700 mt-1">{curso.titulo}</h4>
              <p className="text-sm text-slate-500 mt-2">⏱ {curso.duracion}</p>
              <button className="mt-4 w-full bg-slate-50 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-600 hover:text-white transition">
                Comenzar ahora
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}