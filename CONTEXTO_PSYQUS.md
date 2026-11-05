# Contexto de Psyqus

Documento de continuidad entre el trabajo realizado en ChatGPT y el trabajo en VS Code.

Última actualización: 2026-10-16

## Mensaje principal

> Salud mental para tu equipo. Información útil para tu empresa.

## Acuerdos de producto

- Shorts es la pantalla principal: videos verticales, uno por pantalla, desplazamiento y reproducción del activo.
- La navegación inferior debe contener: Shorts, Psyqus, Aprender, Mi bienestar y Buzón.
- El Acompañante debe ofrecer avatar de hombre o mujer, conversación con IA y acceso a cursos y herramientas.
- Los avatares deben evolucionar hacia un estilo cálido y profesional, sin estética anime.
- La psicoeducación debe cubrir estrés, convivencia, comunicación asertiva, límites y reconocimiento de violencia.
- Se conservan las evaluaciones, NOM-035, mapa de calor, pulso semanal, panel profesional y buzón.
- La landing debe presentar estas funciones y conservar el formulario conectado a `/api/prospectos`.

## Estado verificado en el repositorio

### Implementado o parcialmente incorporado

- **Shorts:** existe `app/shorts/page.tsx`, con catálogo local de videos en `public/shorts/`, tarjetas de video y controles de reproducción, pausa y volumen. La pantalla usa navegación vertical y reproduce el contenido activo.
- **Navegación inferior:** existe `components/PsyqusNavigation.tsx` con las cinco entradas acordadas: `/shorts`, `/experiencia`, `/psicoeducacion`, `/mi-bienestar` y `/buzon`.
- **Psyqus / Acompañante:** existe `app/experiencia/page.tsx` y la ruta de conversación `app/api/chat/route.ts`. La API usa el cliente OpenAI compatible con Groq y el modelo `openai/gpt-oss-120b`, sujeto a `OPENAI_API_KEY`.
- **Avatares:** existe `app/dashboard/components/Avatar3D.tsx` y hay archivos VRM en `public/avatars/` para hombre y mujer. El refinamiento de estilo cálido y profesional todavía no está certificado.
- **Psicoeducación:** existe `app/psicoeducacion/page.tsx`; también hay contenidos y Shorts relacionados con estrés, convivencia, comunicación asertiva, límites y reconocimiento de violencia.
- **Evaluaciones y NOM-035:** existen las rutas de diagnóstico, evaluación, resultados y NOM-035, además de endpoints relacionados.
- **Mapa de calor y panel profesional:** existen componentes y rutas de dashboard/panel profesional, incluidos mapas y riesgos departamentales.
- **Pulso semanal:** existe `app/pulso/page.tsx` y el endpoint `app/api/pulso/route.ts`.
- **Buzón:** existe `app/buzon/page.tsx` y su login/layout.
- **Landing:** existe `app/page.tsx`; el endpoint `app/api/prospectos/route.ts` también existe y debe conservarse como integración del formulario.

### Pendiente o por comprobar

- **Mi bienestar:** la navegación apunta a `/mi-bienestar`, pero no se encontró `app/mi-bienestar/page.tsx` en la revisión actual. Hay una carpeta local relacionada con cambios no comprometidos que debe revisarse antes de crear o mover archivos.
- **Shorts como pantalla principal:** la pantalla y los activos existen, pero falta comprobar visualmente en ejecución que el desplazamiento sea de un video por pantalla y que el activo se reproduzca correctamente en los dispositivos objetivo.
- **Acompañante:** falta comprobar en ejecución la selección hombre/mujer, la carga de los VRM, la conversación con IA y los enlaces a cursos/herramientas.
- **Avatares:** falta rediseñar o ajustar materiales, iluminación, expresiones y presentación para lograr un estilo cálido y profesional sin estética anime.
- **Contenido:** falta revisar que toda la cobertura acordada esté visible y consistente en psicoeducación, Shorts y enlaces internos.
- **Landing:** falta comprobar en ejecución el envío completo del formulario hacia `/api/prospectos`, incluyendo validación y configuración de producción.
- **Dependencias y compilación:** hay cambios locales pendientes y errores previamente registrados en `errores_psyqus.txt`; antes de corregirlos se debe preservar el estado actual y validar con una instalación/build reproducible.
- **Integración de IA:** el código está preparado para Groq mediante una API compatible; no debe confundirse con una conexión directa a un GPT personalizado de ChatGPT. Falta confirmar la variable de entorno en el entorno de ejecución sin exponer secretos.

## Estado del repositorio al documentar

No se hizo commit ni push. El repositorio contiene cambios locales existentes, incluidos cambios en páginas, componentes, configuración, scripts, videos y avatares. Esos cambios se consideran trabajo del usuario y deben conservarse.

## Registro de tareas

### 2026-10-16 — Creación del contexto

- Cambios realizados: se revisó `git status`, la estructura del proyecto, las rutas principales, la navegación, Shorts, la landing, `/api/prospectos` y la integración de chat. Se creó este documento y se añadió `AGENTS.md`.
- Comprobaciones: se verificó la existencia de las rutas y archivos mencionados y se confirmó que `/mi-bienestar/page.tsx` no está presente en el estado revisado.
- Pendientes: resolver o validar los puntos de la sección “Pendiente o por comprobar” sin revertir cambios locales.

## Regla de continuidad

Al terminar cada tarea de Psyqus, actualizar este archivo con cambios realizados, comprobaciones ejecutadas y pendientes. No hacer commit ni push salvo autorización explícita.
### 2026-10-16 — Resolución de `/mi-bienestar`

