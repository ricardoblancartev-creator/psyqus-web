from pathlib import Path
from functools import lru_cache
from PIL import Image, ImageDraw, ImageFont
import json
import math
import re
import shutil
import subprocess
from datetime import datetime
import os

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "public" / "shorts"

W, H, FPS, DUR = 720, 1280, 18, 7

VIDEOS = [
    ("estres-senales", "Estrés", "Tu estrés puede avisar antes", [
        ("¿Todo te irrita?",
         "Hoy te cuesta concentrarte y hasta un mensaje pequeño te pesa.",
         "Otra cosa más…", "busy"),
        ("Observa qué cambió",
         "Con estrés puede haber irritabilidad, tensión o problemas de sueño.",
         "¿Cómo he estado?", "solo"),
        ("Busca el detonante",
         "¿Qué pasó antes? Anota qué te está exigiendo más de lo que puedes dar.",
         "Son tres urgencias.", "busy"),
        ("Actúa antes de seguir",
         "Revisa la carga y pide apoyo. Si persiste o afecta tu día, busca ayuda profesional.",
         "Necesito priorizar.", "team"),
    ]),

    ("anticipar-saturacion", "Estrés", "Antes de llegar al límite", [
        ("Ya tenías el día lleno",
         "Te llega otro pendiente y dices que sí sin revisar lo que ya tienes.",
         "También para hoy.", "busy"),
        ("Mira tu capacidad",
         "Anota lo pendiente y cuánto tiempo tienes de verdad. Incluye tus pausas.",
         "Hoy caben dos.", "solo"),
        ("Haz visible el límite",
         "Propón un orden y confirma qué se puede mover.",
         "¿Cuál va primero?", "team"),
        ("Ajusten la carga",
         "Una pausa puede ayudarte. También hacen falta prioridades y recursos realistas.",
         "Esto pasa a mañana.", "team"),
    ]),

    ("companeros-acuerdos", "Convivencia", "Llevarse bien también se acuerda", [
        ("Otra vez faltó el dato",
         "Tu compañero entrega tarde y tú terminas corrigiendo todo.",
         "Me faltó avisarte.", "team"),
        ("Pregunta antes de asumir",
         "Hablen de lo que pasó, sin adivinar intenciones ni atacar a la persona.",
         "¿Qué se complicó?", "team"),
        ("Aterriza el acuerdo",
         "Definan quién entrega qué, para cuándo y por qué canal.",
         "El archivo, a las 3.", "team"),
        ("Confirmen y revisen",
         "Repite el acuerdo y avisa a tiempo si algo cambia. El respeto es de ambos lados.",
         "Te aviso si cambia.", "team"),
    ]),

    ("chat-malentendidos", "Convivencia", "Un mensaje seco no cuenta todo", [
        ("“Ok.” Y nada más",
         "Lees el mensaje y piensas: seguro está enojado conmigo.",
         "Ok.", "chat"),
        ("Separa dato e idea",
         "Dato: escribió “Ok”. Idea: está molesto. El texto no confirma esa intención.",
         "¿Lo estoy suponiendo?", "chat"),
        ("Aclara sin acusar",
         "Si necesitas confirmar algo, pregunta por el trabajo concreto.",
         "¿Seguimos con el plan?", "team"),
        ("Cambia de canal",
         "Si siguen los malentendidos, propón una conversación breve y acuerden el siguiente paso.",
         "¿Lo vemos dos minutos?", "team"),
    ]),

    ("pedir-con-asertividad", "Comunicación", "Pedir un cambio sin atacar", [
        ("“Tú nunca escuchas”",
         "La conversación se vuelve una pelea y lo que necesitas queda perdido.",
         "¡Siempre haces igual!", "conflict"),
        ("Describe lo concreto",
         "Habla de una conducta que puedas señalar, sin “siempre” o “nunca”.",
         "Ayer me interrumpiste.", "team"),
        ("Explica el impacto",
         "Di cómo te afecta y qué necesitas para continuar.",
         "Necesito terminar la idea.", "team"),
        ("Pide algo observable",
         "Haz una petición concreta y escucha la respuesta. Ser claro también es respetuoso.",
         "¿Me das un minuto?", "team"),
    ]),

    ("poner-limites", "Comunicación", "Decir que no sin pelear", [
        ("“Hazlo tú, es rápido”",
         "Ya tienes dos entregas y te pasan una tercera.",
         "Es para ahorita.", "busy"),
        ("Di con qué cuentas",
         "Un límite puede ser breve. No necesitas justificar cada minuto de tu día.",
         "Tengo dos entregas.", "solo"),
        ("Ofrece lo que sí puedes",
         "Si hay margen, propón otra fecha o revisen qué tarea se mueve.",
         "Puedo mañana a las 10.", "team"),
        ("Sostén el acuerdo",
         "Si insisten, repite tu disponibilidad con calma y pide definir prioridades.",
         "¿Qué entrega movemos?", "team"),
    ]),

    ("reconocer-violencia", "Buen trato", "No todo es una broma", [
        ("“No aguantas nada”",
         "Se burlan de ti delante del equipo y después dicen que era jugando.",
         "Era broma…", "conflict"),
        ("Mira la conducta",
         "Humillar, amenazar o hacer comentarios sexuales no deseados son señales de alerta.",
         "Eso me incomoda.", "conflict"),
        ("Tu seguridad va primero",
         "Si hay riesgo, aléjate y busca apoyo. No tienes que confrontar a la persona.",
         "Voy a pedir apoyo.", "support"),
        ("No tienes que esperar",
         "Si es seguro, guarda registros y usa un canal de apoyo no implicado. Puede ser un solo hecho.",
         "Quiero contar lo que pasó.", "support"),
    ]),

    ("acompanar-companero", "Buen trato", "Si un compañero te cuenta algo", [
        ("“¿Podemos hablar?”",
         "Alguien te cuenta que se siente intimidado por otra persona del trabajo.",
         "Me da miedo decirlo.", "support"),
        ("Escucha sin culpar",
         "Evita “seguro exageras” o “por qué no te defendiste”. Dale espacio para contar.",
         "Gracias por contármelo.", "support"),
        ("Pregunta qué necesita",
         "No decidas por esa persona ni difundas lo que te contó.",
         "¿Cómo puedo apoyarte?", "support"),
        ("Acompaña con cuidado",
         "Pueden buscar un canal seguro de apoyo. Si hay peligro inmediato, prioricen ponerse a salvo.",
         "¿Quieres que te acompañe?", "support"),
    ]),

    ("meditar-sin-mente-en-blanco", "Meditación", "Meditar no es dejar la mente en blanco", [
        ("La mente se distrae", "Una idea, un sonido o una preocupación puede aparecer. Notarlo también es parte de practicar.", "Me distraje.", "distraction"),
        ("Siente tus pies", "Lleva la atención al contacto de tus pies con el suelo y nota el apoyo de tu cuerpo.", "Siento el suelo.", "feet"),
        ("Vuelve con calma", "Cuando notes que te fuiste, regresa a la respiración o a las sensaciones, sin regañarte.", "Vuelvo aquí.", "calm"),
        ("Eso ya es practicar", "No necesitas hacerlo perfecto. Cada regreso amable fortalece tu atención.", "Un regreso a la vez.", "calm"),
    ]),
    ("meditacion-y-estres", "Meditación", "Cómo puede ayudar la meditación", [
        ("Observa tu ritmo", "Antes de cambiar algo, reconoce cómo está tu cuerpo y qué está pasando ahora.", "Voy más rápido.", "distraction"),
        ("Respira con espacio", "Una respiración consciente puede crear un pequeño espacio entre el estímulo y tu respuesta.", "Tengo un momento.", "breath"),
        ("Elige un ancla", "Puedes usar la respiración, los pies o los sonidos como una referencia para volver.", "Regreso a mi ancla.", "feet"),
        ("Hazlo sostenible", "Practica poco a poco. Si el estrés persiste o te rebasa, busca apoyo profesional.", "Puedo pedir apoyo.", "support"),
    ]),
    ("pausa-antes-de-responder", "Meditación", "Una pausa antes de responder", [
        ("Detén el impulso", "Un mensaje difícil puede activar una respuesta inmediata. Si es seguro, espera unos segundos.", "No responderé aún.", "distraction"),
        ("Siente y respira", "Apoya los pies, suelta los hombros y toma una respiración antes de escribir.", "Respiro primero.", "breath"),
        ("Aclara tu objetivo", "Pregúntate qué necesitas comunicar y qué tono ayudará a la conversación.", "Quiero aclararlo.", "calm"),
        ("Responde con cuidado", "Una pausa no evita todo conflicto, pero puede ayudarte a elegir una respuesta más clara y segura.", "Ahora sí puedo responder.", "support"),
    ]),


    ("enfoque", "Enfoque", "Un paso a la vez", [
        ("Elige una sola cosa", "Cuando todo parece urgente, nombra el pendiente que sí puedes atender ahora.", "Empiezo por esto.", "calm"),
        ("Quita una distracción", "Cierra una pestaña o guarda el teléfono durante unos minutos.", "Un momento a la vez.", "distraction"),
        ("Hazlo pequeño", "Define el siguiente paso visible, no toda la tarea de una vez.", "Solo el siguiente paso.", "feet"),
        ("Revisa y continúa", "Al terminar, reconoce el avance y decide qué sigue.", "Ya avancé.", "support"),
    ]),
    ("pausa", "Pausa", "Tu pausa empieza aquí", [
        ("Baja los hombros", "Haz una pausa breve y nota si estás apretando la mandíbula o las manos.", "Suelto un poco.", "breath"),
        ("Respira sin prisa", "Deja que la exhalación sea un poco más larga, sin forzarla.", "Exhalo despacio.", "breath"),
        ("Mira a tu alrededor", "Nombra tres cosas que ves y vuelve al lugar en el que estás.", "Estoy aquí.", "feet"),
        ("Vuelve a tu ritmo", "Una pausa breve también puede ser una forma de cuidar tu energía.", "Continúo con calma.", "calm"),
    ]),
    ("cierre", "Descanso", "Por hoy, cierra aquí", [
        ("Reconoce lo pendiente", "Anota lo que queda para que no tengas que sostenerlo todo en la cabeza.", "Lo dejo anotado.", "distraction"),
        ("Elige el primer paso", "Decide qué harás primero mañana y cuándo podrás hacerlo.", "Mañana empiezo aquí.", "calm"),
        ("Separa trabajo y descanso", "Cierra la pantalla si puedes y cambia de espacio o de postura.", "Ya terminé por hoy.", "feet"),
        ("Date permiso de parar", "Descansar también ayuda a recuperar atención y energía.", "Ahora puedo descansar.", "support"),
    ]),

]


