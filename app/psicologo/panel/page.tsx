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

    // ACTUALIZADO: Clave 2026
    const PSICOLOGO_PASSWORD = "Psyqus2026!";

    if (password === PSICOLOGO_PASSWORD) {
      sessionStorage.setItem("psicologo_auth", "true");
      router.push("/psicologo/panel");
    } else {
      setError("Contraseña incorrecta. Acceso denegado.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 font-sans text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Lock className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Área Profesional</h1>
          <p className="text-slate-500 text-sm italic mt-2">Acceso exclusivo Psicología Organizacional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña Maestra"
              className="w-full px-4 py-4 bg-slate-900/50 border border-slate-700 rounded-xl focus:border-orange-500 transition-all outline-none"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <ShieldCheck size={16} /> {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-4 bg-orange-600 hover:bg-orange-500 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
            {loading ? "Verificando..." : "Acceder al Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}