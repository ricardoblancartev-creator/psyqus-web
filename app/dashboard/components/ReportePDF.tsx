"use client";

import {
  Document,
  Page,
  Text,
  PDFDownloadLink,
  StyleSheet
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 }
});

export default function ReportePDFClient() {
  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={styles.page}>
            <Text>Reporte Psyqus generado correctamente</Text>
          </Page>
        </Document>
      }
      fileName="reporte.pdf"
    >
      {({ loading }) =>
        loading ? "Generando..." : "Exportar PDF"
      }
    </PDFDownloadLink>
  );
}