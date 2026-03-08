import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

export default function BotonExportarPDF({ datos, scores }: { datos: any, scores: number[] }) {
  const generarPDF = () => {
    const doc = new jsPDF();
    
    // Header Estilo Psyqus
    doc.setFillColor(2, 6, 23); // Color oscuro del app
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(34, 211, 238); // Cyan
    doc.setFontSize(22);
    doc.text("PSYQUS INTELLIGENCE REPORT", 14, 25);
    
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 48);

    // Tabla de Resultados por Dimensión (PASO 3: GRÁFICAS EN TABLA)
    autoTable(doc, {
      startY: 55,
      head: [['Dimensión', 'Puntaje', 'Estatus']],
      body: [
        ['Ambiente de Trabajo', scores[0], scores[0] > 3 ? 'Riesgo' : 'Óptimo'],
        ['Factores Propios', scores[1], scores[1] > 3 ? 'Riesgo' : 'Óptimo'],
        ['Organización del Tiempo', scores[2], scores[2] > 3 ? 'Riesgo' : 'Óptimo'],
        ['Liderazgo y Relaciones', scores[3], scores[3] > 3 ? 'Riesgo' : 'Óptimo'],
        ['Entorno Organizacional', scores[4], scores[4] > 3 ? 'Riesgo' : 'Óptimo'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [34, 211, 238], textColor: [0, 0, 0] }
    });

    doc.save(`Reporte_Psyqus_${datos.usuario_id}.pdf`);
  };

  return (
    <button 
      onClick={generarPDF}
      className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-cyan-500 transition-all"
    >
      Descargar Evidencia PDF
    </button>
  );
}