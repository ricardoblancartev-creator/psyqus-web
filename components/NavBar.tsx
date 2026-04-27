"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Shield,
  Sparkles,
  Stethoscope,
  GraduationCap,
} from "lucide-react";
import clsx from "clsx";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/encuesta",
    label: "Encuesta",
    icon: ClipboardList,
  },
  {
    href: "/ia",
    label: "IA",
    icon: Sparkles,
  },
  {
    href: "/buzon",
    label: "Buzón",
    icon: Shield,
  },
  {
    href: "/psicoeducacion",
    label: "Psicoeducación",
    icon: BookOpen,
  },
  {
    href: "/resultados",
    label: "Resultados",
    icon: LineChart,
  },
  {
    href: "/panel-psicologo",
    label: "Psicólogo",
    icon: Stethoscope,
  },
  {
    href: "/entrenamiento",
    label: "Entrenamiento",
    icon: GraduationCap,
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-72 flex-col border-r border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="px-6 py-6 border-b border-white/10">
          <Link href="/dashboard" className="block">
            <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-400/70 font-semibold mb-2">
              Psyqus System
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white">
                  PSYQUS
                </h1>
                <p className="text-xs text-slate-500">
                  NOM-035 Intelligence Interface
                </p>
              </div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href || pathname?.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 shadow-[0_0_35px_rgba(34,211,238,0.06)]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <div
                  className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center border transition",
                    active
                      ? "bg-cyan-500/10 border-cyan-400/20"
                      : "bg-white/5 border-white/10 group-hover:border-white/20"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="rounded-2xl border border-fuchsia-400/15 bg-fuchsia-500/10 p-4">
            <p className="text-[10px] uppercase tracking-[0.28em] text-fuchsia-300/80 font-semibold">
              Cognitive Layer
            </p>
            <p className="mt-2 text-sm text-slate-200 leading-relaxed">
              Plataforma para evaluación, mediación y entrenamiento de bienestar organizacional.
            </p>
          </div>
        </div>
      </aside>

      <header className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
        <div className="px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white">PSYQUS</h1>
              <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-400/70">
                Nom-035 System
              </p>
            </div>
          </Link>

          <div className="mt-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">
              {links.map((link) => {
                const active =
                  pathname === link.href || pathname?.startsWith(`${link.href}/`);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "rounded-full border px-4 py-2 text-xs font-semibold whitespace-nowrap transition",
                      active
                        ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
                        : "border-white/10 bg-white/5 text-slate-300"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}