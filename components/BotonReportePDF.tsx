"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import ReportePsyqusPDF from "@/components/ReportePsyqusPDF";
import { Download } from "lucide-react";

type Resultado = {
  id?: string | number;
  user_id?: string | null;
  puntaje_total?: number | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  created_at?: string | null;
  dimensiones?: Record<string, number> | null;
};

type Mensaje = {
  id?: string | number;
  user_id?: string | null;
  tipo?: string | null;
  mensaje?: string | null;
  respuesta?: string | null;
  created_at?: string | null;
};

type Props = {
  empresa?: string;
  resultados: Resultado[];
  mensajes: Mensaje[];
};

export default function BotonReportePDF({
  empresa = "Empresa evaluada",
  resultados,
  mensajes,
}: Props) {
  return (
    <PDFDownloadLink
      document={
        <ReportePsyqusPDF
          empresa={empresa}
          resultados={resultados}
          mensajes={mensajes}
        />
      }
      fileName={`reporte-psyqus-${new Date().toISOString().slice(0, 10)}.pdf`}
      className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 transition"
    >
      {({ loading }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? "Generando PDF..." : "Descargar reporte PDF"}
        </>
      )}
    </PDFDownloadLink>
  );
}