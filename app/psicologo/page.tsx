"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function PsicologoAccess() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Contraseña de acceso (puedes cambiarla aquí)
    const PSICOLOGO_PASSWORD = "Psyqus2024!";

    if (password === PSICOLOGO_PASSWORD) {
      // 1. Guardamos la sesión local para proteger la siguiente ruta
      sessionStorage.setItem("psicologo_auth", "true");
      
      // 2. Redirigimos a la subcarpeta /panel dentro de psicologo
      // Esto evita el error 404 si la carpeta se llama 'panel'
      router.push("/psicologo/panel");
    } else {
      setError("Contraseña incorrecta. Acceso denegado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Cabecera del Login */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Área Profesional
          </h1>
          <p className="text-slate-400 text-sm">
            Acceso exclusivo para psicólogos organizacionales de Psyqus
          </p>
        </div>

        {/* Formulario de Acceso */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa la contraseña maestra"
              className="w-full px-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all shadow-inner"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2 animate-shake">
              <ShieldCheck size={16} />
              {error}
            </div>
          )}

          {/* Botón de Entrada */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold rounded-xl hover:from-orange-500 hover:to-red-500 transition-all shadow-lg shadow-orange-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                Verificando credenciales...
              </span>
            ) : (
              "Acceder al Panel de Supervisión"
            )}
          </button>
        </form>

        {/* Link de Retorno */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-slate-500 hover:text-cyan-400 text-sm transition-colors flex items-center justify-center gap-2"
          >
            ← Volver al Portal General
          </a>
        </div>
      </div>
    </div>
  );
}