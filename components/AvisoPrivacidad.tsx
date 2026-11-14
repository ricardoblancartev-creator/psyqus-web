import Link from "next/link";
import { LockKeyhole, ShieldCheck, Phone } from "lucide-react";

/*
  Avisos de privacidad cortos, en el lugar donde la persona escribe.
  - "chat": orientador / acompañante. El texto de la conversación NO se guarda
    (ver app/api/chat/route.ts), por eso se puede decir que nadie lo lee.
  - "buzon": los mensajes del buzón SÍ los lee el equipo de apoyo.
  - "general": datos de la empresa y resultados.
*/

const LINEA_DE_LA_VIDA = "800 911 2000";

export default function AvisoPrivacidad({
  variante,
  className = "",
}: {
  variante: "chat" | "buzon" | "general";
  className?: string;
}) {
  if (variante === "chat") {
    return (
      <div className={`rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-4 text-sm leading-relaxed text-slate-300 ${className}`}>
        <p className="flex items-center gap-2 font-bold text-emerald-300">
          <LockKeyhole className="h-4 w-4" /> Lo que escribes aquí es privado
        </p>
        <p className="mt-1">
          No guardamos el texto de tus conversaciones: nadie de tu empresa ni de Psyqus puede leerlo.
        </p>
        <p className="mt-2 flex items-start gap-2 text-slate-400">
          <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
          <span>
            El orientador no puede avisar a nadie. Si tu vida o la de otra persona está en peligro, llama al{" "}
            <strong className="text-white">911</strong> o a la Línea de la Vida{" "}
            <strong className="text-white">{LINEA_DE_LA_VIDA}</strong> (gratis, 24 h).
          </span>
        </p>
      </div>
    );
  }

  if (variante === "buzon") {
    return (
      <div className={`rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] p-4 text-sm leading-relaxed text-slate-300 ${className}`}>
        <p className="flex items-center gap-2 font-bold text-amber-300">
          <ShieldCheck className="h-4 w-4" /> Quién lee tu mensaje
        </p>
        <p className="mt-1">
          Tu mensaje lo recibe el equipo de apoyo de Psyqus, supervisado por un profesional de la psicología, para poder
          ayudarte. Se trata con confidencialidad y no se comparte con tu empresa.
        </p>
        <p className="mt-2 text-slate-400">
          La única excepción: si lo que nos cuentas pone en peligro tu vida o la de otras personas, podremos actuar para
          protegerte. Si es una emergencia, llama al <strong className="text-white">911</strong> o a la Línea de la Vida{" "}
          <strong className="text-white">{LINEA_DE_LA_VIDA}</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-5 text-sm leading-relaxed text-slate-300 ${className}`}>
      <p className="flex items-center gap-2 font-bold text-cyan-300">
        <ShieldCheck className="h-4 w-4" /> Tu privacidad en Psyqus
      </p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5">
        <li>Tus datos y los de tu empresa están protegidos con medidas de seguridad y acceso restringido.</li>
        <li>
          Los resultados de tus evaluaciones los calcula el sistema y su interpretación está regulada y supervisada por un
          profesional de la psicología.
        </li>
        <li>
          Lo que escribes al orientador no se guarda: nadie puede leerlo. Los mensajes del buzón solo los lee el equipo de
          apoyo, y solo se actúa fuera de la confidencialidad si hay peligro para tu vida o la de otras personas.
        </li>
      </ul>
      <Link href="/privacidad" className="mt-3 inline-block font-semibold text-cyan-300 hover:underline">
        Leer el aviso de privacidad completo
      </Link>
    </div>
  );
}
