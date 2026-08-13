"use client";

import { useState } from "react";
import { useSession, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase-clerk";


export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { session } = useSession();
  const router = useRouter();


  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [area, setArea] = useState("");
  const [puesto, setPuesto] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        Cargando...
      </main>
    );
  }

async function guardarPerfil() {
  if (!user || !session) return;

  if (!nombre || !apellido || !area || !puesto) {
    setError("Completa todos los campos.");
    return;
  }

  setLoading(true);
  setError("");

  const email = user.emailAddresses?.[0]?.emailAddress || null;

  const supabase = createClerkSupabaseClient(async () => {
    return session.getToken();
  });

  const { error: supabaseError } = await supabase
    .from("empleados")
    .upsert(

        {
          user_id: user.id,
          nombre,
          apellido,
          email,
          area,
          puesto,
        },
        {
          onConflict: "user_id",
        }
      );

if (supabaseError) {
  console.error("SUPABASE ERROR:", supabaseError);

  alert(
    `Error Supabase:
Código: ${supabaseError.code}
Mensaje: ${supabaseError.message}
Detalle: ${supabaseError.details}
Hint: ${supabaseError.hint}`
  );

  setError("No se pudo guardar el perfil.");
  setLoading(false);
  return;
}


    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-[0_0_80px_rgba(34,211,238,0.08)]">

        <p className="text-xs uppercase tracking-[0.3em] text-cyan-400">
          Psyqus
        </p>

        <h1 className="mt-4 text-4xl md:text-5xl font-black">
          Completa tu perfil
        </h1>

        <p className="mt-4 text-slate-400 leading-relaxed">
          Antes de ingresar necesitamos algunos datos para identificar tus
          evaluaciones dentro de la organización.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          <div>
            <label className="block mb-2 text-sm text-slate-400">
              Nombre
            </label>

            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ejemplo: Roberto"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-400">
              Apellido
            </label>

            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ejemplo: Hernández"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-400">
              Área
            </label>

            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ejemplo: Ventas"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
            />
          </div>

          <div>
            <label className="block mb-2 text-sm text-slate-400">
              Puesto
            </label>

            <input
              value={puesto}
              onChange={(e) => setPuesto(e.target.value)}
              placeholder="Ejemplo: Ejecutivo"
              className="w-full rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none focus:border-cyan-400/50"
            />
          </div>

        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={guardarPerfil}
          disabled={loading}
          className="mt-8 w-full rounded-2xl bg-cyan-400 px-6 py-5 text-lg font-black text-slate-950 hover:bg-cyan-300 transition disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Continuar a Psyqus"}
        </button>

      </div>
    </main>
  );
}
