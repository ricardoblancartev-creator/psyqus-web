import win32com.client as win32
import os
import time
from tkinter import Tk, filedialog

# ============================================================
# 1. SELECCIONAR EL EXCEL
# ============================================================

root = Tk()
root.withdraw()

archivo_excel = filedialog.askopenfilename(
    title="Selecciona el Excel de gráficas NOM-035",
    filetypes=[("Archivos de Excel", "*.xlsx *.xlsm *.xls")]
)

root.destroy()

if not archivo_excel:
    print("No seleccionaste ningún archivo.")
    raise SystemExit

archivo_excel = os.path.abspath(archivo_excel)

# ============================================================
# 2. ABRIR EXCEL
# ============================================================

excel = win32.Dispatch("Excel.Application")
excel.Visible = False
excel.DisplayAlerts = False

workbook = excel.Workbooks.Open(archivo_excel)

try:
    worksheet = workbook.Worksheets("Graficas NOM035")
except:
    workbook.Close(False)
    excel.Quit()
    print("ERROR: No existe la hoja 'Graficas NOM035'")
    raise SystemExit

graficas = worksheet.ChartObjects()

print(f"Gráficas encontradas: {graficas.Count}")

if graficas.Count == 0:
    workbook.Close(False)
    excel.Quit()
    print("ERROR: No encontré gráficas en esa hoja.")
    raise SystemExit

# ============================================================
# 3. ABRIR WORD
# ============================================================

word = win32.Dispatch("Word.Application")
word.Visible = True

doc = word.Documents.Add()

# Márgenes
section = doc.Sections(1)
page_setup = section.PageSetup

page_setup.TopMargin = 42.52
page_setup.BottomMargin = 42.52
page_setup.LeftMargin = 51.02
page_setup.RightMargin = 51.02



# ============================================================
# 4. TÍTULO DEL DOCUMENTO
# ============================================================

selection = word.Selection

selection.ParagraphFormat.Alignment = 1
selection.Font.Name = "Arial"
selection.Font.Size = 18
selection.Font.Bold = True
selection.TypeText("Resultados NOM-035")
selection.TypeParagraph()

selection.Font.Size = 11
selection.Font.Bold = False
selection.TypeText("Desglose por pregunta")
selection.TypeParagraph()
selection.TypeParagraph()

# ============================================================
# 5. RECORRER TODAS LAS GRÁFICAS
# ============================================================

for i in range(1, graficas.Count + 1):

    chart_obj = graficas.Item(i)

    # La gráfica está colocada a la altura de la pregunta.
    fila = chart_obj.TopLeftCell.Row

    # Buscar hacia arriba el título "Pregunta..."
    titulo = f"Pregunta {i}"
    texto_pregunta = ""

    for fila_busqueda in range(fila, max(0, fila - 12), -1):

        valor = worksheet.Cells(fila_busqueda, 1).Value

        if valor:
            valor_texto = str(valor).strip()

            if valor_texto.lower().startswith("pregunta"):
                titulo = valor_texto

                # El enunciado está normalmente debajo del título
                siguiente = worksheet.Cells(
                    fila_busqueda + 1, 1
                ).Value

                if siguiente:
                    texto_pregunta = str(siguiente).strip()

                break

    print(f"Procesando {i}/{graficas.Count}: {titulo}")

    # --------------------------------------------------------
    # TÍTULO DE LA PREGUNTA
    # --------------------------------------------------------

    selection = word.Selection
    selection.EndKey(Unit=6)

    selection.ParagraphFormat.Alignment = 0

    selection.Font.Name = "Arial"
    selection.Font.Size = 14
    selection.Font.Bold = True

    selection.TypeText(titulo)
    selection.TypeParagraph()

    # --------------------------------------------------------
    # TEXTO DE LA PREGUNTA
    # --------------------------------------------------------

    selection.Font.Size = 10
    selection.Font.Bold = False

    if texto_pregunta:
        selection.TypeText(texto_pregunta)
        selection.TypeParagraph()

    selection.TypeParagraph()

    # --------------------------------------------------------
    # COPIAR GRÁFICA NATIVA DE EXCEL
    # --------------------------------------------------------

    chart_obj.Copy()

    time.sleep(0.3)

    selection = word.Selection
    selection.EndKey(Unit=6)

    # Pegado OLE: conserva el objeto de Excel
    try:
        selection.PasteSpecial(
            Link=False,
            DataType=0,
            Placement=0,
            DisplayAsIcon=False
        )
    except:
        # Si PasteSpecial falla, Word usa pegado estándar
        selection.Paste()

    selection.TypeParagraph()
    selection.TypeParagraph()

    # Salto de página entre gráficas
    if i < graficas.Count:
        selection.InsertBreak(7)

# ============================================================
# 6. GUARDAR WORD
# ============================================================

carpeta = os.path.dirname(archivo_excel)

salida = os.path.join(
    carpeta,
    "Psyqus_NOM035_Graficas_Word_Editable.docx"
)

doc.SaveAs2(salida)

print("")
print("========================================")
print("WORD CREADO CORRECTAMENTE")
print("========================================")
print(salida)
print("")
print(f"Total de gráficas: {graficas.Count}")

workbook.Close(False)
excel.Quit()
