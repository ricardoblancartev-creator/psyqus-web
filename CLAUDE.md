# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Reglas de trabajo (de AGENTS.md; se repiten porque son estrictas)

- Antes de cualquier tarea, leer `CONTEXTO_PSYQUS.md` (bitácora del proyecto) y ejecutar `git status`. El árbol de trabajo suele tener trabajo del usuario sin commit: nunca revertirlo, borrarlo ni sobrescribirlo sin permiso explícito.
- Al terminar cada tarea, añadir una entrada a `CONTEXTO_PSYQUS.md` con el formato existente: `### AAAA-MM-DD — Título`, luego `Cambios realizados`, `Comprobaciones` (qué se ejecutó/verificó realmente y qué no) y `Pendientes`.
- No hacer commit, push ni despliegues con `vercel` salvo que el usuario lo pida explícitamente.
- El producto, los textos de la interfaz, la documentación y los mensajes de commit están en español (es-MX). Mantener en español todo texto nuevo visible para el usuario.

## Comandos

```bash
npm run dev          # servidor de desarrollo Next.js (localhost:3000)
npm run build        # build de producción
npx tsc --noEmit     # la verificación de tipos real — ver nota abajo
npm run lint         # next lint
```

No hay suite de pruebas. `next.config.mjs` activa `ignoreBuildErrors` e `ignoreDuringBuilds`, así que **que `npm run build` pase no significa que el código compile sin errores de tipos**: usar `npx tsc --noEmit`. Hay errores preexistentes conocidos (p. ej. `lib/MockData.ts` importado como `@/lib/mockData`, y otros antiguos en `errores_psyqus.txt`) que no son regresiones; reportar solo los nuevos.

Los cambios en `next.config.mjs` (redirecciones) requieren reiniciar el servidor de desarrollo. La mayoría de las páginas están detrás de Clerk, por lo que verificarlas en navegador requiere una sesión iniciada.

## Stack

Next.js 15 App Router + React 19, TypeScript, Tailwind v4 (`@tailwindcss/postcss`). Clerk para autenticación, Supabase para datos, Groq (mediante el SDK `openai`) para el chat, Resend para correo. Desplegado en Vercel (proyecto `psyqus-web-lvhs`, dominio psyqus.com). Alias de rutas `@/*` → raíz del repositorio.

## Arquitectura

**Autenticación.** `middleware.ts` protege todas las rutas con Clerk excepto una lista pública explícita (`/`, `/diagnostico`, `/api/prospectos`, `/sign-in`, `/sign-up`, `/psicologo`). Las nuevas rutas públicas se agregan ahí. El inicio de sesión de Clerk vive en `app/sign-in/[[...rest]]/page.tsx` y debe seguir siendo una ruta catch-all.

Los roles profesionales (`admin`, `psicologo`) viven en `privateMetadata.role` de Clerk. Los layouts de `app/panel-psicologo` y `app/nom035-resultados` y las propias páginas los verifican en servidor; en rutas API usar `obtenerProfesional()` de `lib/auth-servidor.ts`. La contraseña de `/psicologo` (`PSICOLOGO_PASSWORD`, guarda `sessionStorage.psicologo_auth`) es solo una capa adicional: la protección real es el rol en Clerk.

**Acceso a datos** (ver `SEGURIDAD_FASE_1.md` y `supabase/rls-fase-1.sql`):
- `lib/supabase/supabaseAdmin.ts`: service-role, `server-only`. Usarlo en route handlers y Server Components **después** de verificar sesión (y rol si son datos de otros), filtrando por el `userId` de la sesión. El `user_id` nunca se toma del cuerpo de la petición.
- `lib/supabase-clerk.ts` → `createClerkSupabaseClient(getToken)`: clave anon + JWT de Clerk; con RLS solo da acceso a las filas propias en `empleados`, `nom035_evaluaciones`, `resultados_encuestas` y `pulsos_semanales` (lo usan `/encuesta`, `/nom035`, `/onboarding`, el dashboard y `/api/pulso`).
- `lib/supabase.ts` y `lib/supabase/client.ts` (anon sin sesión): solo para contenido público como `contenido_bienestar`. No usarlos para datos de empleados.
- Las escrituras del navegador pasan por rutas de servidor: `/api/buzon`, `/api/chat` (guarda la interacción de `/ia`), `/api/progreso/entrenamiento`, `/api/progreso/psicoeducacion`.
- Límites de uso con `lib/limite-uso.ts` (en memoria, por instancia; aproximado en Vercel).

