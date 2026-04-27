"use client";
import { useState, useEffect } from "react";
// Importamos directamente la página del panel psicólogo que vimos en tu estructura
import DashboardPsicologo from "../panel-psicologo/page"; 

export default function AdminPage() {
  const [pass, setPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const checkPass = () => {
    if (pass === "Psyqus2026!") {
      setIsAuth(true);
      sessionStorage.setItem("admin_auth", "true");
    } else {
      alert("Acceso denegado");
      setPass("");
    }
  };

  if (!mounted) return null;

  if (isAuth || (typeof window !== 'undefined' && sessionStorage.getItem("admin_auth") === "true")) {
    return <DashboardPsicologo />;
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <input 
        type="password" 
        value={pass}
        placeholder="..." 
        autoFocus
        className="bg-transparent border-none text-slate-800 text-center focus:outline-none text-2xl tracking-widest"
        onChange={(e) => setPass(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && checkPass()}
      />
    </div>
  );
}