- Cambios realizados: se revisó la implementación local existente en `app/mi-binestar/page.tsx` y el dashboard `app/dashboard/ResumenBienestar.tsx`. La implementación se reubicó en `app/mi-bienestar/page.tsx` para corregir la ruta del menú sin duplicar la lógica. La página reutiliza el resumen existente, que conserva autenticación Clerk, permisos profesionales, última evaluación, dimensiones/mapa de calor, pulso semanal y accesos útiles.
- Comprobaciones: se verificó que la navegación apunta a `/mi-bienestar`; la ruta existe; `ResumenBienestar` redirige a `/sign-in` sin sesión y a `/onboarding` sin perfil; el estado sin evaluación muestra un mensaje vacío y no inventa resultados; el mapa solo aparece con dimensiones registradas; `npx tsc --noEmit` terminó correctamente.
- Pendientes: comprobar la ruta en ejecución con sesión de usuario y datos reales de Supabase, incluyendo el caso sin evaluaciones, y validar visualmente el menú inferior.
### 2026-10-16 — Comprobación de navegador de `/mi-bienestar` y `/shorts`

- Cambios realizados: no se modificó código durante esta comprobación. Se inició el servidor local y se intentó abrir `/shorts` y `/sign-in` en el navegador integrado.
- Comprobaciones reales: el servidor Next.js llegó a estado `Ready` en `http://localhost:3000`; existe `app/mi-bienestar/page.tsx`; existe el menú con el enlace `/mi-bienestar`; la carpeta `public/shorts` existe y contiene 19 archivos locales; `npx tsc --noEmit` ya había terminado correctamente en la tarea anterior.
- Bloqueos: el navegador integrado no pudo abrir `localhost`; no se obtuvo una página compartida ni un `pageId` para probar clics, desplazamiento, reproducción, pausa, sonido o cobertura visual del menú. Clerk reportó fallo de handshake/red y un posible bucle de redirección de sesión durante el arranque.
- Pendientes: abrir/compartir el navegador con `http://localhost:3000` y, para `/mi-bienestar`, iniciar sesión con Clerk si la ruta lo solicita. Después comprobar visualmente ambas rutas y los controles de video; no se corrigió código porque no hubo una falla visual reproducible.
### 2026-10-16 — Corrección de JWT vencido en bienestar

- Cambios realizados: `app/dashboard/ResumenBienestar.tsx` y `app/dashboard/page.tsx` ahora solicitan `getToken({ skipCache: true })` antes de crear el cliente autenticado de Supabase. Esto fuerza la renovación del token de Clerk cuando existe una sesión vencida y conserva la autenticación, el filtro por `userId` y los permisos profesionales.
- Comprobaciones: se confirmó que las dos llamadas usan `skipCache: true` y `npx tsc --noEmit` terminó correctamente.
- Pendientes: volver a cargar `/mi-bienestar` con una sesión Clerk válida. Si Clerk sigue mostrando `PGRST303`, cerrar sesión e iniciar sesión de nuevo, porque el navegador conserva una sesión vencida o las claves de Clerk no coinciden.
### 2026-10-16 — Audio para Shorts

- Cambios realizados: se verificó que los MP4 originales no tenían pista de audio. Se generó una cama musical ambiental original, de volumen bajo, y se crearon 11 copias con video H.264 conservado y audio AAC en `public/shorts/audio/`. `app/shorts/page.tsx` ahora usa esas copias con audio; los videos originales permanecen intactos.
- Comprobaciones: los 11 archivos con audio fueron generados; una muestra confirmó video vertical `720x1280` y una pista AAC de aproximadamente la misma duración; las 11 referencias locales de Shorts apuntan a `/shorts/audio/*.mp4`. El typecheck no tiene errores nuevos por estos cambios.
- Pendientes: probar en navegador el volumen y la reproducción real en dispositivo. El typecheck aún reporta un error preexistente de casing entre `lib/MockData.ts` y los imports `@/lib/mockData`.

### Corrección de registro — JWT de Clerk

La versión instalada de Clerk no acepta `skipCache` en `getToken`; ese intento fue retirado. Las llamadas volvieron a `getToken()` y no se conserva un error nuevo de TypeScript por esa modificación.
### 2026-10-16 — Corrección de selección de Shorts con audio

- Cambios realizados: se corrigió la mezcla entre Supabase y el catálogo local en `app/shorts/page.tsx`. Cuando Supabase devuelve la URL antigua de un video, ahora se identifica por nombre de archivo y se conserva la URL local `/shorts/audio/*.mp4`, evitando que el registro remoto sin audio reemplace al video con audio. También se ajustó el botón de sonido para actualizar el video activo y reanudarlo al activar el audio.
- Comprobaciones: se verificaron 11 archivos locales con audio AAC; se confirmó que las referencias del catálogo local apuntan a `/shorts/audio/*.mp4`; `npx tsc --noEmit` no reporta errores nuevos de Shorts. Permanece el error preexistente de casing entre `lib/MockData.ts` y los imports `@/lib/mockData`.
- Pendientes: recargar el servidor/navegador y comprobar que el botón “Activar sonido” se escuche en el Short activo. Si aún no se oye, revisar permisos de audio del navegador y que el usuario haga clic en el botón, porque el autoplay inicia silenciado por las políticas del navegador.
### 2026-10-16 — Corrección de volumen de audio en Shorts

- Cambios realizados: se midió la pista de `public/shorts/audio/estres-senales.mp4` y se detectó un volumen medio de `-58.8 dB`, prácticamente inaudible. Se regeneró la cama musical con normalización `loudnorm` a `-18 LUFS` y se volvieron a crear las 11 copias con audio AAC a `160k`.
- Comprobaciones: la muestra regenerada quedó con volumen medio aproximado de `-20.6 dB` y pico de `-11.3 dB`; conserva video H.264 vertical y pista AAC. El reproductor sigue iniciando silenciado por autoplay, pero el botón de activar sonido ahora tiene una señal audible que reproducir.
- Pendientes: recargar el navegador con `Ctrl+F5`, pulsar “Activar sonido” y confirmar la escucha real. Si no se escucha, el siguiente diagnóstico será el permiso/salida de audio del navegador o dispositivo.
### 2026-10-16 — Instalador de Shorts con narración y música

