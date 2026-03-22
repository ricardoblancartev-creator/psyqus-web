import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ModeloBPSE from "@/components/modelobpss";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  const secciones = [
    { nombre: "Evaluación NOM-035", link: "/encuesta", icono: "📋", desc: "Evalúa riesgos psicosociales" },
    { nombre: "Asistente IA", link: "/ia", icono: "🤖", desc: "Chat con inteligencia artificial" },
    { nombre: "Psicoeducación", link: "/psicoeducacion", icono: "📚", desc: "Recursos educativos" },
    { nombre: "Entrenamiento", link: "/entrenamiento", icono: "🏋️", desc: "Ejercicios de bienestar" },
    { nombre: "Resultados", link: "/resultados", icono: "📊", desc: "Visualiza tus evaluaciones" },
    { nombre: "Insights", link: "/insights", icono: "📈", desc: "Análisis de progreso" },
    { nombre: "Buzón de Paz", link: "/buzon", icono: "📬", desc: "Espacio seguro" },
    { nombre: "Panel Psicólogo", link: "/panel-psicologo", icono: "👥", desc: "Herramientas profesionales" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navbar con logo */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <Image 
                src="/pysqus-logo.jpg" 
                alt="Psyqus" 
                width={40} 
                height={40}
                className="rounded-xl"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Psyqus
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">Monitor de Salud Psicosocial</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 hidden md:block">
                {user?.emailAddresses[0]?.emailAddress}
              </span>
              <Link
                href="/api/auth/sign-out"
                className="text-sm text-slate-600 hover:text-red-500 transition px-3 py-1.5 rounded-lg hover:bg-red-50"
              >
                Salir
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero / Bienvenida */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 mb-8 text-white">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-2">
              ¡Hola, {user?.firstName || "Bienvenido"}! 👋
            </h2>
            <p className="text-blue-100 mb-4">
              Psyqus - Monitor de Salud Psicosocial Inteligente
            </p>
            <p className="text-sm text-blue-100/80">
              Basado en la NOM-035 · Evaluación integral de riesgos psicosociales
            </p>
          </div>
        </div>

        {/* Modelo BPSE */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-8">
          <ModeloBPSE />
        </div>

        {/* Secciones */}
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Herramientas
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {secciones.map((seccion, index) => (
            <Link
              key={index}
              href={seccion.link}
              className="group bg-white rounded-xl p-5 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-200"
            >
              <div className="text-3xl mb-3">{seccion.icono}</div>
              <h4 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition">
                {seccion.nombre}
              </h4>
              <p className="text-slate-500 text-sm">
                {seccion.desc}
              </p>
              <div className="mt-3 text-blue-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Acceder <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-blue-100 text-center">
          <p className="text-slate-400 text-sm">
            🌊 Psyqus · Inteligencia y Bienestar Psicosocial
          </p>
        </div>
      </div>
    </div>
  );
}