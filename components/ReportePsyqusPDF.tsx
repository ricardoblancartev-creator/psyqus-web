"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Resultado = {
  id?: string | number;
  user_id?: string | null;
  puntaje_total?: number | null;
  riesgo?: string | null;
  interpretacion?: string | null;
  created_at?: string | null;
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

const styles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#020617",
    color: "#ffffff",
    fontFamily: "Helvetica",
  },
  brand: {
    fontSize: 28,
    color: "#22d3ee",
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#cbd5e1",
    marginBottom: 16,
  },
  section: {
    padding: 14,
    marginBottom: 14,
    border: "1px solid #1e293b",
    backgroundColor: "#0f172a",
    borderRadius: 8,
  },
  title: {
    fontSize: 15,
    color: "#22d3ee",
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 10,
    color: "#e2e8f0",
    lineHeight: 1.5,
  },
  small: {
    fontSize: 8,
    color: "#94a3b8",
    marginBottom: 4,
  },
  metricRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  metric: {
    flex: 1,
    padding: 10,
    backgroundColor: "#020617",
    border: "1px solid #334155",
    borderRadius: 6,
  },
  metricLabel: {
    color: "#94a3b8",
    fontSize: 8,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
  item: {
    marginBottom: 9,
    paddingBottom: 7,
    borderBottom: "1px solid #1e293b",
  },
});

function fecha(date?: string | null) {
  if (!date) return "Sin fecha";
  return new Date(date).toLocaleString("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function promedio(resultados: Resultado[]) {
  if (!resultados.length) return 0;
  const total = resultados.reduce(
    (acc, item) => acc + Number(item.puntaje_total || 0),
    0
  );
  return Math.round(total / resultados.length);
}

function contar(resultados: Resultado[], riesgo: string) {
  return resultados.filter(
    (item) => (item.riesgo || "").toLowerCase() === riesgo
  ).length;
}

export default function ReportePsyqusPDF({
  empresa = "Empresa evaluada",
  resultados,
  mensajes,
}: Props) {
  const riesgoAlto = contar(resultados, "alto");
  const riesgoMedio = contar(resultados, "medio");
  const riesgoBajo = contar(resultados, "bajo");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brand}>PSYQUS</Text>
        <Text style={styles.subtitle}>
          Reporte profesional de bienestar organizacional y seguimiento NOM-035
        </Text>

        <View style={styles.section}>
          <Text style={styles.title}>Resumen ejecutivo</Text>
          <Text style={styles.small}>Empresa: {empresa}</Text>
          <Text style={styles.small}>Fecha: {fecha(new Date().toISOString())}</Text>

          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Evaluaciones</Text>
              <Text style={styles.metricValue}>{resultados.length}</Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Promedio</Text>
              <Text style={styles.metricValue}>{promedio(resultados)}</Text>
            </View>

            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Riesgo alto</Text>
              <Text style={styles.metricValue}>{riesgoAlto}</Text>
            </View>
          </View>

          <Text style={styles.text}>
            Psyqus permite identificar señales tempranas de estrés, desgaste,
            conflictos internos y factores de riesgo psicosocial. Este reporte
            resume información agregada para facilitar decisiones preventivas,
            seguimiento profesional y documentación de acciones.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Distribución de riesgo</Text>
          <Text style={styles.text}>Riesgo alto: {riesgoAlto}</Text>
          <Text style={styles.text}>Riesgo medio: {riesgoMedio}</Text>
          <Text style={styles.text}>Riesgo bajo: {riesgoBajo}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Últimas evaluaciones</Text>

          {resultados.length === 0 ? (
            <Text style={styles.text}>No hay evaluaciones registradas.</Text>
          ) : (
            resultados.slice(0, 8).map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.small}>{fecha(item.created_at)}</Text>
                <Text style={styles.text}>
                  Puntaje: {item.puntaje_total ?? "-"} · Riesgo:{" "}
                  {item.riesgo || "sin clasificar"}
                </Text>
                <Text style={styles.text}>
                  {item.interpretacion || "Sin interpretación registrada."}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Mensajes e interacciones relevantes</Text>

          {mensajes.length === 0 ? (
            <Text style={styles.text}>No hay mensajes registrados.</Text>
          ) : (
            mensajes.slice(0, 6).map((msg, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.small}>
                  {fecha(msg.created_at)} · {msg.tipo || "sin tipo"}
                </Text>
                <Text style={styles.text}>
                  {msg.mensaje || "Sin contenido registrado."}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Acciones sugeridas</Text>
          <Text style={styles.text}>
            1. Revisar áreas con señales de riesgo alto o medio.
          </Text>
          <Text style={styles.text}>
            2. Dar seguimiento profesional a mensajes sensibles.
          </Text>
          <Text style={styles.text}>
            3. Documentar acciones preventivas y correctivas.
          </Text>
          <Text style={styles.text}>
            4. Implementar microintervenciones de comunicación, liderazgo y prevención.
          </Text>
        </View>
      </Page>
    </Document>
  );
}