"use client";
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';

// Importamos dinámicamente el componente de descarga para que no truene en el build
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  header: { borderBottom: 2, borderBottomColor: '#06b6d4', marginBottom: 20, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 5, letterSpacing: 2 },
  section: { margin: 10, padding: 10 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, width: '30%' },
  statLabel: { fontSize: 8, color: '#64748b' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#06b6d4', marginTop: 5 },
  content: { fontSize: 12, color: '#334155', lineHeight: 1.6, marginTop: 20 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#94a3b8', borderTop: 1, paddingTop: 10 }
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PSYQUS INTELLIGENCE</Text>
        <Text style={styles.subtitle}>REPORTE EJECUTIVO DE BIENESTAR PSICOSOCIAL</Text>
      </View>
      <View style={styles.statGrid}>
        <View style={styles.statBox}><Text style={styles.statLabel}>Resiliencia</Text><Text style={styles.statValue}>72%</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Riesgo</Text><Text style={styles.statValue}>Bajo</Text></View>
        <View style={styles.statBox}><Text style={styles.statLabel}>Participación</Text><Text style={styles.statValue}>94%</Text></View>
      </View>
      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Análisis Situacional</Text>
        <Text style={styles.content}>Este reporte certifica que la organización mantiene niveles estables de salud mental y cumple con los parámetros preventivos de la NOM-035.</Text>
      </View>
      <Text style={styles.footer}>Documento generado por Psyqus Engine v1.0 - 2026</Text>
    </Page>
  </Document>
);

export const BotonExportarPDF = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <button className="px-6 py-3 bg-slate-800 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest cursor-wait">Iniciando...</button>;

  return (
    <PDFDownloadLink document={<MyDocument />} fileName="Reporte_Psyqus_2026.pdf">
      {({ loading }) => (
        <button className="px-6 py-3 bg-cyan-500 hover:bg-white text-black font-black rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] text-xs uppercase tracking-widest">
          {loading ? 'Generando...' : 'Descargar Reporte PDF'}
        </button>
      )}
    </PDFDownloadLink>
  );
};