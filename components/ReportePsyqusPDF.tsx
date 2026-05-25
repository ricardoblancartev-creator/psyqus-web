"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#020617",
    color: "#fff",
    padding: 30,
  },

  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#22d3ee",
  },

  section: {
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
  },

  text: {
    fontSize: 11,
    marginBottom: 6,
  },

  big: {
    fontSize: 20,
    color: "#22d3ee",
  },
});

export default function ReporteEmpresaPDF({
  total,
  riesgoAlto,
  riesgoMedio,
  riesgoBajo,
}: any) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>
          Reporte Ejecutivo Psyqus
        </Text>

        <View style={styles.section}>
          <Text style={styles.text}>
            Evaluaciones registradas
          </Text>

          <Text style={styles.big}>
            {total}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Riesgo alto
          </Text>

          <Text style={styles.big}>
            {riesgoAlto}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Riesgo medio
          </Text>

          <Text style={styles.big}>
            {riesgoMedio}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Riesgo bajo
          </Text>

          <Text style={styles.big}>
            {riesgoBajo}
          </Text>
        </View>

      </Page>
    </Document>
  );
}
