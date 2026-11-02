-- =====================================================================
-- Psyqus · Seguridad fase 1 · RLS en tablas con datos de empleados
-- =====================================================================
--
-- NO se ejecutó desde el código. Pegar en Supabase > SQL Editor.
--
-- Qué hace:
--   1. Activa RLS en cada tabla con datos de empleados (si existe).
--   2. Quita TODOS los permisos de la clave pública (rol anon).
--   3. Borra las políticas que existan en esas tablas y crea solo las
--      necesarias. Esto NO borra datos; solo reglas de acceso.
--   4. Usuarios con sesión de Clerk (rol authenticated) solo pueden
--      ver/escribir SUS filas, y solo en las tablas que la app lee o
--      escribe desde el navegador. Nadie puede borrar desde el navegador.
--   5. El resto de tablas queda solo para el servidor (service_role, que
--      ignora RLS y se usa después de verificar sesión y rol con Clerk).
--
-- Cómo accede la app a cada tabla tras la rama seguridad-fase-1:
--
--   Tabla                     Navegador (token Clerk)        Servidor (service_role)
--   ------------------------  -----------------------------  -----------------------
--   empleados                 leer/crear/actualizar la suya  paneles profesionales
--   nom035_evaluaciones       leer/crear las suyas           /api/nom035-resultados, paneles
--   resultados_encuestas      leer/crear las suyas           /resultados, /insights, paneles
--   pulsos_semanales          leer/crear/actualizar la suya  panel profesional
--                             (vía /api/pulso con token)
--   interacciones_psyqus      —                              /api/buzon, /api/chat, paneles
--   progreso_entrenamiento    —                              /api/progreso/entrenamiento
--   progreso_psicoeducacion   —                              /api/progreso/psicoeducacion
--   buzon_mensajes            —                              /insights
--   prospectos                —                              (formulario usa correo, no BD)
--   chats, respuestas,        —                              código heredado sin uso real
--   resultados_encuesta
--
-- NO se toca contenido_bienestar (catálogo público de Shorts).
--
-- Requisito: la integración Clerk → Supabase debe enviar el JWT con
-- role = "authenticated" y el id de Clerk en "sub". Es lo que hace la
-- integración nativa de Clerk ("Third-party auth"). Ver PASO 0.
-- =====================================================================


-- =====================================================================
-- PASO 0 · DIAGNÓSTICO (ejecutar primero y GUARDAR el resultado)
-- Sirve para poder restaurar políticas anteriores si algo falla.
-- =====================================================================

-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;

-- select tablename, policyname, permissive, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, policyname;

-- Tipo de la columna user_id (debe ser text/varchar, no uuid):
-- select table_name, data_type
-- from information_schema.columns
-- where table_schema = 'public' and column_name = 'user_id'
-- order by table_name;


-- =====================================================================
-- PASO 1 · APLICAR
-- =====================================================================

begin;

do $$
declare
  t text;
  p record;

  -- Todas las tablas con datos de empleados o prospectos.
  tablas text[] := array[
    'empleados',
    'nom035_evaluaciones',
    'resultados_encuestas',
    'pulsos_semanales',
    'interacciones_psyqus',
    'progreso_entrenamiento',
    'progreso_psicoeducacion',
    'buzon_mensajes',
    'prospectos',
    'chats',
    'respuestas',
    'resultados_encuesta'
  ];
begin
  foreach t in array tablas loop
    if to_regclass(format('public.%I', t)) is null then
      raise notice 'Tabla % no existe, se omite', t;
      continue;
    end if;

    execute format('alter table public.%I enable row level security', t);

    -- La clave pública (anon) no puede hacer nada.
    execute format('revoke all on table public.%I from anon', t);

    -- Por defecto, authenticated tampoco; abajo se dan permisos puntuales.
    execute format('revoke all on table public.%I from authenticated', t);

    for p in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = t
    loop
      raise notice 'Eliminando política % en %', p.policyname, t;
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
  end loop;
