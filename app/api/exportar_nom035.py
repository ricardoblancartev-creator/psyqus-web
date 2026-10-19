import io
import json
import xlsxwriter

def handler(request):
    try:
        body = request.json()

        preguntas = body.get("preguntas", [])

        output = io.BytesIO()

        workbook = xlsxwriter.Workbook(output, {"in_memory": True})

        titulo_fmt = workbook.add_format({
            "bold": True,
            "font_size": 16,
        })

        texto_fmt = workbook.add_format({
            "text_wrap": True,
            "valign": "top",
        })

        encabezado_fmt = workbook.add_format({
            "bold": True,
            "bg_color": "#D9EAF7",
            "border": 1,
        })

        porcentaje_fmt = workbook.add_format({
            "num_format": "0.0%",
        })

        hoja = workbook.add_worksheet("Graficas NOM035")

        hoja.set_column("A:A", 20)
        hoja.set_column("B:B", 18)
        hoja.set_column("C:C", 18)
        hoja.set_column("D:H", 18)

        fila = 0

        for item in preguntas:
            pregunta = str(item.get("pregunta", ""))
            texto = item.get("texto", "")
            respuestas = item.get("respuestas", {})

            hoja.merge_range(
                fila,
                0,
                fila,
                7,
                f"Pregunta {pregunta}",
                titulo_fmt,
            )

            fila += 1

            hoja.merge_range(
                fila,
                0,
                fila + 1,
                7,
                texto,
                texto_fmt,
            )

            fila += 3

            inicio_datos = fila

            hoja.write(fila, 0, "Respuesta", encabezado_fmt)
            hoja.write(fila, 1, "Cantidad", encabezado_fmt)
            hoja.write(fila, 2, "Porcentaje", encabezado_fmt)

            fila += 1

            total = sum(
                int(v or 0)
                for v in respuestas.values()
            )

            fila_inicio_respuestas = fila

            for respuesta, cantidad in respuestas.items():
                cantidad = int(cantidad or 0)

                hoja.write(fila, 0, respuesta)
                hoja.write(fila, 1, cantidad)

                porcentaje = (
                    cantidad / total
                    if total > 0
                    else 0
                )

                hoja.write(
                    fila,
                    2,
                    porcentaje,
                    porcentaje_fmt,
                )

                fila += 1

            fila_fin_respuestas = fila - 1

            chart = workbook.add_chart({"type": "pie"})

        chart.add_series({
            "name": f"Pregunta {pregunta}",
            "categories": [
                "Graficas NOM035",
                fila_inicio_respuestas,
                0,
                fila - 1,
                0,
            ],
            "values": [
                "Graficas NOM035",
                fila_inicio_respuestas,
                1,
                fila - 1,
                1,
            ],
            "data_labels": {
                "category": True,
                "value": True,
                "percentage": True,
                "leader_lines": True,
                "separator": "\n",
            },
        })

        chart.set_title({
            "name": f"Pregunta {pregunta}"
        })

        chart.set_legend({
            "position": "right"
        })

        chart.set_style(10)

        chart.set_size({
            "width": 620,
            "height": 380,
        })

        hoja.insert_chart(
            fila - len(respuestas) - 4,
            4,
            chart,
            {
                "x_scale": 1.0,
                "y_scale": 1.0,
            },
        )

        fila += 20

        workbook.close()

        output.seek(0)

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type":
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition":
                    'attachment; filename="Psyqus_NOM035_Graficas_Editables.xlsx"',
            },
            "body": output.getvalue(),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(e)
            }),
        }
