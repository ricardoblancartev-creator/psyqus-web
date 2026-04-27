"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function PsicologoLogin() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/psicologo-auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        setError(data?.error || "Acceso denegado.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("psicologo_auth", "true");
      router.push("/panel-psicologo");
    } catch {
      setError("No pude validar el acceso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white relative overflow-hidden flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:42px_42px]" />

      <div className="relative w-full max-w-md">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl p-8 shadow-[0_0_60px_rgba(0,255,255,0.05)]">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-cyan-300" />
            </div>

            <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400/70 font-semibold">
              Área restringida
            </p>

            <h1 className="text-3xl font-black mt-2">Acceso profesional</h1>

            <p className="text-sm text-slate-400 mt-2">
              Panel de análisis clínico y seguimiento psicosocial
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs uppercase tracking-widest text-slate-500">
                Código de acceso
              </label>

              <div className="relative mt-2">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:outline-none focus:border-cyan-400/40"
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black hover:bg-cyan-400 transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Accediendo..." : "Entrar"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-6">
            Acceso exclusivo para personal autorizado Psyqus
          </p>
        </div>
      </div>
    </main>
  );
}