- Cambios realizados: se buscó `Psyqus_Shorts_Con_Audio.zip` en Descargas, `C:\dev` y el proyecto; no se encontró. Tampoco existe `instalar.py` en esas ubicaciones, por lo que no se extrajo ni ejecutó ningún instalador y no se modificaron los activos actuales.
- Comprobaciones: se revisaron los generadores antiguos. `crear_videos_psyqus.py` contiene `-an` y `crear_shorts_ilustrados.py` también usa `-an`; ambos pueden producir videos sin audio y no deben ejecutarse sobre los Shorts actuales.
- Pendientes: colocar `Psyqus_Shorts_Con_Audio.zip` en `C:\Users\licbl\Downloads` o indicar su ruta exacta. Después revisar `instalar.py`, crear respaldo, ejecutarlo, comprobar las 11 narraciones/músicas y las tres lecciones de meditación, e integrar el catálogo sin añadir una pista independiente en la página.
### 2026-10-17 — Instalación de Shorts con narración y música

- Cambios realizados: se localizó `C:\Users\licbl\Downloads\Psyqus_Shorts_Con_Audio.zip`, se extrajo en `Psyqus_Shorts_Con_Audio` dentro del proyecto y se ejecutó su instalador. El comando `py instalar.py` terminó con código 1 sin mostrar diagnóstico; se ejecutó el mismo instalador con `python`, que terminó correctamente. El instalador creó `respaldos_shorts\20261017-133445`, reemplazó los activos con respaldo, verificó hashes y agregó las tres lecciones de meditación al catálogo de `app/shorts/page.tsx`.
- Comprobaciones: el instalador reportó `VIDEO + AUDIO verificados` para los 14 MP4. Se confirmó que `public/shorts` contiene 14 MP4 y que ninguno carece de pista de audio; una muestra tiene AAC estéreo a 48 kHz. El respaldo contiene 20 archivos. Las 11 referencias anteriores del catálogo ahora apuntan a los MP4 narrados instalados en `/shorts/*.mp4`, y las tres nuevas lecciones también están en el catálogo.
- Reproductor: no se agregó `<audio>` ni `new Audio`; la música y narración permanecen dentro de cada MP4. La lógica existente conserva un solo video activo, pausa los inactivos y activa el sonido mediante interacción del usuario.
- Bloqueo de prueba visual: se inició `npm run dev`, pero el navegador integrado no pudo abrir `http://localhost:3000/shorts` y no hay una página compartida/pageId. Por eso no se pudo confirmar físicamente con el navegador que se escuchen narración/música al pulsar “Activar sonido” ni observar el cambio de Short.
- Generadores: no se ejecutaron los generadores antiguos que usan `-an`.
- Pendientes: compartir/abrir `http://localhost:3000/shorts` en el navegador, pulsar “Activar sonido” y verificar escucha real y pausa al cambiar de Short.

### 2026-10-17 — Muestra animada de meditación

- Cambios realizados: se respaldó el original en `respaldos_shorts/muestra-meditacion-20261017-141049/meditar-sin-mente-en-blanco.mp4` y se generó `public/shorts/meditar-sin-mente-en-blanco-muestra.mp4`. No se reemplazó el original ni se modificaron los otros 13 Shorts.
- Mejora aplicada: la muestra conserva la narración, música y subtítulos originales dentro del MP4; añade paneo/zoom suave y capas geométricas animadas por bloques de la explicación: distracción, contacto de pies con el suelo, regreso de la atención y cierre. No se agregó audio independiente ni se aceleró o cortó la voz.
- Comprobaciones: original y muestra duran `32.541667` s; ambos tienen video H.264 vertical `720x1280` y audio AAC estéreo a `48 kHz` con `32.541000` s. Los fotogramas de la muestra muestran los nuevos movimientos y los subtítulos permanecen dentro del encuadre. En navegador, la muestra cargó con `readyState=4`, audio no silenciado y terminó en `32.541667` s con `ended=true`, sin error de reproducción.
- Pendientes: revisar visualmente la muestra en el dispositivo final y decidir si el nivel de gráficos es adecuado antes de incorporar esta técnica a los otros 13 videos. La muestra aún no está en `SHORTS_LOCALES`, por lo que no altera el catálogo de producción.
### 2026-10-17 — Movimiento real en Avatar3D

- Cambios realizados: `app/dashboard/components/Avatar3D.tsx` ahora conserva el parpadeo, añade respiración sobre `spine`, `chest` y `upperChest`, y aplica movimiento suave de cabeza a partir de las rotaciones base. La boca usa las expresiones vocales compatibles (`aa`, `ih`, `ou`, `ee`, `oh`) y se cierra cuando `hablando` es falso o el medio está pausado.
- Audio: el componente acepta `audioElement` opcional. Si recibe un `HTMLMediaElement`, conecta un `AnalyserNode` y modula la apertura de la boca con amplitud RMS; esto es sincronización por volumen, no lip-sync fonémico. El flujo actual de `app/experiencia/page.tsx` usa `SpeechSynthesis`, que no expone una pista analizable ni fonemas, por lo que conserva sincronización de estado (hablando/pausado) con una envolvente visual.
- Comprobaciones: ambos modelos VRM contienen expresiones `a/i/u/e/o`, parpadeo `blink/blink_l/blink_r` y huesos `Spine/Chest/UpperChest/Head`. Se intentó comprobar `/experiencia` en ejecución, pero la ruta redirige a `/sign-in` y Clerk devuelve un error de configuración porque la ruta no es catch-all; falta iniciar sesión y corregir esa configuración antes de verificar visualmente el movimiento del personaje.
- Pendientes: probar con una sesión Clerk válida; para lip-sync preciso falta una narración real como `HTMLAudioElement` o stream Web Audio y un análisis fonético/visemas. No se modificaron modelos, Shorts ni el MP4 de muestra.### 2026-10-17 — Corrección de integración del avatar

