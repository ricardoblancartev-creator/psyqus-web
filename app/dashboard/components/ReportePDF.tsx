"use client";
import React, { useState, useEffect } from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import dynamic from 'next/dynamic';

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

const styles = StyleSheet.create({
  page: { padding: 50, backgroundColor: '#ffffff' },
  header: { borderBottom: 2, borderBottomColor: '#06b6d4', marginBottom: 30, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 9, color: '#64748b', marginTop: 5, letterSpacing: 2, textTransform: 'uppercase' },
  section: { marginTop: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', marginBottom: 10 },
  content: { fontSize: 11, color: '#334155', lineHeight: 1.6 },
  signatureSection: { marginTop: 60, borderTop: 1, borderTopColor: '#e2e8f0', paddingTop: 20, width: 220 },
  signatureName: { fontSize: 12, fontWeight: 'bold', color: '#0f172a' },
  signatureTitle: { fontSize: 9, color: '#64748b', marginTop: 2 },
  signatureId: { fontSize: 9, color: '#06b6d4', fontWeight: 'bold', marginTop: 2 },
  footer: { position: 'absolute', bottom: 40, left: 50, right: 50, fontSize: 8, textAlign: 'center', color: '#94a3b8', borderTop: 1, paddingTop: 10 }
});

const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PSYQUS INTELLIGENCE</Text>
        <Text style={styles.subtitle}>Reporte de Cumplimiento Normativo NOM-035</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Análisis de Riesgo Psicosocial</Text>
        <Text style={styles.content}>
          El presente documento certifica que la organización ha implementado los mecanismos 
          de monitoreo continuo establecidos por Psyqus Intelligence. Los indicadores de 
          estrés y clima laboral se encuentran dentro de los rangos permitidos, 
          promoviendo un entorno organizacional favorable.
        </Text>
      </View>

      <View style={styles.signatureSection}>
        <Text style={styles.signatureName}>Mtra. Esperanza [Apellido]</Text>
        <Text style={styles.signatureTitle}>Especialista en Psicología Organizacional</Text>
        <Text style={styles.signatureId}>Cédula Profesional: [Tu Cédula Aquí]</Text>
      </View>

      <Text style={styles.footer}>
        Este reporte es un documento oficial generado por la plataforma Psyqus. 
        Fecha de emisión: {new Date().toLocaleDateString()}
      </Text>
    </Page>
  </Document>
);

export const BotonExportarPDF = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => { setIsClient(true); }, []);

  if (!isClient) return null;

  return (
    <PDFDownloadLink document={<MyDocument />} fileName="REPORTE_OFICIAL_PSYQUS.pdf">
      {({ loading }) => (
        <button className="px-8 py-4 bg-cyan-500 hover:bg-white text-black font-black rounded-2xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)] text-xs uppercase tracking-widest">
          {loading ? 'Preparando Certificado...' : 'Descargar Reporte Legal'}
        </button>
      )}
    </PDFDownloadLink>
  );
};