end
$$;


-- ---------------------------------------------------------------------
-- empleados: cada usuario lee, crea y actualiza solo su perfil
-- (onboarding hace upsert; encuesta, nom035 y dashboard lo leen).
-- ---------------------------------------------------------------------
grant select, insert, update on table public.empleados to authenticated;

create policy "empleados_select_propio" on public.empleados
  for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "empleados_insert_propio" on public.empleados
  for insert to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

create policy "empleados_update_propio" on public.empleados
  for update to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));


-- ---------------------------------------------------------------------
-- nom035_evaluaciones: el empleado crea y lee solo las suyas.
-- Sin update: una evaluación enviada no se modifica desde el navegador.
-- ---------------------------------------------------------------------
grant select, insert on table public.nom035_evaluaciones to authenticated;

create policy "nom035_select_propio" on public.nom035_evaluaciones
  for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "nom035_insert_propio" on public.nom035_evaluaciones
  for insert to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));


-- ---------------------------------------------------------------------
-- resultados_encuestas (clima): el empleado crea y lee solo las suyas.
-- ---------------------------------------------------------------------
grant select, insert on table public.resultados_encuestas to authenticated;

create policy "clima_select_propio" on public.resultados_encuestas
  for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "clima_insert_propio" on public.resultados_encuestas
  for insert to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));


-- ---------------------------------------------------------------------
-- pulsos_semanales: /api/pulso hace upsert con el token del usuario.
-- ---------------------------------------------------------------------
grant select, insert, update on table public.pulsos_semanales to authenticated;

create policy "pulso_select_propio" on public.pulsos_semanales
  for select to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'));

create policy "pulso_insert_propio" on public.pulsos_semanales
  for insert to authenticated
  with check (user_id = (select auth.jwt() ->> 'sub'));

create policy "pulso_update_propio" on public.pulsos_semanales
  for update to authenticated
  using (user_id = (select auth.jwt() ->> 'sub'))
  with check (user_id = (select auth.jwt() ->> 'sub'));


-- Las demás tablas quedan con RLS activo, sin políticas y sin permisos
-- para anon/authenticated: solo el servidor (service_role) accede.

commit;


-- =====================================================================
-- PASO 2 · VERIFICAR (después de aplicar)
-- =====================================================================

-- a) Todas las tablas de la lista deben decir true:
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
-- order by tablename;

-- b) La clave pública ya no lee nada (debe dar ERROR "permission denied"):
-- begin;
-- set local role anon;
-- select count(*) from public.nom035_evaluaciones;
-- rollback;

-- c) Un usuario con sesión solo ve sus filas (cambia el id por uno real
--    de Clerk; debe contar solo las evaluaciones de esa persona):
-- begin;
-- set local role authenticated;
-- select set_config('request.jwt.claims',
--   '{"sub":"user_XXXXXXXX","role":"authenticated"}', true);
-- select count(*) from public.nom035_evaluaciones;
-- rollback;


-- =====================================================================
-- ROLLBACK DE EMERGENCIA (solo si la app deja de funcionar)
-- Desactiva RLS y devuelve permisos. Vuelve a dejar los datos EXPUESTOS:
-- usar solo mientras se corrige, y restaurar luego con el PASO 1.
-- Las políticas anteriores se recrean a mano con lo guardado en PASO 0.
-- =====================================================================

-- do $$
-- declare t text;
-- begin
--   foreach t in array array[
--     'empleados','nom035_evaluaciones','resultados_encuestas',
--     'pulsos_semanales','interacciones_psyqus','progreso_entrenamiento',
--     'progreso_psicoeducacion','buzon_mensajes','prospectos','chats',
--     'respuestas','resultados_encuesta'
--   ] loop
--     if to_regclass(format('public.%I', t)) is not null then
--       execute format('alter table public.%I disable row level security', t);
--       execute format('grant all on table public.%I to anon, authenticated', t);
--     end if;
--   end loop;
-- end
-- $$;