- Cambios realizados: se corrigió el alcance de los huesos animados y el buffer `Uint8Array` del analizador en `Avatar3D.tsx`. La animación queda preparada para ejecutarse sobre el personaje cargado, no sobre la cámara.
- Comprobaciones: se verificó el código del componente y los dos modelos conservan expresiones vocales, parpadeo y huesos requeridos. El typecheck se ejecutó sin salida de diagnóstico nueva. La prueba visual sigue bloqueada por la redirección de Clerk a `/sign-in`, cuya página `SignIn` reporta que la ruta no es catch-all.
- Pendientes: iniciar sesión con Clerk y abrir `/experiencia` para observar directamente cabeza, pecho, parpadeo y boca; la precisión fonémica requiere una pista de audio real analizable, porque `SpeechSynthesis` no expone volumen ni fonemas.### 2026-10-17 — Corrección de ruta Clerk para validar Avatar3D

- Cambios realizados: se movió `app/sign-in/page.tsx` a `app/sign-in/[[...rest]]/page.tsx` para que el componente `<SignIn />` funcione con routing catch-all. Se conservó `middleware.ts`, incluyendo la regla pública `/sign-in(.*)`, sin cambiar autenticación ni permisos.
- Comprobaciones reales: el servidor local compiló ` /sign-in/[[...rest]]`; `GET /sign-in?redirect_url=...` respondió `200` y la comprobación interna de Clerk `GET /sign-in/SignIn_clerk_catchall_check_...` también respondió `200`. La prueba de `/experiencia` aún requiere iniciar sesión.
- Pendientes: abrir/compartir el navegador en `http://localhost:3001/sign-in`, iniciar sesión con Clerk y abrir `/experiencia` para comprobar visualmente parpadeo, respiración, cabeza y boca al pausar la narración.
- Exportación futura: no se generó otro MP4. Para exportar una lección con avatar animado se necesita una pista de narración real (archivo o stream grabable), renderizar los frames del VRM con la misma lógica de expresiones y muxear ese audio con FFmpeg. `SpeechSynthesis` del navegador no ofrece una pista exportable ni fonemas; con él solo puede conservarse animación por estado/volumen aproximado, no lip-sync preciso.### 2026-10-17 — Preparación y despliegue en Vercel

- Cambios realizados: se ejecutó `git add -A` para dejar los cambios locales staged, sin crear commit ni hacer push. Vercel identificó el proyecto `psyqus-web-lvhs`.
- Comprobaciones: se intentó `vercel --prod --yes` y un segundo `vercel deploy --prod --yes --force`, ambos con el CLI 59.0.0. Los dos fallaron antes de completar el despliegue con `Failed to fetch dist-tags from npm` y `fetch failed`.
- Bloqueo: no se confirmó una nueva versión pública en `psyqus.com`; el bloqueo concreto es conectividad del CLI hacia npm/Vercel o su consulta de actualización. Los cambios permanecen staged y no se hizo commit ni push.### 2026-10-17 — Diagnóstico local antes de Vercel

- Estado comprobado: no había un proceso activo en `3001` ni una página de navegador compartida, por lo que no se puede afirmar que la vista observada sea `psyqus.com`, `/shorts` o `/experiencia`. Se levantó el proyecto local en `http://localhost:3010`.
- Shorts: el catálogo local apunta a `/shorts/meditar-sin-mente-en-blanco.mp4`. El archivo servido directamente respondió `200 video/mp4`, mide `2750005` bytes y contiene H.264 vertical y AAC estéreo a 48 kHz, duración `32.541667` s. No fue posible inspeccionar `muted`, `volume`, `currentTime` ni errores del elemento `<video>` porque la ruta HTML redirige a Clerk sin sesión y no hubo navegador compartido.
- Cambio realizado: el botón de sonido de `app/shorts/page.tsx` ahora fuerza `activeVideo.volume = 1` antes de aplicar `muted=false` y reanudar el video. No se desplegó después de este cambio.
- Avatar: no se comprobó visualmente en ejecución; `/experiencia` requiere sesión Clerk. La animación del avatar existe en `Avatar3D.tsx`, pero la prueba real de parpadeo, cabeza, boca y pausa sigue pendiente.
- Limitación de Shorts: el MP4 instalado contiene una ilustración fija con transiciones; todavía no contiene el personaje VRM animado. Por tanto no cumple el objetivo final de Shorts con avatar 3D hasta exportar un nuevo MP4 renderizado con el modelo y audio sincronizados.
- Despliegue: no se repitió Vercel. El despliegue previo falló con `fetch failed`; primero debe completarse la verificación local autenticada.

### 2026-10-18 — Catálogo completo de Shorts ilustrados animados

