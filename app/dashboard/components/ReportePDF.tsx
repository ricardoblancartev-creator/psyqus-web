"use client";
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReporteProps {
  datos: {
    usuario_id: string;
    departamento?: string;
  };
  scores: number[];
}

export default function BotonExportarPDF({ datos, scores }: ReporteProps) {
  const generarPDF = () => {
    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString();

    // 1. Encabezado Estilo Corporativo
    doc.setFillColor(2, 6, 23); // Color #020617 de Psyqus
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(6, 182, 212); // Cian
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("PSYQUS INTELLIGENCE", 15, 25);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text("SISTEMA DE GESTIÓN DE RIESGO PSICOSOCIAL", 15, 32);
    doc.text(`FECHA DE EMISIÓN: ${fecha}`, 150, 25);

    // 2. Título del Reporte
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("REPORTE DE CUMPLIMIENTO NOM-035-STPS-2018", 15, 55);

    // 3. Ficha Técnica (El Marco Legal)
    autoTable(doc, {
      startY: 65,
      head: [['Concepto', 'Detalle']],
      body: [
        ['ID de Evaluación', `PSY-${Math.floor(Math.random() * 10000)}`],
        ['Departamento', datos.departamento || 'GLOBAL'],
        ['Estatus Legal', 'IDENTIFICACIÓN Y ANÁLISIS (NUMERAL 7.1)'],
        ['Metodología', 'Humanista-Científica (Rogers/Maslow)'],
      ],
      headStyles: { fillColor: [30, 41, 59] },
    });

    // 4. Tabla de Resultados (Los 6 Módulos)
    const categorias = [
      "Condiciones del Entorno",
      "Carga de Trabajo",
      "Sentido de Pertenencia",
      "Equilibrio Vida-Trabajo",
      "Liderazgo Humanista",
      "Autorrealización"
    ];

    const tableRows = categorias.map((cat, i) => [
      cat,
      scores[i].toFixed(2),
      scores[i] >= 4 ? 'BAJO' : scores[i] >= 2.5 ? 'MEDIO' : 'ALTO'
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Dimensión Evaluada', 'Puntaje (1-5)', 'Nivel de Riesgo']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] },
      columnStyles: { 1: { halign: 'center' }, 2: { halign: 'center' } },
    });

    // 5. Nota de Validez Jurídica
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Este documento digital constituye una evidencia de la aplicación de instrumentos para la identificación\n" +
      "de factores de riesgo psicosocial en el centro de trabajo, de conformidad con la norma oficial mexicana.\n" +
      "Psyqus Intelligence garantiza la confidencialidad de los datos recabados.",
      15, finalY
    );

    // 6. Firma de Validación
    doc.line(15, finalY + 30, 80, finalY + 30);
    doc.text("Sello Digital de Validación Psyqus", 15, finalY + 35);

    // Descargar
    doc.save(`Reporte_Psyqus_NOM035_${datos.departamento || 'Global'}.pdf`);
  };

  return (
    <button 
      onClick={generarPDF}
      className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-cyan-500 transition-all shadow-lg hover:shadow-cyan-500/20"
    >
      Descargar Reporte Legal
    </button>
  );
}