from pathlib import Path
import math
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "public" / "shorts"
OUT.mkdir(parents=True, exist_ok=True)

W, H = 720, 1280
FPS, SECONDS = 24, 24

VIDEOS = [
    (
        "enfoque.mp4",
        "RECUPERAR EL ENFOQUE",
        [
            (
                "¿Todo parece\nurgente?",
                "Haz una pausa antes de saltar a la siguiente tarea.",
            ),
            (
                "Hazlo\nvisible.",
                "Anota tres pendientes que tengas en la cabeza.",
            ),
            (
                "Elige\nuno.",
                "¿Cuál necesita avanzar primero? Empieza por ese.",
            ),
            (
                "Un paso\na la vez.",
                "Trabaja en él hasta tu próxima pausa. Luego revisa lo que sigue.",
            ),
        ],
    ),
    (
        "pausa.mp4",
        "UNA PAUSA PARA TI",
        [
            (
                "Tu pausa\nempieza aquí.",
                "Durante unos momentos, deja a un lado lo que estabas haciendo.",
            ),
            (
                "Suelta\nla tensión.",
                "Baja los hombros y afloja las manos, sin forzar.",
            ),
            (
                "Respira\na tu ritmo.",
                "No hace falta seguir un conteo. Tómate este momento.",
            ),
            (
                "Vuelve\ncon calma.",
                "Elige una sola cosa con la que quieras continuar.",
            ),
        ],
    ),
    (
        "cierre.mp4",
        "CERRAR LA JORNADA",
        [
            (
                "Terminó\nla jornada.",
                "A veces, la cabeza sigue trabajando aunque ya hayas salido.",
            ),
            (
                "Anota lo\npendiente.",
                "Déjalo por escrito para no tener que repasarlo una y otra vez.",
            ),
            (
                "Prepara\nel primer paso.",
                "Escribe con qué tarea empezarás mañana.",
            ),
            (
                "Por hoy,\ncierra aquí.",
                "El trabajo pendiente puede quedarse en la lista.",
            ),
        ],
    ),
]


def font(size, bold=False):
    if bold:
        candidates = [
            "C:/Windows/Fonts/seguisb.ttf",
            "C:/Windows/Fonts/arialbd.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        ]
    else:
        candidates = [
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        ]

    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)

    raise RuntimeError("No se encontró una fuente compatible.")


def wrap(draw, text, face, width):
    lines = []

    for paragraph in text.split("\n"):
        line = ""

        for word in paragraph.split():
            proposed = (line + " " + word).strip()

            if line and draw.textlength(proposed, font=face) > width:
                lines.append(line)
                line = word
            else:
                line = proposed

        lines.append(line)

    return "\n".join(lines)


def main():
    ffmpeg = shutil.which("ffmpeg")

    if not ffmpeg:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    title_font = font(72, True)
    body_font = font(34)
    brand_font = font(28, True)
    label_font = font(21, True)
    footer_font = font(22)

    base = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(base)

    for y in range(H):
        ratio = y / H
        draw.line(
            (0, y, W, y),
            fill=(
                int(3 + 4 * ratio),
                int(9 + 12 * ratio),
                int(23 + 20 * ratio),
            ),
        )

    for filename, category, scenes in VIDEOS:
        target = OUT / filename
        temporary = OUT / (target.stem + ".tmp.mp4")

        command = [
            ffmpeg,
            "-y",
            "-loglevel", "error",
            "-f", "rawvideo",
            "-pix_fmt", "rgb24",
            "-s", f"{W}x{H}",
            "-r", str(FPS),
            "-i", "-",
            "-an",
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            str(temporary),
        ]

        print("Creando", filename, flush=True)
        process = subprocess.Popen(command, stdin=subprocess.PIPE)

        try:
            for frame_number in range(FPS * SECONDS):
                t = frame_number / FPS
                scene_index = min(int(t // 6), len(scenes) - 1)
                local_time = t % 6

                opacity = min(
                    1.0,
                    local_time / 0.35,
                    (6 - local_time) / 0.35,
                )

                image = base.copy().convert("RGBA")
                d = ImageDraw.Draw(image)

                radius = int(
                    122 + 24 * math.sin(t * math.pi / 4)
                )

                d.ellipse(
                    (
                        W // 2 - radius,
                        990 - radius,
                        W // 2 + radius,
                        990 + radius,
                    ),
                    outline="#2dd4d3",
                    width=3,
                )

                d.ellipse(
                    (W // 2 - 84, 906, W // 2 + 84, 1074),
                    outline="#16556c",
                    width=2,
                )

                d.text(
                    (52, 65),
                    "PSYQUS",
                    font=brand_font,
                    fill="#67e8f9",
                )

                d.text(
                    (52, 124),
                    category,
                    font=label_font,
                    fill="#94a3b8",
                )

                overlay = Image.new(
                    "RGBA", (W, H), (0, 0, 0, 0)
                )
                text_draw = ImageDraw.Draw(overlay)

                heading, body = scenes[scene_index]
                offset = int(16 * (1 - opacity))

                text_draw.multiline_text(
                    (52, 320 + offset),
                    heading,
                    font=title_font,
                    spacing=10,
                    fill=(248, 250, 252, int(255 * opacity)),
                )

                text_draw.multiline_text(
                    (52, 590 + offset),
                    wrap(text_draw, body, body_font, W - 104),
                    font=body_font,
                    spacing=12,
                    fill=(203, 213, 225, int(255 * opacity)),
                )

                image = Image.alpha_composite(image, overlay)
                d = ImageDraw.Draw(image)

                for index in range(4):
                    x = 52 + index * 160

                    d.rounded_rectangle(
                        (x, 240, x + 140, 245),
                        radius=2,
                        fill="#164e63",
                    )

                    progress = (
                        1
                        if index < scene_index
                        else local_time / 6
                        if index == scene_index
                        else 0
                    )

                    if progress:
                        d.rounded_rectangle(
                            (x, 240, x + int(140 * progress), 245),
                            radius=2,
                            fill="#67e8f9",
                        )

                d.text(
                    (52, 1190),
                    "Un momento para tu bienestar.",
                    font=footer_font,
                    fill="#94a3b8",
                )

                process.stdin.write(
                    image.convert("RGB").tobytes()
                )

            process.stdin.close()

            if process.wait() != 0:
                raise RuntimeError(
                    "No se pudo crear " + filename
                )

            temporary.replace(target)

        except BaseException:
            process.kill()
            process.wait()
            raise

        print("Listo:", target, flush=True)

    print("Los tres videos están en public/shorts.")


if __name__ == "__main__":
    main()