- Decisión de diseño: todos los Shorts usan el estilo 2D ilustrado de `companeros-acuerdos`: paleta cálida/profesional, personajes con ambos brazos y manos completos, escenas narrativas y movimiento dibujado por fotograma. La animación 3D de `/experiencia` queda fuera de esta tarea.
- Cambios realizados: se corrigió `crear_shorts_ilustrados.py` para incluir los 14 activos del catálogo, ajustar las cuatro escenas a la duración real de cada MP4 y generar primero una capa visual temporal. La salida final incorpora la pista de narración/música del MP4 fuente mediante mux de FFmpeg; no se añade reproductor ni audio independiente en la página y no se usa `-an` en la salida final.
- Meditación: se reh hicieron `meditar-sin-mente-en-blanco`, `meditacion-y-estres` y `pausa-antes-de-responder` con personajes ilustrados y escenas específicas de distracción, respiración, pies/sensaciones, regreso de la atención y apoyo. También se incorporaron escenas visuales para `enfoque`, `pausa` y `cierre`.
- Respaldo: los originales y posters quedaron respaldados en `respaldos_shorts/ilustrados-20261018-114652`; el generador previo quedó respaldado en `respaldos_shorts/generador-ilustrado-20261018-114003`.
- Comprobaciones reales: se ejecutó primero un Short completo y después el lote de 14. Cada salida reportó audio conservado y duración validada. `ffprobe` confirmó 14 MP4 con H.264 vertical `720x1280`, AAC estéreo `48 kHz`, sin archivos `.tmp.mp4` pendientes. Las 14 URLs directas en `http://localhost:3000/shorts/*.mp4` respondieron `200 video/mp4` con contenido no vacío. Se revisó visualmente una composición de cuatro escenas con subtítulos y ambos brazos/manos visibles.
- Pendientes: todavía falta la comprobación visual del feed autenticado completo en navegador (desplazamiento, botón de sonido y pausa del video anterior). No se modificó `/experiencia`, no se desplegó y no se hizo commit ni push.

### 2026-10-18 — Verificación de audio de Shorts sin regenerar gráficos

- No se regeneraron videos ni se modificó el diseño aprobado.
- FFmpeg `volumedetect` confirmó audio audible en los 14 MP4 finales: volumen medio entre `-19.5` y `-21.2 dB`, con picos entre `-1.8` y `-3.9 dB`; no son pistas AAC silenciosas.
- En `meditar-sin-mente-en-blanco.mp4`, el final midió `-20.0 dB` de media y `-3.1 dB` de pico. El respaldo fuente midió `-19.9 dB` y `-3.1 dB`, confirmando que el mux conservó la narración/música original y no la pista silenciosa temporal.
- Se verificó que no quedaron archivos visuales temporales. La lógica de `app/shorts/page.tsx` solo establece `muted=true` al inicio y al pulsar explícitamente el control; al activar sonido fuerza `volume=1`, `muted=false` y reanuda el video si estaba pausado. El efecto de visibilidad/activo pausa o reproduce, pero no vuelve a silenciar.
- Pendiente: inspección en navegador del elemento activo después de pulsar `Activar sonido` (`muted`, `volume`, `paused`, `currentSrc`, errores). El navegador integrado no pudo abrirse/compartirse en esta sesión; se requiere compartir `http://localhost:3000/shorts` para completar esa comprobación.

### 2026-10-18 — Comprobación real del reproductor en navegador

- Se reutilizó la pestaña compartida `http://localhost:3000/shorts`; no se abrió otro navegador ni se cambió de puerto.
- Tras `Activar sonido`, el video activo fue `/shorts/meditar-sin-mente-en-blanco.mp4` con `muted=false`, `volume=1`, `paused=false`, `readyState=4`, `currentTime` avanzando, `duration=32.541`, `ended=false` y `error=null`. El elemento reportó `audible=true`.
- Se inspeccionaron los 14 elementos: solo el activo estaba reproduciendo; los otros 13 estaban `paused=true`, con `error=null` y sus `currentSrc` locales correctos.
- La página solo registró la advertencia esperada de Clerk sobre development keys; no aparecieron errores de carga o reproducción. El DOM no permite determinar si el sistema operativo o el mute de la pestaña del navegador están silenciados a nivel externo; a nivel del elemento HTML el audio está habilitado.

### 2026-10-19 — Preparación para publicación

- Cambios de build: se eliminó la página duplicada `app/api/pulso/page.tsx`, conservando `app/api/pulso/route.ts` y `app/pulso/page.tsx`. `/admin` ahora es un Server Component que renderiza el panel protegido por Clerk; se eliminó la importación inválida de Server Component desde un Client Component y no se publica la contraseña hardcodeada anterior.
- Comprobación: `npm run build` terminó correctamente después de compilar, generar 44 páginas, crear trazas y finalizar la optimización.
- Publicación: todavía pendiente de commit, push y despliegue. Se excluirán secretos, `respaldos_shorts/`, temporales y artefactos de build; no se modificaron audio ni gráficos en esta preparación.

### 2026-10-19 — Commit, push y bloqueo de despliegue

- Publicación de código: se creó el commit `748c54c` (`Publica Shorts ilustrados con audio integrado`) y se hizo push correctamente a `origin/main` en `github.com/ricardoblancartev-creator/psyqus-web.git`. El árbol de trabajo quedó limpio.
- Build: `npm run build` terminó correctamente después de corregir la página duplicada de `/api/pulso` y la importación de Server Component desde `/admin`.
- Vercel: se intentó desplegar al proyecto existente `psyqus-web-lvhs` con `vercel deploy --prod --yes --force`. El CLI identificó el proyecto, pero falló con `Failed to get package info: Failed to fetch dist-tags from npm` y terminó con `Error: fetch failed`.
- Producción: no se confirmó una versión nueva en `psyqus.com`; la solicitud directa a `https://psyqus.com/shorts/meditar-sin-mente-en-blanco.mp4` terminó en timeout de conexión (`curl: (28) Connection timed out after 20037 milliseconds`). No se afirma que producción sirva todavía los MP4 nuevos.
- Pendiente concreto: repetir el despliegue cuando Vercel/npm sea accesible o revisar el despliegue automático de Git del proyecto existente. No se creó otro proyecto ni se modificaron audio o gráficos durante la publicación.


### 2026-10-30 — Reporte PDF organizacional NOM-035

