import json
from pathlib import Path
import tkinter as tk
from tkinter import filedialog
import win32com.client as win32


# ==============================
# CONSTANTES WORD / EXCEL
# ==============================

WD_ALIGN_PARAGRAPH_CENTER = 1
WD_ALIGN_PARAGRAPH_LEFT = 0
WD_PAGE_BREAK = 7

XL_PIE = 5


# ==============================
# ELEGIR ARCHIVO JSON
# ==============================

root = tk.Tk()
root.withdraw()

archivo_json = filedialog.askopenfilename(
    title="Selecciona el archivo de resultados NOM-035 de Psyqus",
    filetypes=[
        ("Archivo JSON", "*.json"),
        ("Todos los archivos", "*.*"),
    ],
)

if not archivo_json:
    print("No seleccionaste ningún archivo.")
    raise SystemExit


# ==============================
# LEER DATOS
# ==============================

with open(
    archivo_json,
    "r",
    encoding="utf-8"
) as archivo:

    datos = json.load(archivo)


preguntas = datos.get("preguntas", [])

if not preguntas:
    print("El archivo no contiene preguntas.")
    raise SystemExit


print(
    f"Se encontraron {len(preguntas)} preguntas."
)


# ==============================
# INICIAR WORD
# ==============================

word = win32.Dispatch("Word.Application")

word.Visible = True

doc = word.Documents.Add()


# ==============================
# PORTADA
# ==============================

p = doc.Paragraphs.Add()

p.Range.Text = "PSYQUS"

p.Range.Bold = True
p.Range.Font.Size = 28

p.Alignment = WD_ALIGN_PARAGRAPH_CENTER


p = doc.Paragraphs.Add()

p.Range.Text = "Resultados NOM-035"

p.Range.Bold = True
p.Range.Font.Size = 22

p.Alignment = WD_ALIGN_PARAGRAPH_CENTER


p = doc.Paragraphs.Add()

p.Range.Text = (
    "Desglose gráfico por pregunta"
)

p.Range.Font.Size = 14

p.Alignment = WD_ALIGN_PARAGRAPH_CENTER


doc.Paragraphs.Add()


p = doc.Paragraphs.Add()

p.Range.Text = (
    f"Total de preguntas procesadas: "
    f"{len(preguntas)}"
)

p.Range.Font.Size = 11

p.Alignment = WD_ALIGN_PARAGRAPH_CENTER


# salto de página
rango = doc.Range(
    doc.Content.End - 1,
    doc.Content.End - 1
)

rango.InsertBreak(WD_PAGE_BREAK)


# ==============================
# CREAR UNA PÁGINA POR PREGUNTA
# ==============================

