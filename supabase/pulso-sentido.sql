-- =====================================================================
-- Psyqus · Pregunta "Sentido" del pulso semanal (dimensión espiritual)
-- =====================================================================
-- Agrega una columna nueva y opcional. No borra ni cambia datos: los
-- pulsos anteriores quedan con sentido vacío (null).
-- Las reglas de acceso (RLS) de pulsos_semanales no cambian: cada quien
-- sigue viendo y guardando solo su propio pulso.
-- Pegar en Supabase > SQL Editor.
-- =====================================================================

alter table public.pulsos_semanales
  add column if not exists sentido smallint
  check (sentido between 1 and 5);
