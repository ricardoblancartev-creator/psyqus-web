"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  AlertTriangle, 
  Brain, 
  FileText, 
  LogOut,
  TrendingUp,
  Shield 
} from "lucide-react";
import Link from "next/link";

export default function PanelPsicologo() {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    const auth = sessionStorage.getItem("psicologo_auth");
    if (!auth) {
      router.push("/psicologo");
    }
  }, [router]);

  const handleLogout = () => {
    sessionStorage.removeItem("psicologo_auth");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Panel Psicólogo</h1>
              <p className="text-xs text-slate-400">Vista profesional • NOM-035</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
            <Users className="w-8 h-8 text-cyan-400 mb-3" />
            <p className="text-slate-400 text-sm">Evaluaciones hoy</p>
            <p className="text-3xl font-bold">24</p>
          </div>
          
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-slate-400 text-sm">Alertas críticas</p>
            <p className="text-3xl font-bold">3</p>
          </div>
          
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
            <Brain className="w-8 h-8 text-purple-400 mb-3" />
            <p className="text-slate-400 text-sm">Índice bienestar</p>
            <p className="text-3xl font-bold">72%</p>
          </div>
          
          <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <p className="text-slate-400 text-sm">Tendencia</p>
            <p className="text-3xl font-bold text-green-400">+5%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/resultados"
            className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-cyan-500/30 transition-all group"
          >
            <FileText className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Resultados Detallados</h3>
            <p className="text-slate-400 text-sm">Análisis por individuo y departamento</p>
          </Link>

          <Link 
            href="/buzon"
            className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-green-500/30 transition-all group"
          >
            <Shield className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Buzón de Paz</h3>
            <p className="text-slate-400 text-sm">Mensajes anónimos y reportes</p>
          </Link>

          <Link 
            href="/dashboard"
            className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:border-purple-500/30 transition-all group"
          >
            <Brain className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold mb-2">Dashboard General</h3>
            <p className="text-slate-400 text-sm">Vista organizacional completa</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