- Cambios realizados: en `app/nom035-resultados/page.tsx` se agregó el botón “Descargar reporte PDF” junto a las exportaciones existentes. Genera un PDF con resumen organizacional, interpretación general basada en los niveles calculados del Cuestionario II, distribución por nivel y conclusiones agregadas por categoría. No incluye gráficas y no crea resultados nuevos. Si faltan evaluaciones calificables, el PDF lo expresa en lugar de inferir una conclusión.
- Acceso: se conserva el layout protegido actual de `/nom035-resultados`, que requiere sesión Clerk y rol `admin` o `psicologo`.
- Comprobaciones: `jspdf` ya estaba instalado. El typecheck no reporta errores en NOM-035; conserva errores ajenos preexistentes en `Avatar3D.tsx` (tipo del buffer del analizador) y conflicto de casing `MockData.ts/mockData.ts`. Next compiló correctamente y generó las 44 páginas estáticas; se observó la fase de finalización de optimización/trazas, pero la sesión de terminal perdió el proceso antes de recibir el código de salida final. No se hizo commit, push ni despliegue.
- Pendiente: probar la descarga autenticada en el navegador en `/nom035-resultados` con un usuario profesional y revisar el PDF generado con datos reales; no se compartió una página ni se descargó/renderizó un PDF en esta tarea.

### 2026-11-01 — Psyqus Behavioral: laboratorio de filas en gasolineras

- Cambios realizados: se creó la ruta protegida `/gasolineras` como primer módulo experimental de Psyqus Behavioral. Permite variar bombas abiertas, llegadas por hora, tiempo de atención, duración del escenario y proporción de tres perfiles hipotéticos; compara una asignación de fila habitual contra orientación a la fila estimada más corta. Incluye métricas, percentil 90, abandonos estimados y gráfico de espera.
- Alcance del modelo: simulación local determinista por minuto para explorar supuestos; no representa datos medidos, no hace diagnósticos psicológicos ni persiste información. La intervención de orientación también modifica supuestos de paciencia/abandono, por lo que sus resultados deben leerse como ilustrativos.
- Comprobaciones: revisión del estado Git antes de editar; se conservaron los cambios existentes en `CONTEXTO_PSYQUS.md` y `app/nom035-resultados/page.tsx`. Los diagnósticos del editor para `app/gasolineras/page.tsx` no reportaron errores. No se ejecutó build ni pruebas.
- Pendientes: decidir si se agrega un acceso desde el menú Psyqus, validar el modelo con datos observados y acordar con especialistas qué variables conductuales son defendibles antes de usarlo para decisiones operativas.

### 2026-11-01 — Ajuste del modelo experimental de gasolineras

- Cambios realizados: el botón ahora ejecuta y guarda una corrida explícita de 25 repeticiones; los resultados no se recalculan al mover controles, y la interfaz avisa si se cambiaron parámetros desde la corrida mostrada. La comparación usa eventos aleatorios pareados: ambos escenarios reciben las mismas llegadas, mezcla de perfiles, servicios y ruido de elección. La única diferencia es la señal para seleccionar bomba (cantidad visible en fila frente a carga de servicio estimada).
- Corrección de alcance: se retiraron cambios diferenciales de paciencia y abandono. Ahora se informa que el modelo no contempla cambios de fila ni abandonos. El tiempo de servicio se representa con una distribución uniforme ±40% del promedio. Los perfiles siguen siendo supuestos de ruido de elección, no categorías psicológicas medidas.
- Comprobaciones: los diagnósticos del editor no reportan errores en `app/gasolineras/page.tsx`. No se ejecutaron pruebas ni build.
- Pendientes: calibrar llegadas y servicios con observaciones de una estación piloto; evaluar convergencia de resultados con más repeticiones y validar el criterio conductual con especialistas antes de interpretarlo como efecto causal.

### 2026-11-01 — Descripciones de Psyqus Behavioral y guion comercial

- Cambios realizados: se añadieron explicaciones junto a controles y métricas de `/gasolineras`, con ejemplos de uso e indicaciones para interpretar espera acumulada, atendidos, variación porcentual y percentil 90. Los perfiles se renombraron como estilos de elección para reducir la apariencia de categorías psicológicas medidas. Se creó `psyqus-behavioral-guion-comercial.md` con guion de 45 segundos, versión vertical de 15 segundos, storyboard y guía de producción.
- Enfoque de comunicación: el guion presenta el producto como experimental y recomienda un piloto validado con datos de una estación; no promete reducción de espera ni ahorros no medidos.
- Comprobaciones: los diagnósticos del editor no reportaron errores en `app/gasolineras/page.tsx`. Se preparó guion/storyboard; no se produjo ni exportó un archivo de video MP4.
- Pendientes: grabar capturas reales de la interfaz, añadir canal de contacto aprobado y producir la pieza audiovisual final.

### 2026-11-01 — Publicación del guion en desarrollo local

- Cambios realizados: se copió el guion comercial a `public/psyqus-behavioral-guion-comercial.md` para que Next.js lo sirva en `/psyqus-behavioral-guion-comercial.md`; se añadió un enlace al final de `/gasolineras`. El archivo público y el original tienen el mismo hash SHA-256 al momento de este cambio.
- Comprobaciones: hash de ambas copias verificado; diagnósticos del editor sin errores en `app/gasolineras/page.tsx`. No se ejecutó build ni se probó la URL en navegador.
- Pendientes: si se edita el guion original, volver a sincronizar la copia dentro de `public/`.

### 2026-11-01 — Presentación visual del guion comercial

- Cambios realizados: se creó `/gasolineras/comercial` como página Psyqus con storyboard de 45 segundos, versión vertical de 15 segundos, guía de producción y aviso de prototipo experimental. El enlace desde `/gasolineras` ahora abre esta página; desde ahí se puede descargar el Markdown.
- Comprobaciones: diagnósticos del editor sin errores en `app/gasolineras/page.tsx` y `app/gasolineras/comercial/page.tsx`. No se ejecutó build ni se validó visualmente en navegador.
- Pendientes: si se actualiza el texto del guion, sincronizar la presentación visual, el Markdown original y la copia publicada.

