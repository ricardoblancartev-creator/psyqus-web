import streamlit as st
import pandas as pd
import datetime
import os

st.set_page_config(page_title="Psyqus - Prueba Piloto", page_icon="📊")

# Detectar área desde la URL
query_params = st.query_params
area_detectada = query_params.get("area", "Sin_Area")

st.title("🧠 Psyqus - Evaluación NOM-035")
st.info(f"Registrando respuesta para el área: **{area_detectada}**")

with st.form("encuesta"):
    # Pregunta de la NOM-035 (Carga de trabajo)
    p1 = st.select_slider(
        "¿Sientes que la cantidad de trabajo es superior a lo que puedes hacer en tu jornada?",
        options=["Nunca", "Casi nunca", "A veces", "Casi siempre", "Siempre"]
    )
    
    # Pregunta de la NOM-035 (Control)
    p2 = st.select_slider(
        "¿Tu trabajo te permite tomar pausas para descansar?",
        options=["Siempre", "Casi siempre", "A veces", "Casi nunca", "Nunca"]
    )

    enviar = st.form_submit_button("Enviar Evaluación Anónima")

if enviar:
    # Creamos el registro con fecha y hora
    datos = {
        "Fecha": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
        "Area": area_detectada,
        "Resultado_P1": p1,
        "Resultado_P2": p2
    }
    
    # Guardar en Excel (CSV)
    df = pd.DataFrame([datos])
    archivo = 'reporte_rh_psyqus.csv'
    
    if not os.path.isfile(archivo):
        df.to_csv(archivo, index=False)
    else:
        df.to_csv(archivo, mode='a', header=False, index=False)
        
    st.success("¡Enviado! Tu anonimato está protegido.")
    st.balloons()
