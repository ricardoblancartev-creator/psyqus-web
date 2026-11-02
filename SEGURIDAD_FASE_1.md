# Seguridad · Fase 1

Rama: `seguridad-fase-1` (sale de `main` + el commit de respaldo `ee8d551`).
Fecha: 2026-11-02. Sin push, sin tocar `main` y sin conectarse a la base de datos.

## Lo más importante para ti

1. **El SQL todavía no protege nada.** Hasta que pegues [supabase/rls-fase-1.sql](supabase/rls-fase-1.sql) en Supabase, la clave pública probablemente sigue pudiendo leer los datos de los 27 empleados.
2. **Orden correcto:** primero publica esta rama y comprueba que la app funciona, y después ejecuta el SQL. Si ejecutas el SQL antes de publicar este código, el buzón, el chat, el progreso, `/resultados`, `/insights` y los paneles dejarán de funcionar, porque el código actual de producción todavía usa la clave pública.
3. **Antes del SQL, guarda el resultado del PASO 0.** Es tu respaldo de las reglas actuales.

## Commits

| Commit | Tarea |
|---|---|
| `cf78648` | 1. Lecturas de resultados solo en servidor con rol profesional |
| `801577a` | 2. Las escrituras del navegador pasan al servidor |
| `d571798` | 3. La interpretación NOM-035 ya no envía datos personales a Groq |
| `84d1ebb` | 4. Límites de uso y verificación de rol |
| `941ff92` | 5. `/api/prospectos` escapa el HTML y limita envíos por IP |
| `4a24eb5` | 6. Verificación de la clave `service_role` (commit vacío: no hubo que cambiar nada) |
| `ae08428` | 7. SQL de RLS (sin ejecutar) |
| `e1eecc9` | Limpieza de variables sin uso que dejaron los cambios |

## Qué cambié

### 1. Lecturas de resultados
- `/api/nom035-resultados` y `/api/resultados` ahora:
  - verifican la sesión de Clerk y el rol `admin` o `psicologo` (401 sin sesión, 403 sin rol);
  - leen con `service_role` solo en el servidor;
  - devuelven campos explícitos.
- `/api/nom035-resultados` ya no devuelve `email`. `/api/resultados` no devuelve nombres.
- Nuevo [lib/auth-servidor.ts](lib/auth-servidor.ts) con `obtenerUsuario()` y `obtenerProfesional()`.
- [lib/supabase/supabaseAdmin.ts](lib/supabase/supabaseAdmin.ts) ahora importa `server-only`: si algún componente del navegador lo importa, el build falla.

### 2. Escrituras desde el navegador
| Antes (clave pública, `user_id` del navegador) | Ahora (servidor, `user_id` de la sesión de Clerk) |
|---|---|
| Buzón insertaba en `interacciones_psyqus` | `POST /api/buzon` (máximo 2000 caracteres) |
| `/ia` insertaba mensaje **y respuesta** | `/api/chat` guarda la interacción con la respuesta que generó el propio servidor |
| `/entrenamiento` leía y escribía `progreso_entrenamiento` | `GET/POST /api/progreso/entrenamiento` |
| `/psicoeducacion` leía y escribía `progreso_psicoeducacion` | `GET/POST /api/progreso/psicoeducacion` |

### 3. Datos que se envían a Groq
- La página manda cada caso como `{ caso: 1, respuesta: "Casi siempre" }`, sin nombre, área ni puesto.
- La ruta vuelve a anonimizar en el servidor por si algún navegador manda más campos.
- El prompt ya no pide mencionar personas por nombre.
- Los nombres siguen visibles para el psicólogo dentro de Psyqus.

### 4. Límites y roles
| Ruta | Quién puede usarla | Límite |
|---|---|---|
| `/api/chat` | cualquier usuario con sesión | 20 por minuto, 300 por día |
| `/api/nom035/interpretar` | `admin` o `psicologo` | 60 cada 10 min, 500 por día |
| `/api/psicologo-auth` | — | 10 intentos por IP cada 15 min |
| `/api/send` (diagnóstico) | solo `admin` | — |

### 5. `/api/prospectos`
- Escapa todo el HTML y recorta el largo de cada campo.
- Quita los saltos de línea en los campos de una línea (el asunto del correo).
- Usa `replyTo` solo si el correo es válido.
- Límite de 5 por hora y 20 por día por IP.

### 6. Clave `service_role`
- Ninguna variable `NEXT_PUBLIC_` la contiene, ni en el código ni en `.env.local`. Revisé el rol dentro de cada JWT sin mostrar los valores: la clave pública es `anon` y la de servidor es `service_role`.
- Ningún componente `"use client"` la importa.
- Después del build, no aparece en `.next/static`, que es lo que descarga el navegador.

### 7. [supabase/rls-fase-1.sql](supabase/rls-fase-1.sql)
- Activa RLS y quita **todos** los permisos a `anon` en 12 tablas. Las que no existan se omiten.
- Borra las políticas existentes en esas tablas y crea solo las necesarias. No borra datos.
- Con sesión de Clerk, cada quien solo ve y escribe **sus** filas en `empleados`, `nom035_evaluaciones`, `resultados_encuestas` y `pulsos_semanales`. Nadie puede borrar desde el navegador.
- El resto de las tablas queda solo para el servidor.
- Trae diagnóstico previo, verificación y rollback de emergencia.

## Decisiones que tomé solo

