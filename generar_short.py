from pathlib import Path
import asyncio
import json
import subprocess
import edge_tts

# ============================================================
# PSYQUS SHORT FACTORY — V2
# Video vertical + voz + duración automática
# ============================================================

TEMA = "Desconectarte del trabajo al llegar a casa"

ESCENAS = [
    "¿Tu cuerpo ya llegó a casa, pero tu cabeza sigue trabajando?",
    "No necesitas resolver mañana desde hoy.",
    "Antes de terminar tu jornada, anota lo que quedó pendiente.",
    "Elige qué será lo primero que atenderás mañana.",
    "Después haz una transición. Camina, respira o cambia de espacio.",
    "Tu jornada terminó. Dale una señal clara a tu mente.",
]

# Voz de Microsoft Edge TTS
VOZ = "es-MX-JorgeNeural"

WIDTH = 1080
HEIGHT = 1920
FPS = 30

ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "shorts_generados"
TEMP_DIR = OUTPUT_DIR / "_temp"

OUTPUT_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "psyqus_desconexion_trabajo_v2.mp4"


def encontrar_fuente():
    posibles = [
        Path(r"C:\Windows\Fonts\segoeui.ttf"),
        Path(r"C:\Windows\Fonts\arial.ttf"),
        Path(r"C:\Windows\Fonts\calibri.ttf"),
    ]

    for fuente in posibles:
        if fuente.exists():
            return fuente

    raise FileNotFoundError(
        "No encontré una fuente compatible de Windows."
    )


def ruta_ffmpeg(path):
    return str(path).replace("\\", "/").replace(":", r"\:")


def duracion_audio(archivo):
    comando = [
        "ffprobe",
        "-v",
        "quiet",
        "-print_format",
        "json",
        "-show_format",
        str(archivo),
    ]

    resultado = subprocess.run(
        comando,
        capture_output=True,
        text=True,
        check=True,
    )

    info = json.loads(resultado.stdout)

    return float(info["format"]["duration"])


async def generar_voz(indice, texto):
    salida = TEMP_DIR / f"voz_{indice:02d}.mp3"

    print(
        f"Generando voz {indice + 1}/{len(ESCENAS)}..."
    )

    comunicador = edge_tts.Communicate(
        text=texto,
        voice=VOZ,
        rate="-4%",
        pitch="-2Hz",
    )

    await comunicador.save(str(salida))

    return salida


def crear_texto(indice, texto):
    archivo = TEMP_DIR / f"texto_{indice:02d}.txt"

    archivo.write_text(
        texto,
        encoding="utf-8"
    )

    return archivo


def generar_escena(
    indice,
    texto,
    audio,
    fuente,
):
    salida = TEMP_DIR / f"escena_{indice:02d}.mp4"

    texto_archivo = crear_texto(
        indice,
        texto
    )

    # Añadimos un pequeño espacio después de hablar
    duracion = duracion_audio(audio) + 0.45

    fuente_ffmpeg = ruta_ffmpeg(fuente)
    texto_ffmpeg = ruta_ffmpeg(texto_archivo)

    filtro = (
        f"drawbox="
        f"x=0:y=0:w={WIDTH}:h={HEIGHT}:"
        "color=0x020617:t=fill,"
        
        f"drawbox="
        f"x='-350+mod(t*65,{WIDTH + 700})':"
        f"y=0:w=550:h={HEIGHT}:"
        "color=0x0891B2@0.16:t=fill,"

        f"drawtext="
        f"fontfile='{fuente_ffmpeg}':"
        f"textfile='{texto_ffmpeg}':"
        "fontcolor=white:"
        "fontsize=70:"
        "line_spacing=24:"
        "x=(w-text_w)/2:"
        "y=(h-text_h)/2:"
        "borderw=2:"
        "bordercolor=black@0.35,"

        f"drawtext="
        f"fontfile='{fuente_ffmpeg}':"
        "text='PSYQUS':"
        "fontcolor=0x67E8F9:"
        "fontsize=34:"
        "x=(w-text_w)/2:"
        "y=170,"

        f"drawtext="
        f"fontfile='{fuente_ffmpeg}':"
        "text='BIENESTAR EN 1 MINUTO':"
        "fontcolor=white@0.60:"
        "fontsize=22:"
        "x=(w-text_w)/2:"
        "y=220"
    )

    comando = [
        "ffmpeg",
        "-y",

        "-f",
        "lavfi",
        "-i",
        f"color=c=0x020617:s={WIDTH}x{HEIGHT}:r={FPS}",

        "-i",
        str(audio),

        "-t",
        str(duracion),

        "-vf",
        filtro,

        "-map",
        "0:v:0",

        "-map",
        "1:a:0",

        "-c:v",
        "libx264",

        "-preset",
        "medium",

        "-crf",
        "20",

        "-pix_fmt",
        "yuv420p",

        "-c:a",
        "aac",

        "-b:a",
        "192k",

        "-shortest",

        str(salida),
    ]

    print(
        f"Renderizando escena {indice + 1}/{len(ESCENAS)}..."
    )

    subprocess.run(
        comando,
        check=True
    )

    return salida


def unir_escenas(archivos):
    lista = TEMP_DIR / "lista.txt"

    contenido = ""

    for archivo in archivos:
        ruta = str(
            archivo.resolve()
        ).replace("\\", "/")

        contenido += f"file '{ruta}'\n"

    lista.write_text(
        contenido,
        encoding="utf-8"
    )

    print()
    print("Uniendo escenas...")

    comando = [
        "ffmpeg",
        "-y",

        "-f",
        "concat",

        "-safe",
        "0",

        "-i",
        str(lista),

        "-c:v",
        "libx264",

        "-preset",
        "medium",

        "-crf",
        "20",

        "-c:a",
        "aac",

        "-b:a",
        "192k",

        "-pix_fmt",
        "yuv420p",

        str(OUTPUT_FILE),
    ]

    subprocess.run(
        comando,
        check=True
    )


def limpiar_temporales():
    for archivo in TEMP_DIR.glob("*"):
        try:
            archivo.unlink()
        except Exception:
            pass

    try:
        TEMP_DIR.rmdir()
    except Exception:
        pass


async def main():
    print()
    print("=" * 58)
    print("PSYQUS SHORT FACTORY — V2")
    print("=" * 58)

    print()
    print("Tema:")
    print(TEMA)
    print()

    fuente = encontrar_fuente()

    escenas_generadas = []

    for indice, texto in enumerate(ESCENAS):

        audio = await generar_voz(
            indice,
            texto
        )

        print(
            f"Duración voz: "
            f"{duracion_audio(audio):.2f}s"
        )

        escena = generar_escena(
            indice,
            texto,
            audio,
            fuente,
        )

        escenas_generadas.append(
            escena
        )

    unir_escenas(
        escenas_generadas
    )

    duracion_final = duracion_audio(
        OUTPUT_FILE
    )

    print()
    print("=" * 58)
    print("SHORT GENERADO 🔥")
    print("=" * 58)

    print()
    print(OUTPUT_FILE)

    print()
    print(
        f"Duración final: "
        f"{duracion_final:.1f} segundos"
    )

    limpiar_temporales()


if __name__ == "__main__":
    asyncio.run(main())
