import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ModeloBPSE from "@/components/modelobpss";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const secciones = [
    { nombre: "📋 Evaluación NOM-035", link: "/encuesta", desc: "Evalúa riesgos psicosociales" },
    { nombre: "🤖 Asistente IA", link: "/ia", desc: "Chat con inteligencia artificial" },
    { nombre: "📚 Psicoeducación", link: "/psicoeducacion", desc: "Recursos educativos" },
    { nombre: "🏋️ Entrenamiento", link: "/entrenamiento", desc: "Ejercicios de bienestar" },
    { nombre: "📊 Resultados", link: "/resultados", desc: "Visualiza tus evaluaciones" },
    { nombre: "📈 Insights", link: "/insights", desc: "Análisis de progreso" },
    { nombre: "📬 Buzón de Paz", link: "/buzon", desc: "Espacio seguro" },
    { nombre: "👥 Panel Psicólogo", link: "/panel-psicologo", desc: "Herramientas profesionales" }
  ];

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Navbar */}
      <nav className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Psyqus
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
              <Link
                href="/api/auth/sign-out"
                className="text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg transition"
              >
                Salir
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Saludo */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">
            ¡Hola, {user?.firstName || "Bienvenido"}! 👋
          </h2>
          <p className="text-slate-400 mt-1">
            Psyqus - Evaluación de riesgos psicosociales NOM-035
          </p>
        </div>

        {/* Modelo Bio-Psico-Social-Espiritual */}
        <div className="mb-12 bg-[#0f172a]/50 rounded-2xl p-6 border border-slate-800">
          <ModeloBPSE />
        </div>

        {/* Secciones */}
        <h3 className="text-xl font-semibold text-white mb-6">
          Explora tus herramientas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secciones.map((seccion, index) => (
            <Link
              key={index}
              href={seccion.link}
              className="group block bg-[#0f172a] rounded-xl p-6 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              <div className="text-3xl mb-3">{seccion.nombre.split(" ")[0]}</div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {seccion.nombre}
              </h4>
              <p className="text-slate-400 text-sm">
                {seccion.desc}
              </p>
              <div className="mt-4 text-cyan-400 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Explorar <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-slate-500 text-sm">
            🌱 "El bienestar comienza con el autoconocimiento. Psyqus te acompaña en tu camino."
          </p>
        </div>
      </div>
    </div>
  );
}