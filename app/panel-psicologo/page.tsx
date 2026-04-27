"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// 👇 IMPORTANTE: PDF solo en cliente
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

// 👇 IMPORTS PDF
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// 🎨 ESTILOS PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
});

// 📄 COMPONENTE PDF
function ReportePDF({ data }: any) {
  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Reporte Psyqus</Text>

        <Text style={styles.text}>
          Empleados evaluados: {data.empleados}
        </Text>

        <Text style={styles.text}>
          Índice de bienestar: {data.bienestar}%
        </Text>

        <Text style={styles.text}>
          Riesgos detectados: {data.riesgos}
        </Text>
      </Page>
    </Document>
  );
}

// 🧠 PANEL PSICÓLOGO
export default function PanelPsicologo() {
  const [data] = useState({
    empleados: 24,
    bienestar: 78,
    riesgos: 5,
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6">
      <h1 className="text-2xl font-bold mb-6 text-cyan-400">
        Panel Psicólogo
      </h1>

      <div className="bg-slate-900 p-6 rounded-xl border border-cyan-500/20">
        <p className="mb-2">Empleados evaluados: {data.empleados}</p>
        <p className="mb-2">Índice de bienestar: {data.bienestar}%</p>
        <p className="mb-4">Riesgos detectados: {data.riesgos}</p>

        {/* 🔥 BOTÓN PDF */}
        <PDFDownloadLink
          document={<ReportePDF data={data} />}
          fileName="reporte-psyqus.pdf"
        >
          {({ loading }) => (
            <button className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg">
              {loading ? "Generando PDF..." : "Descargar PDF"}
            </button>
          )}
        </PDFDownloadLink>
      </div>
    </div>
  );
}