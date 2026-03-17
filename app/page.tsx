import Link from 'next/link';
import { Activity, Shield, Brain, Lock } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden">
      {/* Fondo animado con gradientes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      {/* Header con estado del sistema */}
      <header className="relative z-10 flex justify-between items-center p-6 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          <span className="text-xs font-mono tracking-widest text-green-400 uppercase">
            Sistema Activo
          </span>
        </div>
        
        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className="px-4 py-2 text-sm font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-all"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        {/* Logo principal */}
        <div className="text-center mb-12">
          <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter leading-none bg-gradient-to-b from-white via-white to-slate-500 bg-clip-text text-transparent mb-4">
            PSYQUS
          </h1>
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-500" />
            <p className="text-cyan-400 font-mono tracking-[0.4em] uppercase text-sm">
              Intelligence & Peace Management
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-500" />
          </div>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
            Plataforma de inteligencia psicológica organizacional para la detección 
            y prevención de riesgos psicosociales NOM-035
          </p>
        </div>

        {/* Grid de navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          <Link href="/dashboard" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
              <Activity className="w-10 h-10 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Dashboard</h3>
              <p className="text-sm text-slate-400">Radar de bienestar y análisis NOM-035 en tiempo real</p>
              <div className="mt-4 flex items-center text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Acceder <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link href="/encuesta" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
              <Brain className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Evaluación</h3>
              <p className="text-sm text-slate-400">Cuestionario de factores de riesgo psicosocial</p>
              <div className="mt-4 flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Comenzar <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link href="/buzon" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
              <Shield className="w-10 h-10 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Buzón de Paz</h3>
              <p className="text-sm text-slate-400">Canal seguro y anónimo de reporte</p>
              <div className="mt-4 flex items-center text-green-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Reportar <span className="ml-2">→</span>
              </div>
            </div>
          </Link>

          <Link href="/psicologo" className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative p-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
              <Lock className="w-10 h-10 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold text-white mb-2">Área Psicólogo</h3>
              <p className="text-sm text-slate-400">Acceso protegido para profesionales</p>
              <div className="mt-4 flex items-center text-orange-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Verificar <span className="ml-2">→</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center">
        <p className="text-slate-600 font-mono text-xs tracking-widest uppercase">
          Compliance NOM-035-STPS-2018 • Secure Data • v2.4.1
        </p>
      </footer>
    </main>
  );
}