@lru_cache(None)
def font(size, bold=False):
    paths = [
        "C:/Windows/Fonts/seguisb.ttf"
        if bold else "C:/Windows/Fonts/segoeui.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]

    for path in paths:
        if Path(path).exists():
            return ImageFont.truetype(path, size)

    raise RuntimeError("No encontré una fuente compatible.")


def text(draw, xy, content, size, width, color="#f4f7fc", bold=False):
    face = font(size, bold)
    lines = []
    line = ""

    for word in content.split():
        candidate = (line + " " + word).strip()

        if line and draw.textlength(candidate, font=face) > width:
            lines.append(line)
            line = word
        else:
            line = candidate

    lines.append(line)

    draw.multiline_text(
        xy, "\n".join(lines),
        font=face, fill=color, spacing=9,
    )

    return xy[1] + len(lines) * (size + 9)


def box(draw, rect, color, radius=24, outline=None):
    draw.rounded_rectangle(
        rect, radius=radius, fill=color,
        outline=outline, width=2,
    )


def person(draw, x, y, shirt, worried=False, woman=False, phase=0):
    skin = "#ba8165" if woman else "#e5b28f"
    hair = "#202737"
    draw.line((x-20, y+115, x-30, y+205), fill="#293a52", width=28)
    draw.line((x+20, y+115, x+35, y+205), fill="#293a52", width=28)
    box(draw, (x-49, y-5, x+49, y+130), shirt, 26)
    left_arm = 11 * math.sin(phase + 1.2)
    right_arm = 11 * math.sin(phase)
    left_hand = (x - 74, y + 45 + left_arm)
    right_hand = (x + 74, y + 45 + right_arm)
    draw.line((x-41, y+12, left_hand[0], left_hand[1]), fill=shirt, width=24)
    draw.ellipse((left_hand[0]-11, left_hand[1]-11, left_hand[0]+11, left_hand[1]+11), fill=skin)
    draw.line((x+41, y+12, right_hand[0], right_hand[1]), fill=shirt, width=24)
    draw.ellipse((right_hand[0]-11, right_hand[1]-11, right_hand[0]+11, right_hand[1]+11), fill=skin)
    box(draw, (x-11, y-40, x+11, y+8), skin, 8)
    if woman:
        box(draw, (x-43, y-121, x+43, y-23), hair, 28)
    draw.ellipse((x-35, y-113, x+35, y-31), fill=skin)
    draw.pieslice((x-37, y-127, x+37, y-59), 180, 360, fill=hair)
    draw.ellipse((x-35, y-93, x-22, y-71), fill=hair)
    blink = math.sin(phase * 0.6) > 0.99
    for eye in (x-13, x+13):
        if blink:
            draw.line((eye-3, y-75, eye+3, y-75), fill=hair, width=2)
        else:
            draw.ellipse((eye-2, y-78, eye+2, y-73), fill=hair)
    if worried:
        draw.line((x-20, y-87, x-7, y-82), fill=hair, width=3)
        draw.line((x+7, y-82, x+20, y-87), fill=hair, width=3)
        draw.arc((x-10, y-57, x+10, y-43), 190, 350, fill=hair, width=2)
    else:
        draw.arc((x-10, y-65, x+10, y-49), 0, 180, fill=hair, width=2)


def illustration(mode, dialogue, phase, accent):
    image = Image.new("RGB", (624, 490), "#e8edf2")
    draw = ImageDraw.Draw(image)

    draw.rectangle((0, 345, 624, 490), fill="#cdd8e2")

    box(draw, (34, 25, 194, 174), "#badce6", 12)
    draw.line((114, 25, 114, 174), fill="#eff8fc", width=6)
    draw.line((34, 100, 194, 100), fill="#eff8fc", width=6)

    box(draw, (539, 288, 585, 355), "#c28c70", 8)

    for side in (-1, 1):
        draw.ellipse(
            (557+side*17-18, 231, 557+side*17+18, 292),
            fill="#5d8d79",
        )

    draw.line((562, 255, 562, 310), fill="#5d8d79", width=5)
    draw.ellipse((545, 35, 591, 81), fill="#fffdf8")
    draw.line((568, 44, 568, 58, 580, 63), fill="#43566b", width=3)

    if mode == "chat":
        box(draw, (152, 100, 474, 458), "#24354b", 28)
        box(draw, (165, 113, 461, 440), "#f7fafc", 19)
        box(draw, (265, 120, 365, 129), "#24354b", 5)

        text(draw, (187, 154), "Equipo · trabajo", 20, 240, "#24354b", True)

        box(draw, (185, 205, 398, 264), "#d4e4ee", 15)
        text(draw, (204, 222), "Ok.", 24, 165, "#24354b")

        box(draw, (224, 297, 442, 399), "#b6ece5", 15)
        text(draw, (242, 313), dialogue, 22, 180, "#24354b")

    else:
        two = mode in ("team", "conflict", "support")

        person(
            draw, 200 if two else 280, 250,
            "#518a8e", mode in ("busy", "conflict"),
            False, phase,
        )

        if mode == "feet":
            draw.ellipse((150, 390, 246, 435), fill="#e5b28f")
            draw.ellipse((306, 390, 402, 435), fill="#e5b28f")
            draw.line((180, 360, 190, 410), fill="#518a8e", width=16)
            draw.line((370, 360, 360, 410), fill="#518a8e", width=16)
            draw.arc((120, 350, 430, 475), 180, 360, fill=accent, width=8)
        elif mode == "breath":
            draw.ellipse((165, 155, 455, 445), outline=accent, width=8)
            for radius in (60, 95, 130):
                draw.arc((310-radius, 300-radius, 310+radius, 300+radius), 200, 340, fill=accent, width=5)
        elif two:
            person(
                draw, 418, 256, "#bb866f",
                mode == "conflict", True, phase+1,
            )
        else:
            box(draw, (75, 324, 503, 351), "#a67d64", 9)

            draw.rectangle((106, 351, 125, 481), fill="#87664f")
            draw.rectangle((460, 351, 479, 481), fill="#87664f")

            box(draw, (330, 245, 470, 326), "#425b70", 10)
            draw.line((399, 324, 399, 338), fill="#24354b", width=9)

            if mode == "busy":
                for index in range(3):
                    yy = 135 + index*43 + int(3*math.sin(phase+index))

                    box(draw, (431, yy, 603, yy+35), "#f8d7c3", 10)

                    text(
                        draw, (445, yy+7),
                        ["Mensaje", "Entrega", "Reunión"][index],
                        16, 150, "#754431",
                    )

        box(draw, (42, 22, 525, 115), "#fffdf9", 19)

        draw.polygon(
            [(173, 111), (197, 111), (187, 131)],
            fill="#fffdf9",
        )

        text(draw, (62, 39), dialogue, 25, 440, "#24354b", True)

        if mode == "support":
            draw.ellipse((285, 340, 338, 393), fill=accent)
            draw.line(
                (298, 366, 309, 377, 327, 354),
                fill="#152838", width=4,
            )

    return image


def render(video, scene, seconds, total_duration):
    _, category, _, scenes = video
    heading, body, dialogue, mode = scenes[scene]

    accent = "#ffbe91" if category == "Buen trato" else "#75e0cf"

    image = Image.new("RGB", (W, H), "#0c1829")
    draw = ImageDraw.Draw(image)

    draw.text((48, 35), "PSYQUS", font=font(24, True), fill=accent)
    draw.text((48, 77), category.upper(), font=font(20, True), fill="#a8b8cd")

    text(draw, (48, 135), heading, 53, 620, bold=True)

    art = illustration(mode, dialogue, seconds*2, accent)
    image.paste(art, (48, 343))

    draw = ImageDraw.Draw(image)
    end = text(draw, (48, 871), body, 32, 584, "#e1e8f1")

    if end > 1100:
        raise RuntimeError("Texto demasiado largo: " + heading)

    for index in range(4):
        x = 48 + index*158

        box(draw, (x, 1142, x+140, 1147), "#2b3c51", 2)

        progress = (
            1 if index < scene
            else seconds / (total_duration / 4) if index == scene
            else 0
        )

        if progress:
            box(
                draw,
                (x, 1142, x+max(2, int(140*progress)), 1147),
                accent, 2,
            )

    return image


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")
    if not ffmpeg or not ffprobe:
        raise RuntimeError("Se requieren ffmpeg y ffprobe.")

    def media_duration(path):
        result = subprocess.run(
            [ffprobe, "-v", "error", "-show_entries", "format=duration",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True, check=True)
        return float(result.stdout.strip())

    def has_audio(path):
        result = subprocess.run(
            [ffprobe, "-v", "error", "-select_streams", "a:0",
             "-show_entries", "stream=codec_name",
             "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
            capture_output=True, text=True, check=True)
        return bool(result.stdout.strip())

    backup_dir = ROOT / "respaldos_shorts" / ("ilustrados-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    backup_dir.mkdir(parents=True, exist_ok=True)
    limit = int(os.environ.get("PSYQUS_SHORT_LIMIT", "0"))
    videos = VIDEOS[:limit] if limit else VIDEOS

    for video in videos:
        slug = video[0]
        target = OUT / (slug + ".mp4")
        if not target.exists() or not has_audio(target):
            raise RuntimeError("Falta MP4 fuente con audio: " + str(target))
        total_duration = media_duration(target)
        shutil.copy2(target, backup_dir / target.name)
        poster = OUT / (slug + ".jpg")
        if poster.exists():
            shutil.copy2(poster, backup_dir / poster.name)

        visual = OUT / (slug + ".visual.tmp.mp4")
        final_tmp = OUT / (slug + ".final.tmp.mp4")
        render(video, 0, 0, total_duration).save(poster, quality=90)
        args = [
            ffmpeg, "-y", "-loglevel", "error",
            "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
            "-r", str(FPS), "-i", "-",
            "-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo",
            "-map", "0:v:0", "-map", "1:a:0", "-t", f"{total_duration:.3f}",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "22",
            "-c:a", "aac", "-b:a", "32k", "-pix_fmt", "yuv420p",
            "-shortest", "-movflags", "+faststart", str(visual)]
        process = subprocess.Popen(args, stdin=subprocess.PIPE)
        try:
            frames_per_scene = max(1, round(total_duration * FPS / 4))
            for scene in range(4):
                for frame in range(frames_per_scene):
                    process.stdin.write(render(video, scene, frame / FPS, total_duration).tobytes())
            process.stdin.close()
            if process.wait() != 0:
                raise RuntimeError("Falló la codificación visual de " + slug)
            mux = [
                ffmpeg, "-y", "-loglevel", "error",
                "-i", str(visual), "-i", str(target),
                "-map", "0:v:0", "-map", "1:a:0",
                "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
                "-t", f"{total_duration:.3f}", "-movflags", "+faststart",
                str(final_tmp)]
            subprocess.run(mux, check=True)
            if not has_audio(final_tmp):
                raise RuntimeError("La salida perdió el audio: " + slug)
            output_duration = media_duration(final_tmp)
            if abs(output_duration - total_duration) > 0.25:
                raise RuntimeError(f"Duración alterada en {slug}: {output_duration} != {total_duration}")
            final_tmp.replace(target)
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()
            visual.unlink(missing_ok=True)
            final_tmp.unlink(missing_ok=True)
        print(f"OK {slug}: {total_duration:.3f}s, audio conservado, respaldo={backup_dir.name}", flush=True)
    print(f"Listo: {len(videos)} Shorts ilustrados generados con audio integrado.", flush=True)

if __name__ == "__main__":
    main()
