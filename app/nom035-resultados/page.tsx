import Link from "next/link";
import { EMPRESAS_NOM035 } from "@/lib/nom035-empresas";

/*
  Selector de empresa para Resultados NOM-035.
  Cada empresa tiene su página separada.
*/
export default function ElegirEmpresaNom035Page() {
  return (
    <main className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <section className="max-w-4xl mx-auto">
        <p className="text-cyan-400 uppercase tracking-[0.3em] text-sm">
          Psyqus
        </p>

        <h1 className="mt-3 text-5xl font-black text-cyan-300">
          Resultados NOM-035
        </h1>

        <p className="mt-3 text-slate-400">
          Elige la empresa para consultar sus resultados,
          gráficas y reportes.
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-5">
          {EMPRESAS_NOM035.map((empresa) => (
            <Link
              key={empresa.id}
              href={`/nom035-resultados/${empresa.id}`}
              className="rounded-3xl border border-cyan-500/20 bg-slate-900/70 p-7 hover:bg-slate-800/80 hover:border-cyan-400/50 transition"
            >
              <p className="text-2xl font-black text-white">
                {empresa.nombre}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                {empresa.descripcion}
              </p>

              <p className="mt-6 text-sm font-black text-cyan-300">
                Ver resultados →
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
