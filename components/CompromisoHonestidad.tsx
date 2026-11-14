"use client";

/*
  Casilla obligatoria antes de empezar un cuestionario:
  la persona se compromete a responder con honestidad.
*/
export default function CompromisoHonestidad({
  aceptado,
  onChange,
}: {
  aceptado: boolean;
  onChange: (valor: boolean) => void;
}) {
  return (
    <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4 text-sm leading-relaxed text-slate-200">
      <input
        id="compromiso-honestidad"
        type="checkbox"
        checked={aceptado}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 accent-cyan-400"
      />
      <span>
        <strong className="text-white">Acepto responder con honestidad</strong> y no dar información falsa. Entiendo que
        mis respuestas sirven para cuidar el bienestar de todas las personas del equipo, incluyéndome.
      </span>
    </label>
  );
}
