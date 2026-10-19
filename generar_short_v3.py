
from pathlib import Path
import asyncio
import json
import math
import subprocess
import tempfile
import shutil
import sys
import wave

try:
    import edge_tts
    from PIL import Image, ImageDraw, ImageFont, ImageFilter
except ImportError:
    print('Instala dependencias: python -m pip install edge-tts pillow')
    sys.exit(1)

ROOT = Path(__file__).resolve().parent

OUT = ROOT / 'shorts_generados'
OUT.mkdir(exist_ok=True)
OUTPUT = OUT / 'psyqus_desconexion_v3.mp4'
W, H, FPS = 720, 1280, 30
VOICE = 'es-MX-JorgeNeural'
SCENES = [
    ('¿Tu cuerpo ya llegó a casa, pero tu cabeza sigue trabajando?', 'DESCONEXIÓN', '01'),
    ('No necesitas resolver mañana desde hoy.', 'DESCANSO', '02'),
    ('Antes de terminar tu jornada, anota lo que quedó pendiente.', 'ORGANIZA', '03'),
    ('Elige qué será lo primero que atenderás mañana.', 'PRIORIZA', '04'),
    ('Después haz una transición: camina, respira o cambia de espacio.', 'TRANSICIÓN', '05'),
    ('Tu jornada terminó. Dale una señal clara a tu mente.', 'CIERRE', '06'),
]

def run(cmd):
    subprocess.run(cmd, check=True)

def duration(path):
    p = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration',
         '-of', 'default=noprint_wrappers=1:nokey=1', str(path)],
        capture_output=True, text=True, check=True
    )
    return float(p.stdout.strip())

def font(size, bold=False):
    candidates = [
        r'C:\Windows\Fonts\segoeuib.ttf' if bold else r'C:\Windows\Fonts\segoeui.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]
    for p in candidates:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def wrap(draw, text, f, max_width):
    lines, current = [], ''
    for word in text.split():
        trial = (current + ' ' + word).strip()
        if draw.textbbox((0, 0), trial, font=f)[2] <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines

def artwork(text, category, number, path):
    im = Image.new('RGB', (W, H))
    px = im.load()
    for y in range(H):
        for x in range(W):
            glow = max(0, 1 - math.hypot(x-W*.82, y-H*.29)/(W*.83))
            glow2 = max(0, 1 - math.hypot(x-W*.15, y-H*.76)/(W*.78))
            px[x, y] = (
                int(3 + 4*glow),
                int(11 + 39*glow + 17*glow2),
                int(28 + 60*glow + 30*glow2)
            )

    overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    d.ellipse((W*.20, H*.15, W*1.20, H*.71),
              outline=(51, 214, 226, 90), width=3)
    d.ellipse((W*.31, H*.20, W*1.07, H*.64),
              outline=(51, 214, 226, 45), width=2)

    d.rounded_rectangle(
        (50, 74, W-50, 150), radius=25,
        fill=(11, 38, 54, 180),
        outline=(76, 215, 228, 90), width=2
    )
    d.text((72, 91), 'PSYQUS  /  SHORTS',
           font=font(26, True), fill=(127, 238, 247, 255))

    d.text((54, 380), category,
           font=font(26, True), fill=(108, 231, 243, 255))

    f = font(57, True)
    lines = wrap(d, text, f, W-105)
    y = 470
    for line in lines:
        d.text((54, y), line, font=f, fill='white',
               stroke_width=1, stroke_fill=(5, 20, 32))
        y += 78

    d.rounded_rectangle(
        (52, H-170, W-52, H-102),
        radius=18, fill=(10, 38, 51, 220)
    )
    d.text((75, H-152), 'BIENESTAR EN TU DÍA A DÍA',
           font=font(23, True), fill=(205, 240, 247, 255))
    d.text((W-100, H-85), number,
           font=font(24, True), fill=(107, 219, 230, 255))

    im = Image.alpha_composite(im.convert('RGBA'), overlay).convert('RGB')
    im.save(path, quality=92)

async def main():
    print('PSYQUS SHORT FACTORY V3')

    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        segments = []

        for i, (text, cat, num) in enumerate(SCENES):
            print(f'Escena {i+1}/{len(SCENES)}: voz y visual...')

            mp3 = tmp / f'voice{i}.mp3'
            await edge_tts.Communicate(
                text=text, voice=VOICE, rate='-4%'
            ).save(str(mp3))

            seconds = duration(mp3) + 0.55

            image = tmp / f'image{i}.jpg'
            artwork(text, cat, num, image)

            part = tmp / f'part{i}.mp4'

            run([
                'ffmpeg', '-y',
                '-loop', '1',
                '-framerate', str(FPS),
                '-i', str(image),
                '-i', str(mp3),
                '-filter_complex',
                '[0:v]scale=800:1424,'
                'crop=720:1280:x=(in_w-out_w)/2:y=(in_h-out_h)/2,'
                'zoompan=z=min(zoom+0.0003\\,1.045):d=1:s=720x1280:fps=30,'
                'format=yuv420p[v];'
                '[1:a]apad=pad_dur=1[a]',
                '-map', '[v]',
                '-map', '[a]',
                '-t', f'{seconds:.3f}',
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-crf', '23',
                '-r', str(FPS),
                '-c:a', 'aac',
                '-b:a', '128k',
                str(part)
            ])

            segments.append(part)

        concat = tmp / 'concat.txt'
        concat.write_text(
            ''.join(
                "file '" + str(p).replace('\\', '/') + "'\n"
                for p in segments
            ),
            encoding='utf-8'
        )

        run([
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat),
            '-c', 'copy',
            str(OUTPUT)
        ])

    print('LISTO:', OUTPUT)
    print('Duración:', round(duration(OUTPUT), 1), 'segundos')

if __name__ == '__main__':
    asyncio.run(main())