### 2026-11-01 — Redirección de la URL Markdown a la presentación

- Cambios realizados: la URL anterior `/psyqus-behavioral-guion-comercial.md` ahora redirige a `/gasolineras/comercial` mediante `next.config.mjs`, para que no se abra como texto plano. La descarga Markdown quedó en `public/descargas/psyqus-behavioral-guion-comercial.md` y la presentación apunta a esa copia.
- Comprobaciones: los diagnósticos del editor no reportan errores en `next.config.mjs` ni en ambas páginas. No se ejecutó build ni navegador. El cambio de redirección requiere reiniciar Next.js para que lea la configuración nueva.
- Pendientes: validar la redirección en navegador después de reiniciar el servidor.

### 2026-11-01 — Producción del video comercial Psyqus Behavioral

- Cambios realizados: se generó `public/videos/psyqus-behavioral-comercial.mp4`, pieza gráfica animada de 45.5 s en 1280×720, H.264/AAC, con seis escenas, transiciones, subtítulos integrados, narración sintetizada en español y pista musical sintética. Se incorporó reproductor y descarga en `/gasolineras/comercial`; el poster quedó en `public/videos/psyqus-behavioral-poster.png`. El guion y el texto narrado se sincronizaron.
- Alcance visual: son escenas gráficas ilustrativas, no metraje real de una estación. La voz disponible en este equipo es Microsoft Helena Desktop (español de España). Las curvas y parámetros del anuncio están identificados como ilustrativos.
- Comprobaciones: FFprobe confirma 45.5 s, H.264 1280×720 y audio AAC estéreo a 48 kHz; se revisó una hoja de seis fotogramas. Los diagnósticos del editor no reportaron errores en las páginas de simulación/comercial ni en el generador de escenas. Se eliminaron los fotogramas y audios temporales.
- Pendientes: probar reproducción en navegador tras reiniciar Next.js y, si se desea una voz mexicana o metraje de estación, producir una segunda versión con esos activos.

### 2026-11-02 — Seguridad fase 1 (rama `seguridad-fase-1`)

- Cambios realizados: lecturas de resultados NOM-035 y clima solo en servidor con rol `admin`/`psicologo` y campos explícitos; `/insights`, `/resultados`, paneles profesionales y `ResumenBienestar` dejan de leer con la clave pública; buzón, chat de `/ia`, entrenamiento y psicoeducación escriben mediante rutas de servidor con el `user_id` de Clerk (`/api/buzon`, `/api/chat`, `/api/progreso/*`); la interpretación NOM-035 ya no envía nombre, área ni puesto a Groq; límites de uso en `/api/chat`, `/api/nom035/interpretar`, `/api/psicologo-auth` y `/api/prospectos`; `/api/prospectos` escapa HTML; se eliminó la copia vieja `api/nom035/interpretar/route.ts` de la raíz; se creó `supabase/rls-fase-1.sql` sin ejecutarlo. Detalle completo en `SEGURIDAD_FASE_1.md`.
- Comprobaciones: `npx tsc --noEmit` sin errores nuevos (solo los 3 preexistentes); ESLint sin avisos nuevos en archivos cambiados; `next build` completo; servidor local sin sesión: rutas protegidas bloqueadas por Clerk y límite de `/api/prospectos` responde 429 al sexto intento; SQL validado con el parser de Postgres; la clave `service_role` no está en variables `NEXT_PUBLIC_` ni en el bundle del navegador. No hubo push ni conexión a la base de datos.
- Pendientes: probar con sesión de empleado y de psicólogo; publicar la rama antes de ejecutar el SQL; ejecutar `supabase/rls-fase-1.sql` (PASO 0, 1 y 2) y volver a probar; límite de uso global; aviso de privacidad con proveedores; separación por empresa.

### 2026-11-03 — Publicación de la fase 1 y RLS aplicado en Supabase

