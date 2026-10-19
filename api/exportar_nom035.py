from http.server import BaseHTTPRequestHandler
import io
import json
import xlsxwriter


class handler(BaseHTTPRequestHandler):

    def do_POST(self):
        try:
            content_length = int(
                self.headers.get("Content-Length", 0)
            )

            body = self.rfile.read(content_length)

            data = json.loads(body.decode("utf-8"))

            preguntas = data.get("preguntas", [])

            output = io.BytesIO()

            workbook = xlsxwriter.Workbook(
                output,
                {"in_memory": True}
            )

            hoja = workbook.add_worksheet(
                "Graficas NOM035"
            )

            titulo = workbook.add_format({
                "bold": True,
                "font_size": 16,
            })

            texto = workbook.add_format({
                "text_wrap": True,
                "valign": "top",
            })

            header = workbook.add_format({
                "bold": True,
                "bg_color": "#D9EAF7",
                "border": 1,
            })

            porcentaje = workbook.add_format({
                "num_format": "0.0%"
            })

            hoja.set_column("A:A", 22)
            hoja.set_column("B:B", 14)
            hoja.set_column("C:C", 14)
            hoja.set_column("D:H", 18)

            fila = 0

            for item in preguntas:

                pregunta = str(
                    item.get("pregunta", "")
                )

                pregunta_texto = item.get(
                    "texto",
                    ""
                )

                respuestas = item.get(
                    "respuestas",
                    {}
                )

                hoja.merge_range(
                    fila,
                    0,
                    fila,
                    7,
                    f"Pregunta {pregunta}",
                    titulo,
                )

                fila += 1

                hoja.merge_range(
                    fila,
                    0,
                    fila + 1,
                    7,
                    pregunta_texto,
                    texto,
                )

                fila += 3

                fila_encabezado = fila

                hoja.write(
                    fila,
                    0,
                    "Respuesta",
                    header,
                )

                hoja.write(
                    fila,
                    1,
                    "Cantidad",
                    header,
                )

                hoja.write(
                    fila,
                    2,
                    "Porcentaje",
                    header,
                )

                fila += 1

                total = sum(
                    int(valor or 0)
                    for valor in respuestas.values()
                )

                inicio_respuestas = fila

                for respuesta, cantidad in respuestas.items():

                    cantidad = int(
                        cantidad or 0
                    )

                    hoja.write(
                        fila,
                        0,
                        respuesta,
                    )

                    hoja.write(
                        fila,
                        1,
                        cantidad,
                    )

                    porcentaje_valor = (
                        cantidad / total
                        if total > 0
                        else 0
                    )

                    hoja.write(
                        fila,
                        2,
                        porcentaje_valor,
                        porcentaje,
                    )

                    fila += 1

                fin_respuestas = fila - 1

                chart = workbook.add_chart({
                    "type": "pie"
                })

                chart.add_series({
                    "categories": [
                        "Graficas NOM035",
                        inicio_respuestas,
                        0,
                        fin_respuestas,
                        0,
                    ],

                    "values": [
                        "Graficas NOM035",
                        inicio_respuestas,
                        1,
                        fin_respuestas,
                        1,
                    ],

                    "data_labels": {
                        "percentage": True,
                        "category": True,
                        "leader_lines": True,
                    },
                })

                chart.set_title({
                    "name":
                        f"Pregunta {pregunta}"
                })

                chart.set_legend({
                    "position": "right"
                })

                chart.set_style(10)

                hoja.insert_chart(
                    fila_encabezado,
                    4,
                    chart,
                    {
                        "x_scale": 1.4,
                        "y_scale": 1.4,
                    },
                )

                fila += 22

            workbook.close()

            output.seek(0)

            archivo = output.getvalue()

            self.send_response(200)

            self.send_header(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            )

            self.send_header(
                "Content-Disposition",
                'attachment; filename="Psyqus_NOM035_Graficas_Editables.xlsx"',
            )

            self.send_header(
                "Content-Length",
                str(len(archivo)),
            )

            self.end_headers()

            self.wfile.write(archivo)

        except Exception as error:

            mensaje = json.dumps({
                "error": str(error)
            }).encode("utf-8")

            self.send_response(500)

            self.send_header(
                "Content-Type",
                "application/json"
            )

            self.send_header(
                "Content-Length",
                str(len(mensaje))
            )

            self.end_headers()

            self.wfile.write(mensaje)