for indice, item in enumerate(
    preguntas,
    start=1
):

    numero = str(
        item.get(
            "pregunta",
            indice
        )
    )

    texto = str(
        item.get(
            "texto",
            "Pregunta NOM-035"
        )
    )

    respuestas = item.get(
        "respuestas",
        {}
    )

    if not respuestas:
        continue

    nombres_respuestas = list(
        respuestas.keys()
    )

    cantidades = [
        int(valor or 0)
        for valor
        in respuestas.values()
    ]

    total = sum(cantidades)


    # ==========================
    # TÍTULO DE PREGUNTA
    # ==========================

    p = doc.Paragraphs.Add()

    p.Range.Text = (
        f"Pregunta {numero}"
    )

    p.Range.Bold = True
    p.Range.Font.Size = 18

    p.Alignment = (
        WD_ALIGN_PARAGRAPH_LEFT
    )


    # ==========================
    # TEXTO COMPLETO
    # ==========================

    p = doc.Paragraphs.Add()

    p.Range.Text = texto

    p.Range.Font.Size = 12

    p.Range.SpaceAfter = 10


    # ==========================
    # TOTAL
    # ==========================

    p = doc.Paragraphs.Add()

    p.Range.Text = (
        f"Total de respuestas: "
        f"{total}"
    )

    p.Range.Bold = True
    p.Range.Font.Size = 10


    doc.Paragraphs.Add()


    # ==========================
    # CREAR GRÁFICA PIE NATIVA
    # ==========================

    rango = doc.Range(
        doc.Content.End - 1,
        doc.Content.End - 1
    )

    shape = (
        doc.InlineShapes.AddChart2(
            -1,
            XL_PIE,
            rango
        )
    )

    chart = shape.Chart

    chart.HasTitle = True

    chart.ChartTitle.Text = (
        f"Pregunta {numero}"
    )


    # ==========================
    # ABRIR DATOS DEL GRÁFICO
    # ==========================

    chart.ChartData.Activate()

    workbook = (
        chart.ChartData.Workbook
    )

    worksheet = (
        workbook.Worksheets(1)
    )


    # limpiar datos de ejemplo
    worksheet.Cells.Clear()


    # encabezados
    worksheet.Cells(
        1,
        1
    ).Value = "Respuesta"

    worksheet.Cells(
        1,
        2
    ).Value = "Cantidad"


    # ==========================
    # ESCRIBIR DATOS
    # ==========================

    for fila, (
        respuesta,
        cantidad
    ) in enumerate(
        zip(
            nombres_respuestas,
            cantidades
        ),
        start=2
    ):

        worksheet.Cells(
            fila,
            1
        ).Value = respuesta

        worksheet.Cells(
            fila,
            2
        ).Value = cantidad


    fila_final = (
        len(nombres_respuestas)
        + 1
    )


    # ==========================
    # VINCULAR DATOS AL CHART
    # ==========================

    series = (
        chart.SeriesCollection(1)
    )

    series.XValues = (
        worksheet.Range(
            f"A2:A{fila_final}"
        )
    )

    series.Values = (
        worksheet.Range(
            f"B2:B{fila_final}"
        )
    )

    series.Name = "Respuestas"


    # ==========================
    # ETIQUETAS
    # ==========================

    series.ApplyDataLabels()

    etiquetas = series.DataLabels()

    etiquetas.ShowCategoryName = True
    etiquetas.ShowPercentage = True
    etiquetas.ShowValue = False

    chart.HasLegend = True


    # ==========================
    # TAMAÑO
    # ==========================

    shape.Width = 430

    shape.Height = 300


    # ==========================
    # TABLA VISUAL DEBAJO
    # ==========================

    doc.Paragraphs.Add()

    p = doc.Paragraphs.Add()

    p.Range.Text = (
        "Distribución de respuestas"
    )

    p.Range.Bold = True
    p.Range.Font.Size = 11


    tabla = doc.Tables.Add(
        doc.Range(
            doc.Content.End - 1,
            doc.Content.End - 1
        ),
        len(
            nombres_respuestas
        ) + 1,
        3
    )


    tabla.Cell(
        1,
        1
    ).Range.Text = "Respuesta"

    tabla.Cell(
        1,
        2
    ).Range.Text = "Cantidad"

    tabla.Cell(
        1,
        3
    ).Range.Text = "Porcentaje"


    for fila, (
        respuesta,
        cantidad
    ) in enumerate(
        zip(
            nombres_respuestas,
            cantidades
        ),
        start=2
    ):

        porcentaje = (
            cantidad / total * 100
            if total > 0
            else 0
        )

        tabla.Cell(
            fila,
            1
        ).Range.Text = str(
            respuesta
        )

        tabla.Cell(
            fila,
            2
        ).Range.Text = str(
            cantidad
        )

        tabla.Cell(
            fila,
            3
        ).Range.Text = (
            f"{porcentaje:.1f}%"
        )


    # negritas encabezado
    for columna in range(
        1,
        4
    ):

        tabla.Cell(
            1,
            columna
        ).Range.Bold = True


    # ==========================
    # SALTO DE PÁGINA
    # ==========================

    if indice < len(preguntas):

        rango = doc.Range(
            doc.Content.End - 1,
            doc.Content.End - 1
        )

        rango.InsertBreak(
            WD_PAGE_BREAK
        )


# ==============================
# GUARDAR WORD
# ==============================

archivo_origen = Path(
    archivo_json
)

ruta_salida = (
    archivo_origen.parent
    /
    "Psyqus_NOM035_Graficas_Editables.docx"
)


doc.SaveAs2(
    str(ruta_salida)
)


print()
print("==============================")
print("WORD CREADO CORRECTAMENTE")
print("==============================")
print(ruta_salida)
print()
print(
    f"Gráficas procesadas: "
    f"{len(preguntas)}"
)
