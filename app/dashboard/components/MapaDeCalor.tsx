"use client";

type HeatmapData = Record<string, number>;

function getIntensityClasses(value: number, maxValue: number) {
  const ratio = maxValue > 0 ? value / maxValue : 0;

  if (ratio >= 0.85) {
    return "bg-red-500/25 border-red-400/30 text-red-200";
  }
  if (ratio >= 0.65) {
    return "bg-amber-500/25 border-amber-400/30 text-amber-200";
  }
  if (ratio >= 0.45) {
    return "bg-yellow-500/20 border-yellow-400/30 text-yellow-100";
  }
  if (ratio >= 0.25) {
    return "bg-cyan-500/20 border-cyan-400/30 text-cyan-100";
  }
  return "bg-emerald-500/20 border-emerald-400/30 text-emerald-100";
}

export default function MapaDeCalor({ data }: { data: HeatmapData }) {
  const entries = Object.entries(data || {});
  const maxValue = Math.max(...entries.map(([, value]) => Number(value || 0)), 1);

  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-slate-400">
        No hay dimensiones suficientes para construir el mapa de calor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {entries.map(([name, value]) => {
          const numericValue = Number(value || 0);
          const width = Math.min(100, Math.round((numericValue / maxValue) * 100));
          const intensity = getIntensityClasses(numericValue, maxValue);

          return (
            <div
              key={name}
              className={`rounded-2xl border p-4 transition hover:scale-[1.01] ${intensity}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{name}</p>
                <p className="text-2xl font-black">{numericValue}</p>
              </div>

              <div className="mt-4 h-2 rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white/70"
                  style={{ width: `${width}%` }}
                />
              </div>

              <p className="mt-3 text-xs uppercase tracking-[0.24em] opacity-80">
                Intensidad relativa
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300 leading-relaxed">
          Este mapa de calor muestra qué dimensiones cargan más dentro de tu lectura
          personal. Los bloques más intensos señalan zonas que conviene observar con
          más cuidado.
        </p>
      </div>
    </div>
  );
}