"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Play,
  MessageCircle,
  BookOpen,
  Activity,
  ShieldCheck,
} from "lucide-react";

const items = [
  {
    href: "/shorts",
    label: "Shorts",
    icon: Play,
  },
  {
    href: "/experiencia",
    label: "Psyqus",
    icon: MessageCircle,
  },
  {
    href: "/psicoeducacion",
    label: "Aprender",
    icon: BookOpen,
  },
  {
    href: "/mi-bienestar",
    label: "Mi bienestar",
    icon: Activity,
  },
  {
    href: "/buzon",
    label: "Buzón",
    icon: ShieldCheck,
  },
];

export default function PsyqusNavigation() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#070d1c]/95 backdrop-blur-xl"
    >
      <div className="mx-auto grid max-w-xl grid-cols-5 gap-1 px-2 pt-2 pb-[calc(0.65rem+env(safe-area-inset-bottom))]">
        {items.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition ${
                active
                  ? "bg-cyan-400/10 text-cyan-300"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                aria-hidden="true"
                className="h-5 w-5"
                strokeWidth={active ? 2.5 : 1.8}
              />

              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