- Cambios realizados: `main` avanzó a `eaa7477` (fase 1 de seguridad más el reporte PDF NOM-035), sin lo de Psyqus Behavioral, que quedó en la rama local `gasolineras`. Vercel desplegó producción en `psyqus-web-lvhs` en verde. El usuario ejecutó `supabase/rls-fase-1.sql` (PASO 1) en el SQL Editor con resultado "Success". Respaldo del estado previo en `C:\dev\respaldos-supabase\` (fuera del repo), incluido `restaurar-politicas-anteriores.sql` para emergencias.
- Comprobaciones: el PASO 0 confirmó que antes `nom035_evaluaciones` e `interacciones_psyqus` se podían leer con la clave pública y que `resultados_encuestas`, `buzon_mensajes`, `progreso_*` y `chats` no tenían RLS. Después del PASO 1, una consulta externa con la clave pública (`limit=0`, sin traer filas) devuelve `42501 permission denied` en las 11 tablas cerradas; `contenido_bienestar` sigue pública a propósito. El usuario probó psyqus.com como empleado y como psicólogo y todo funciona.
- Pendientes: otras tablas de la misma base que no son de Psyqus siguen expuestas (`private_chats` con lectura abierta a todos; `activos` y `respuestas_encuesta` sin RLS; revisar también `messages`, `users`, `reportes`, `Respuestas`, `centros_trabajo`, `usuarios_empresa`, `confesia_users`); el valor de `NEXT_PUBLIC_SUPABASE_ANON_KEY` trae un `\n` al final en `.env.local`; límite de uso global; aviso de privacidad con proveedores; separación por empresa; rama `gasolineras` sin publicar.

### 2026-11-03 — Panel del psicólogo, perfil bio-psico-social-espiritual y avatar ilustrado

- Cambios realizados: `/panel-psicologo` se rediseñó en un resumen de 4 tarjetas y 4 secciones (estado general NOM-035, casos a dar seguimiento con Guía I y riesgo alto/muy alto, áreas que atender con su categoría principal, pulso semanal con cambio contra la semana anterior y buzón), más el clima organizacional al final; usa la misma calificación oficial de `lib/nom035-calificacion.ts`. El pulso semanal tiene una 4.ª pregunta, "Sentido" (dimensión espiritual), guardada en la columna nueva `pulsos_semanales.sentido` (`supabase/pulso-sentido.sql`); `/api/pulso` funciona con o sin esa columna. `/mi-bienestar` muestra "Tu perfil de bienestar" (`components/PerfilBienestar.tsx`): diagrama de 4 círculos bio (energía), psico (desconexión), social (apoyo) y espiritual (sentido) con el último pulso, orientativo y solo visible para el usuario. `/experiencia` usa `components/AvatarIlustrado.tsx` (2D, cálido, con las 4 dimensiones detrás; parpadea, respira y mueve la boca al hablar) en lugar de `Avatar3D`, que se conserva.
- Comprobaciones: `npx tsc --noEmit` sin errores nuevos; capturas con Edge sin ventana del perfil y del avatar con datos de ejemplo (vistas previas temporales ya borradas). No se probaron con sesión iniciada el panel ni `/experiencia` con datos reales antes de publicar.
- Pendientes: ejecutar `supabase/pulso-sentido.sql` para que se guarde "Sentido"; rehacer los Shorts con mejor calidad; revisar con la psicóloga las dimensiones, el panel y el protocolo del buzón (hoy el panel solo cuenta solicitudes, no muestra su texto).

### 2026-11-04 — Simulador de gasolineras v1 (rama `gasolineras`)

- Cambios realizados: se reescribió el simulador. Motor nuevo en `lib/gasolinera/simulacion.ts`: simulación por eventos en tiempo continuo, llegadas con ritmo por hora, posiciones de carga con diésel, despachadores por hora que atienden al llegar y al cobrar (la carga corre sola), tiempos lognormales, abandono cuando la fila supera la tolerancia del cliente, sin borrar esperas al cierre, números aleatorios comunes entre escenarios e intervalos de confianza. `sugerirPlantilla` calcula el mínimo de despachadores por hora que cumple un objetivo de clientes perdidos y espera. La interfaz (`components/gasolinera/Simulador.tsx`, usada por `app/gasolineras/page.tsx`) compara plantilla actual contra propuesta en clientes perdidos, ventas perdidas, espera, horas y costo de despachador, y balance neto mensual; permite capturar o importar conteos por hora (CSV con plantilla descargable) y calibrar contra clientes que se fueron.
- Comprobaciones: el motor se validó contra fórmulas exactas (Pollaczek-Khinchine para M/G/1 y Erlang B para pérdida con 3 posiciones), conservación de autos y monotonía al agregar despachadores; `npx tsc --noEmit` y ESLint sin errores en los archivos nuevos; captura de la página funcionando con datos de ejemplo.
- Pendientes: la presentación comercial (`/gasolineras/comercial`) y el video describen el modelo anterior; definir marca separada de Psyqus; piloto con datos reales de 1 a 3 estaciones; no modela cambios de fila, bloqueo entre posiciones del mismo dispensario ni tienda.

### 2026-11-05 — Shorts v2: guiones nuevos y generador

- Cambios realizados: los 14 Shorts se reescribieron con un formato único (gancho, escena con personajes fijos —Toño, Lupita, su jefa y Beto—, la clave, pruébalo hoy y cierre) en `contenido/shorts/guiones.json`, que también alimenta el catálogo de `app/shorts/page.tsx`. Nuevo generador `scripts/shorts-v2/generar.mjs` (SVG + sharp + ffmpeg, 720×1280 a 24 fps, subtítulos sincronizados, música propia) y `scripts/shorts-v2/tts.ps1` (voces de Windows por lote). Los 14 videos y pósters se instalaron en `public/shorts`; los anteriores quedaron en `respaldos_shorts/antes-v2-20261105-131338`.
- Comprobaciones: los 14 MP4 tienen video H.264 y audio AAC, duran 28–38 s y pesan ~1.5 MB; se revisaron cuadros de varios. La voz es provisional (Laura, es-ES): la voz de Edge (es-MX) devuelve 403 y abrir PowerShell desde el generador tarda más de un minuto por el antivirus, por lo que las voces se generan con `SOLO_LISTA=1` y luego `tts.ps1` en una sesión de PowerShell ya abierta.
- Pendientes: validar los guiones con la psicóloga; voz latina (Azure es-MX o voz de Windows es-MX instalada); publicar (no se hizo commit ni push). Los cambios del simulador de gasolineras siguen sin commit en la misma copia de trabajo y deben separarse de estos al hacer commit.

### 2026-11-05 — Rediseño del simulador laboral (/entrenamiento)

- Cambios realizados: `app/entrenamiento/page.tsx` pasó de dos columnas con todo a la vez a dos vistas: (1) elegir situación, con estado Nuevo / En curso / Completado y botón Empezar, Continuar o Repetir; (2) practicar en una sola columna con barra de avance, la situación solo en el primer paso, opciones A/B/C, retroalimentación inmediata (y la opción más útil si se eligió otra), "Probar otra respuesta" y un cierre con "Lo que te llevas", Repetir y Elegir otra situación. Se agregó Repetir (antes un escenario terminado se quedaba en el cierre). Se conservan los escenarios, la API `/api/progreso/entrenamiento` y el progreso guardado.
- Comprobaciones: `npx tsc --noEmit` sin errores nuevos; ESLint solo con los dos `any` que ya existían; capturas de ambas vistas con el servidor local (vista previa temporal ya borrada).
- Pendientes: probar con sesión el guardado del avance y Repetir; publicar.