1. **Amplié la tarea 1 a otras lecturas.** `/resultados`, `/insights`, la parte profesional de `ResumenBienestar` y los dos paneles profesionales ahora leen con `service_role` después de verificar sesión y rol. Dos razones:
   - Hoy usan la clave pública, así que se romperían con el SQL.
   - Con RLS por usuario, el token del psicólogo solo vería sus propias filas.
2. **`/insights` ahora exige rol profesional.** Antes cualquier usuario con sesión veía los agregados de toda la organización.
3. **Amplié la tarea 2 a psicoeducación.** Tenía el mismo problema que entrenamiento.
4. **Para `/ia`, el guardado lo hace `/api/chat`** y no una ruta aparte. Así el navegador no puede inventar la "respuesta" que se guarda.
5. **Quité la copia vieja `api/nom035/interpretar/route.ts` de la raíz.** No pedía sesión, usaba otro modelo y mandaba nombres a Groq, y Vercel podía publicarla como función aparte. Sigue en el historial de git.
6. **El límite de uso vive en la memoria del servidor.** No hay Redis. En Vercel cada instancia lleva su propia cuenta, así que el límite es aproximado: frena abusos casuales, pero no un ataque distribuido. Ver "Qué debes hacer tú".
7. **Ciertos límites los elegí yo:** `/api/psicologo-auth` con límite por IP y `/api/send` solo para `admin`.
8. **El SQL borra todas las políticas actuales** de esas tablas en lugar de agregar encima. Sin conocerlas, una política permisiva vieja podía seguir dejando ver todo. Por eso el PASO 0 pide guardarlas antes.
9. **Las páginas de navegador que usan el token de Clerk siguen igual:** `/encuesta`, `/nom035`, `/onboarding` y `/api/pulso`. El SQL les da acceso solo a sus propias filas. Moverlas al servidor era más trabajo y no era necesario.
10. **Dejé sin tocar el código viejo que nadie usa:** `app/dashboard/serverActions.ts`, `components/formularioscaptura.tsx`, `components/private-ai/page.tsx` y `app/evaluacion/[id]/page.tsx`. Usan la clave pública con tablas que el SQL cierra, así que dejarán de funcionar, pero ninguna página los usa o enlaza.

## Qué probé

- **`npx tsc --noEmit`:** solo los 3 errores que ya existían (`mockData` y `Avatar3D`), ninguno nuevo.
- **ESLint en los archivos cambiados:** el mismo número de avisos que antes en cada archivo. Las rutas nuevas no tienen ningún aviso.
- **`next build`:** compila completo (49 páginas).
- **Servidor local sin sesión:**
  - `/api/nom035-resultados`, `/api/resultados`, `/api/buzon`, `/api/progreso/*`, `/api/chat`, `/api/nom035/interpretar` y `/insights` responden 404: Clerk los bloquea antes de llegar a la ruta.
  - `/api/prospectos` con campos incompletos (no envía correo) responde 400 cinco veces y **429** a la sexta: el límite funciona.
- **SQL:** el parser oficial de Postgres (libpg-query 17) acepta las 17 sentencias del PASO 1 y las 14 de los bloques comentados. El código dentro de los bloques `DO` solo lo revisé a mano.

## Qué no pude probar

- **Nada con sesión iniciada:** el buzón, `/ia`, el progreso, los paneles y la página NOM-035 con datos reales. No tenía usuario de Clerk y no debía tocar la base de datos.
- **El SQL contra tu base real.** No sé si alguna tabla tiene `user_id` de tipo `uuid` (debe ser texto). Si es `uuid`, el SQL falla y no aplica nada, porque va dentro de una transacción.
- **Si la integración Clerk → Supabase manda `role: authenticated` y el id de Clerk en `sub`.** El SQL depende de eso para `/encuesta`, `/nom035`, `/onboarding`, el dashboard y `/api/pulso`.
- **El límite de `/api/psicologo-auth` en local:** el middleware de Clerk exige sesión antes de esa ruta (ya era así antes de mis cambios).
- **Las variables configuradas en el panel de Vercel.**

## Qué debes hacer tú

1. **Revisar la rama** (`git log main..seguridad-fase-1`) y, si te convence, unirla y publicarla.
2. **Probar con sesión en la versión publicada:**
   - como empleado: buzón, `/ia`, `/entrenamiento`, `/psicoeducacion`, `/pulso`, `/encuesta`, `/nom035` y `/mi-bienestar`;
   - como psicólogo: `/panel-psicologo`, `/psicologo/panel`, `/nom035-resultados` (con la interpretación por IA) e `/insights`.
3. **En Supabase > SQL Editor:**
   1. Correr y **guardar** el PASO 0.
   2. Confirmar que `user_id` es `text` en todas las tablas.
   3. Pegar y correr el PASO 1.
   4. Correr el PASO 2: (b) debe dar *permission denied* y (c) debe contar solo las filas de esa persona.
4. **Repetir las pruebas del punto 2.** Si algo de empleado falla con error de permisos, lo más probable es que el JWT de Clerk no traiga `role: authenticated`. Revísalo en Supabase > Authentication > Third-party (Clerk). Si necesitas volver atrás mientras se corrige, está el rollback de emergencia del SQL.
5. **Cambiar `PSICOLOGO_PASSWORD`** si alguien que ya no debe la conoce. La protección real es el rol en Clerk.
6. **Para fases siguientes:**
   - límite de uso global (Upstash Redis o una tabla en Supabase);
   - borrar el código viejo listado en las decisiones;
   - actualizar el aviso de privacidad para nombrar a Groq, Clerk, Supabase, Vercel y Resend;
   - separación por empresa (`empresa_id`) antes del segundo cliente.