Tablas principales: `resultados_encuestas`, `empleados`, `nom035_evaluaciones`, `pulsos_semanales`, `interacciones_psyqus`, `progreso_entrenamiento`, `contenido_bienestar`, `buzon_mensajes`, `prospectos`.

**NOM-035.** Las constantes del cuestionario están en `app/nom035/constants.ts`; la calificación según las Guías de Referencia I/II (categorías, dominios y niveles de riesgo de "Nulo o despreciable" a "Muy alto") está centralizada en `lib/nom035-calificacion.ts`: reutilizarla en vez de recalificar en otro lugar. La interfaz de resultados es `app/nom035-resultados/page.tsx` (llama a `/api/nom035-resultados` y `/api/nom035/interpretar`); los reportes PDF usan `@react-pdf/renderer` (`components/ReportePsyqusPDF.tsx`, `BotonReportePDF.tsx`).

**Dos directorios `api/`.** `app/api/*` son route handlers de Next.js. El `api/` de la raíz contiene funciones serverless de Python para Vercel (`BaseHTTPRequestHandler` + `xlsxwriter`, dependencias en `requirements.txt`) para las exportaciones de NOM-035 a Excel/Word. No poner archivos `.ts` en el `api/` de la raíz: Vercel podría publicarlos como funciones fuera de Next.js y sin pasar por Clerk.

La interpretación con IA (`/api/nom035/interpretar`) solo recibe número de caso y respuesta; no enviar a Groq nombres, áreas, puestos ni correos.

**Chat con IA.** `app/api/chat/route.ts` usa el SDK de OpenAI apuntando a Groq (`baseURL` api.groq.com, modelo `openai/gpt-oss-120b`, clave en `OPENAI_API_KEY`). Su system prompt define al "Orientador de bienestar": no clínico, nunca diagnostica y solo recomienda rutas de Psyqus que existen realmente; actualizar esa lista al agregar o quitar secciones. `app/experiencia` es la interfaz del acompañante con avatares VRM (`app/dashboard/components/Avatar3D.tsx`, `@pixiv/three-vrm`, modelos en `public/avatars/`) con voz de `SpeechSynthesis` del navegador.

**Navegación.** Menú inferior en `components/PsyqusNavigation.tsx`: `/shorts` (inicio), `/experiencia`, `/psicoeducacion`, `/mi-bienestar`, `/buzon`. El formulario de la landing (`app/page.tsx`) envía a `/api/prospectos`; conservar esa integración.

**Shorts.** `app/shorts/page.tsx` combina un catálogo local (`SHORTS_LOCALES`, MP4 en `public/shorts/`) con registros de Supabase; cuando coinciden por nombre de archivo, gana la URL local para usar la versión con narración/música integrada. El audio va dentro de cada MP4: no agregar reproductores `<audio>` separados. Los videos se generan con scripts de Python/FFmpeg en la raíz (`crear_shorts_ilustrados.py` es el vigente). Los generadores antiguos (`crear_videos_psyqus.py`, etc.) usan `-an` y eliminan el audio: no ejecutarlos sobre los activos actuales. Respaldar en `respaldos_shorts/<timestamp>/` antes de reemplazar cualquier medio.

**Psyqus Behavioral** (`app/gasolineras`, `/gasolineras/comercial`) es un simulador experimental de filas en gasolineras más una página comercial; los textos deben presentarlo como experimental y no prometer resultados no medidos.

## Entorno

`.env.local` (descargado de Vercel): claves de Clerk y URLs `NEXT_PUBLIC_CLERK_*`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (Groq), `RESEND_API_KEY`, `RESEND_FROM`, `PROSPECT_EMAIL`, `PSICOLOGO_PASSWORD`.
