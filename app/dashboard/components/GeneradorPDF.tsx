"use client";

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  header: { fontSize: 20, marginBottom: 20, color: '#0891b2', fontWeight: 'bold', textAlign: 'center' },
  section: { margin: 10, padding: 15, border: '1px solid #e2e8f0', borderRadius: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottom: '1px solid #f1f5f9' },
  label: { fontSize: 12, color: '#475569' },
  value: { fontSize: 12, fontWeight: 'bold', color: '#1e293b' },
  footer: { position: 'absolute', bottom: 30, textAlign: 'center', width: '100%', fontSize: 9, color: '#94a3b8' }
});

const ReportePDF = ({ scores }: { scores: number[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>REPORTE PSICOPRODUCTIVO - PSYQUS</Text>
      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 15, color: '#334155' }}>Resultados de la Evaluación:</Text>
        {['Ambiente', 'Factores', 'Organización', 'Liderazgo', 'Entorno'].map((cat, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.label}>{cat}</Text>
            <Text style={styles.value}>{scores[i].toFixed(1)} / 5.0</Text>
          </View>
        ))}
      </View>
      <Text style={styles.footer}>Psyqus v1.0 - Basado en la NOM-035-STPS-2018</Text>
    </Page>
  </Document>
);

export default function GeneradorPDF({ scores }: { scores: number[] }) {
  return (
    <PDFDownloadLink
      document={<ReportePDF scores={scores} />}
      fileName="Reporte_NOM035_Psyqus.pdf"
      className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-cyan-500/20"
    >
      {({ loading }) => (loading ? 'Procesando...' : 'Descargar PDF Oficial')}
    </PDFDownloadLink>
  );
}