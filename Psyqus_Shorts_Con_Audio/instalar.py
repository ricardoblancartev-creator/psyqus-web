from pathlib import Path
from datetime import datetime
import hashlib,json,re,shutil,subprocess,sys
BASE=Path(__file__).resolve().parent

def main():
 candidates=[BASE,*BASE.parents,Path.cwd(),Path('C:/dev/psyqus-web')]
 root=next((p for p in candidates if (p/'package.json').is_file() and (p/'app/shorts/page.tsx').is_file()),None)
 if root is None:raise RuntimeError('Coloca la carpeta del paquete dentro de C:/dev/psyqus-web y vuelve a ejecutar instalar.py.')
 ffmpeg=shutil.which('ffmpeg')
 if not ffmpeg:
  try:
   import imageio_ffmpeg
   ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
  except ImportError:raise RuntimeError('Primero ejecuta: py -m pip install imageio-ffmpeg')
 manifest=json.loads((BASE/'manifest.json').read_text(encoding='utf-8'))
 backup=root/'respaldos_shorts'/datetime.now().strftime('%Y%m%d-%H%M%S')
 backup.mkdir(parents=True,exist_ok=True)
 for item in manifest['files']:
  src=BASE/item['path'];dest=root/item['path']
  if hashlib.sha256(src.read_bytes()).hexdigest()!=item['sha256']:raise RuntimeError('Archivo incompleto: '+str(src))
  if dest.exists():
   old=backup/item['path'];old.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(dest,old)
  dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
  if dest.suffix.lower()=='.mp4':
   test=subprocess.run([ffmpeg,'-hide_banner','-i',str(dest),'-t','0.15','-f','null','-'],capture_output=True,text=True,encoding='utf-8',errors='replace')
   if test.returncode or not re.search(r'Stream[^\n]*Audio:',test.stderr):raise RuntimeError('No se confirmó audio reproducible: '+str(dest))
   print('VIDEO + AUDIO verificados:',dest.name,flush=True)
 page=root/'app/shorts/page.tsx';source=page.read_text(encoding='utf-8-sig')
 marker=re.search(r'const\s+SHORTS_LOCALES\s*:\s*Short\[\]\s*=\s*\[',source)
 entries=[v for v in manifest['new_entries'] if v['video_url'] not in source]
 if entries and marker:
  shutil.copy2(page,backup/'page.tsx.bak')
  pos=marker.end();source=source[:pos]+'\n'+',\n'.join(json.dumps(v,ensure_ascii=False) for v in entries)+',\n'+source[pos:]
  if 'poster_url?: string;' not in source:source=source.replace('type Short = {','type Short = {\n  poster_url?: string;')
  if 'poster={short.poster_url' not in source:source=source.replace('src={short.video_url}', 'src={short.video_url} poster={short.poster_url || undefined}')
  page.write_text(source,encoding='utf-8');print('Las 3 lecciones se agregaron al catálogo local.')
 elif entries:
  dest=root/'catalogo_meditacion.json';dest.write_text(json.dumps(manifest['new_entries'],ensure_ascii=False,indent=2),encoding='utf-8')
  print('PENDIENTE: cambió la estructura del reproductor. Integra catalogo_meditacion.json al catálogo actual; no modifiqué page.tsx.')
 print('Instalación de archivos terminada. Respaldo:',backup)
 print('Prueba ahora /shorts y pulsa Activar sonido. El inicio silenciado permite la reproducción automática del navegador.')
 print('Los generadores antiguos con -an no fueron ejecutados: deben actualizarse antes de volver a generar estos MP4.')

if __name__=='__main__':
 try:main()
 except Exception as error:print('ERROR:',error);sys.exit(1)
