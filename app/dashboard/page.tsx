import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ModeloBPSE from "@/components/modelobpss"; // Ajusta la ruta si es necesario

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Todas las secciones de Psyqus
  const secciones = [
    {
      nombre: "📋 Evaluación NOM-035",
      descripcion: "Realiza la evaluación de riesgos psicosociales",
      link: "/encuesta",
      color: "from-blue-500 to-blue-600"
    },
    {
      nombre: "🤖 Asistente IA",
      descripcion: "Chatea con nuestra inteligencia artificial",
      link: "/ia",
      color: "from-purple-500 to-purple-600"
    },
    {
      nombre: "📚 Psicoeducación",
      descripcion: "Artículos y recursos para tu desarrollo",
      link: "/psicoeducacion",
      color: "from-green-500 to-green-600"
    },
    {
      nombre: "🏋️ Entrenamiento",
      descripcion: "Ejercicios prácticos de bienestar",
      link: "/entrenamiento",
      color: "from-orange-500 to-orange-600"
    },
    {
      nombre: "📊 Resultados",
      descripcion: "Visualiza tus evaluaciones",
      link: "/resultados",
      color: "from-red-500 to-red-600"
    },
    {
      nombre: "📈 Insights",
      descripcion: "Análisis y métricas de tu progreso",
      link: "/insights",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      nombre: "📬 Buzón de Paz",
      descripcion: "Espacio seguro para expresarte",
      link: "/buzon",
      color: "from-teal-500 to-teal-600"
    },
    {
      nombre: "👥 Panel Psicólogo",
      descripcion: "Herramientas para profesionales",
      link: "/panel-psicologo",
      color: "from-pink-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Psyqus
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
              <Link
                href="/api/auth/sign-out"
                className="text-sm bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition"
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
          <h2 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.firstName || "Bienvenido"}! 👋
          </h2>
          <p className="text-gray-600 mt-1">
            Psyqus - Evaluación de riesgos psicosociales NOM-035
          </p>
        </div>

        {/* Modelo Bio-Psico-Social-Espiritual */}
        <div className="mb-12">
          <ModeloBPSE />
        </div>

        {/* Secciones principales */}
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Explora tus herramientas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {secciones.map((seccion, index) => (
            <Link
              key={index}
              href={seccion.link}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${seccion.color} opacity-10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-500`} />
              <div className="relative z-10">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
                  {seccion.nombre}
                </h4>
                <p className="text-gray-500 text-sm">
                  {seccion.descripcion}
                </p>
                <div className="mt-4 text-cyan-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Explorar <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Frase motivacional */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            🌱 "El bienestar comienza con el autoconocimiento. Psyqus te acompaña en tu camino."
          </p>
        </div>
      </div>
    </div>
  );
}