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
