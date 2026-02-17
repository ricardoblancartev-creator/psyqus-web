import streamlit as st
import pandas as pd
import plotly.express as px

# 1. Configuración visual
st.set_page_config(page_title="Psyqus Admin - NOM-035", layout="wide", page_icon="📊")

st.title("📊 Panel de Control Psyqus")
st.subheader("Análisis de Riesgo NOM-035")
st.markdown("---")

try:
    # 2. Cargar datos
    df = pd.read_csv('reporte_rh_psyqus.csv')

    # 3. Diccionario de traducción para gráficas y tabla
    traducciones = {
        "Resultado_P1": "Carga de Trabajo",
        "Resultado_P2": "Pausas y Descansos",
        "Area": "Departamento",
        "Fecha": "Fecha de Registro"
    }

    # Creamos una copia del dataframe con nombres limpios para mostrar en la tabla
    df_visible = df.rename(columns=traducciones)

    # --- MÉTRICAS ---
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Encuestas", len(df))
    c2.metric("Áreas Evaluadas", len(df['Area'].unique()))
    c3.metric("Estatus del Sistema", "En Línea ✅")

    st.markdown("---")

    # --- GRÁFICAS ---
    col_izq, col_der = st.columns(2)

    with col_izq:
        st.write("### 🏢 Participación")
        fig_pie = px.pie(df, names='Area', hole=0.4, 
                         color_discrete_sequence=px.colors.qualitative.Pastel)
        st.plotly_chart(fig_pie, use_container_width=True)

    with col_der:
        st.write("### ⚠️ Riesgo: Carga de Trabajo")
        fig_bar = px.histogram(df, x="Area", color="Resultado_P1", 
                               barmode="group",
                               labels=traducciones,
                               color_discrete_map={
                                   "Siempre": "#FF4B4B", "Casi siempre": "#FFA500",
                                   "A veces": "#FFFF00", "Casi nunca": "#90EE90", "Nunca": "#008000"
                               })
        st.plotly_chart(fig_bar, use_container_width=True)

    # --- TABLA PROFESIONAL ---
    st.write("### 📋 Registro Detallado (Nombres Limpios)")
    # Mostramos la versión con nombres traducidos
    st.dataframe(df_visible, use_container_width=True)

    # Botón de descarga
    csv = df_visible.to_csv(index=False).encode('utf-8')
    st.download_button(label="📥 Descargar Informe para RH", data=csv, file_name='informe_psyqus.csv', mime='text/csv')

except Exception as e:
    st.error(f"Esperando más datos para actualizar... {e}")
    # --- SECCIÓN DE PSICÓLOGO VIRTUAL ---
st.markdown("---")
st.write("### 📜 Certificado de Recomendaciones Profesionales")

# Lógica del Psicólogo Virtual
# Contamos cuántas personas marcaron "Siempre" o "Casi siempre" en Carga de Trabajo
riesgo_alto = df[df['Resultado_P1'].isin(['Siempre', 'Casi siempre'])].shape[0]
porcentaje_riesgo = (riesgo_alto / len(df)) * 100

with st.container():
    st.info("#### 🎙️ Dictamen de la Mtra. Esperanza Prieto")
    
    if porcentaje_riesgo > 50:
        recomendacion = """
        **RIESGO CRÍTICO DETECTADO:** Se observa un nivel de saturación de tareas que supera la capacidad instalada. 
        *Recomendación:* Implementar de inmediato una revisión de procesos y redistribución de cargas. 
        Es vital evitar el burnout en el equipo operativo."""
    elif porcentaje_riesgo > 20:
        recomendacion = """
        **RIESGO MODERADO:** Existen focos de estrés por tiempos de entrega. 
        *Recomendación:* Se sugiere capacitar en gestión del tiempo y asegurar que los descansos se respeten."""
    else:
        recomendacion = """
        **ESTADO SALUDABLE:** Los niveles de carga están dentro de los parámetros aceptables.
        *Recomendación:* Mantener canales de comunicación abiertos y reforzar el reconocimiento positivo."""

    st.write(recomendacion)
    
    # El Certificado Profesional
    st.markdown(f"""
    <div style="border: 2px solid #008000; padding: 20px; border-radius: 10px; background-color: #f0fff0;">
        <p style="text-align: center; margin-bottom: 0;"><b>CERTIFICACIÓN DE ANÁLISIS NOM-035</b></p>
        <hr style="margin: 10px 0;">
        <p style="font-style: italic; color: #555;">
            "Basado en el análisis de las respuestas recolectadas, se dictamina que el área requiere atención en los puntos mencionados arriba para cumplir con los estándares de salud organizacional."
        </p>
        <div style="text-align: right; margin-top: 20px;">
            <p style="margin-bottom: 0;"><b>Mtra. Esperanza Prieto</b></p>
            <p style="font-size: 0.8em; color: #777;">Psicóloga Organizacional | Céd. Profesional: 12345678</p>
            <p style="font-size: 0.7em; color: #999;">Generado automáticamente por Psyqus AI</p>
        </div>
    </div>
    """, unsafe_allow_html=True)