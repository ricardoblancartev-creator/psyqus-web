"use client";

import { useEffect, useState } from "react";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const pdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#ffffff",
    color: "#111827",
  },
  title: {
    fontSize: 22,
    marginBottom: 12,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 20,
    color: "#374151",
  },
  section: {
    marginBottom: 14,
    padding: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
  },
  label: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#111827",
  },
});

function ReportePsyqusPDF() {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Reporte Ejecutivo Psyqus</Text>
        <Text style={pdfStyles.subtitle}>
          Evaluación general de bienestar organizacional y riesgos psicosociales.
        </Text>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Empleados evaluados</Text>
          <Text style={pdfStyles.value}>24</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Índice de bienestar</Text>
          <Text style={pdfStyles.value}>78%</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Riesgos detectados</Text>
          <Text style={pdfStyles.value}>5 alertas relevantes</Text>
        </View>

        <View style={pdfStyles.section}>
          <Text style={pdfStyles.label}>Interpretación</Text>
          <Text style={pdfStyles.value}>
            La organización presenta indicadores funcionales de bienestar, aunque
            existen señales tempranas relacionadas con estrés laboral, comunicación
            interna y desgaste emocional. Se recomienda seguimiento preventivo.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export default function PanelPsicologoPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#020617] px-6 py-8 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-400">
            Psyqus
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            Panel Psicólogo
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">
            Visualiza indicadores de bienestar, riesgos psicosociales y reportes
            ejecutivos para acompañamiento organizacional.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 shadow-xl">
            <p className="text-sm text-slate-400">Empleados evaluados</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">24</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 shadow-xl">
            <p className="text-sm text-slate-400">Índice de bienestar</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">78%</p>
          </div>

          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-5 shadow-xl">
            <p className="text-sm text-slate-400">Riesgos detectados</p>
            <p className="mt-2 text-3xl font-bold text-cyan-300">5</p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-cyan-500/20 bg-slate-900/80 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-cyan-300">
            Reporte ejecutivo
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
            Descarga un reporte en PDF con los principales indicadores de
            bienestar, alertas tempranas y lectura psicológica general del clima
            laboral.
          </p>

          <div className="mt-6">
            {mounted ? (
              <PDFDownloadLink
                document={<ReportePsyqusPDF />}
                fileName="reporte-ejecutivo-psyqus.pdf"
              >
                {({ loading }) => (
                  <button className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
                    {loading ? "Generando PDF..." : "Descargar PDF"}
                  </button>
                )}
              </PDFDownloadLink>
            ) : (
              <button
                disabled
                className="rounded-xl border border-cyan-500/30 px-5 py-3 text-sm text-cyan-200"
              >
                Preparando PDF...
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}