import "server-only";
import { createClient } from "@supabase/supabase-js";

/*
  Cliente con SERVICE ROLE: ignora RLS.

  Solo debe usarse en servidor (route handlers y
  Server Components) DESPUÉS de verificar la sesión
  de Clerk y, cuando aplique, el rol. Toda consulta
  de datos personales debe filtrar por el userId de
  la sesión o estar restringida a profesionales.

  "server-only" hace fallar el build si algún
  componente de cliente intenta importarlo.
*/
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
