"use client";
import React from 'react';
import { Page, Text, View, Document, StyleSheet, PDFDownloadLink, Font } from '@react-pdf/renderer';

// Estilos del PDF (No usa Tailwind, usa estos estilos propios)
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#ffffff' },
  header: { borderBottom: 2, borderBottomColor: '#06b6d4', marginBottom: 20, pb: 10 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 10, color: '#64748b', marginTop: 5, letterSpacing: 2 },
  section: { margin: 10, padding: 10 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  statBox: { padding: 15, backgroundColor: '#f8fafc', borderRadius: 8, width: '30%' },
  statLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#06b6d4', mt: 5 },
  content: { fontSize: 12, color: '#334155', lineHeight: 1.6, marginTop: 20 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, textAlign: 'center', color: '#94a3b8', borderTop: 1, pt: 10 }
});

// El Documento PDF
const MyDocument = ({ data }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>PSYQUS INTELLIGENCE</Text>
        <Text style={styles.subtitle}>REPORTE EJECUTIVO DE BIENESTAR PSICOSOCIAL</Text>
      </View>

      <View style={styles.statGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Índice Resiliencia</Text>
          <Text style={styles.statValue}>72%</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Riesgo Detectado</Text>
          <Text style={styles.statValue}>Bajo</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Participación</Text>
          <Text style={styles.statValue}>94%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Análisis Situacional</Text>
        <Text style={styles.content}>
          Basado en los algoritmos de Psyqus, la organización presenta un clima laboral estable. 
          Se observa una tendencia positiva en la comunicación asertiva, lo que ha reducido 
          los niveles de cortisol proyectados en el equipo de trabajo.
        </Text>
        <Text style={styles.content}>
          Recomendación: Continuar con los módulos de Neuro-Training para mantener los niveles 
          de oxitocina estables durante el cierre de trimestre.
        </Text>
      </View>

      <Text style={styles.footer}>
        Este documento es una representación legal de los indicadores recopilados por la plataforma Psyqus. 
        Válido para fines de auditoría interna y cumplimiento de la NOM-035. - 2026
      </Text>
    </Page>
  </Document>
);

// El Botón que descarga el PDF
export const BotonExportarPDF = () => (
  <PDFDownloadLink document={<MyDocument />} fileName="Reporte_Psyqus_2026.pdf">
    {({ loading }) => (
      <button className="px-6 py-3 bg-cyan-500 hover:bg-white text-black font-black rounded-xl transition-all shadow-lg text-xs uppercase tracking-widest">
        {loading ? 'Generando...' : 'Descargar Reporte PDF'}
      </button>
    )}
  </PDFDownloadLink>
);