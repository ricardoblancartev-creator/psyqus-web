import Link from "next/link";

/*
  Perfil bio-psico-social-espiritual del trabajador.

  Cada dimensión se alimenta del último pulso semanal (escala 1 a 5):
  - Bio        ← energía
  - Psico      ← desconexión del trabajo
  - Social     ← apoyo del equipo
  - Espiritual ← sentido (pregunta agregada en noviembre de 2026)

  Es orientativo: no es un diagnóstico. Solo lo ve el propio usuario.
*/

export type PulsoPerfil = {
  semana_inicio?: string | null;
  energia?: number | null;
  desconexion?: number | null;
  apoyo?: number | null;
  sentido?: number | null;
} | null;

type Dimension = {
  clave: "bio" | "psico" | "social" | "espiritual";
  nombre: string;
  abarca: string;
  fuente: string;
  valor: number | null;
  color: string;
  colorTexto: string;
  recurso: { texto: string; href: string };
  cx: number;
  cy: number;
  lx: number;
  ly: number;
};

function valorValido(v: unknown) {
  const n = Number(v);

  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

function lectura(valor: number | null) {
  if (valor === null) return "Sin dato todavía";
  if (valor >= 4) return "Se ve fuerte";
  if (valor >= 3) return "En equilibrio, vale la pena cuidarla";
  return "Pide atención esta semana";
}

export default function PerfilBienestar({
  pulso,
}: {
  pulso: PulsoPerfil;
}) {
  const dims: Dimension[] = [
    {
      clave: "bio",
      nombre: "Bio",
      abarca: "Cuerpo, energía, descanso y sueño",
      fuente: "Tu energía",
      valor: valorValido(pulso?.energia),
      color: "#34d399",
      colorTexto: "text-emerald-300",
      recurso: { texto: "Pausa de respiración", href: "/mindfulness" },
      cx: 150,
      cy: 150,
      lx: 110,
      ly: 92,
    },
    {
      clave: "psico",
      nombre: "Psico",
      abarca: "Emociones, pensamientos, estrés y desconexión",
      fuente: "Qué tanto te desconectaste",
      valor: valorValido(pulso?.desconexion),
      color: "#22d3ee",
      colorTexto: "text-cyan-300",
      recurso: { texto: "Aprender a desconectarte", href: "/psicoeducacion" },
      cx: 250,
      cy: 150,
      lx: 290,
      ly: 92,
    },
    {
      clave: "social",
      nombre: "Social",
      abarca: "Relaciones, equipo, familia y apoyo",
      fuente: "El apoyo de tu equipo",
      valor: valorValido(pulso?.apoyo),
      color: "#fbbf24",
      colorTexto: "text-amber-300",
      recurso: { texto: "Practicar una conversación", href: "/entrenamiento" },
      cx: 150,
      cy: 250,
      lx: 110,
      ly: 312,
    },
    {
      clave: "espiritual",
      nombre: "Espiritual",
      abarca: "Sentido, propósito y valores",
      fuente: "El sentido de tu semana",
      valor: valorValido(pulso?.sentido),
      color: "#a78bfa",
      colorTexto: "text-violet-300",
      recurso: { texto: "Hablar con el acompañante", href: "/experiencia" },
      cx: 250,
      cy: 250,
      lx: 290,
      ly: 312,
    },
  ];

  const conDato = dims.filter((d) => d.valor !== null);
  const masFuerte = conDato.length
    ? [...conDato].sort((a, b) => (b.valor ?? 0) - (a.valor ?? 0))[0]
    : null;
  const aCuidar = conDato.length
    ? [...conDato].sort((a, b) => (a.valor ?? 0) - (b.valor ?? 0))[0]
    : null;

  const semana = pulso?.semana_inicio
    ? new Date(`${pulso.semana_inicio}T12:00:00`).toLocaleDateString("es-MX", {
        day: "numeric",
        month: "long",
      })
    : null;

  return (
    <section className="mb-8 rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 md:p-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-300">
            Tu perfil de bienestar
          </p>
          <h2 className="mt-1 text-2xl font-black md:text-3xl">
            Bio · Psico · Social · Espiritual
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
            Tu bienestar es la suma de cuatro dimensiones que se tocan entre sí.
            Cada círculo se llena según tu último pulso semanal.
          </p>
        </div>
        {semana && (
          <p className="text-sm text-slate-500">Pulso de la semana del {semana}</p>
        )}
      </div>

      <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        {/* DIAGRAMA */}
        <svg
          viewBox="0 0 400 400"
          className="mx-auto w-full max-w-[420px]"
          role="img"
          aria-label="Diagrama de cuatro dimensiones del bienestar: bio, psico, social y espiritual"
        >
          {dims.map((d) => {
            const intensidad = d.valor === null ? 0 : d.valor / 5;

            return (
              <circle
                key={d.clave}
                cx={d.cx}
                cy={d.cy}
                r={112}
                fill={d.color}
                fillOpacity={d.valor === null ? 0.04 : 0.08 + intensidad * 0.32}
                stroke={d.color}
                strokeOpacity={d.valor === null ? 0.5 : 0.9}
                strokeWidth={d.valor === null ? 2 : 3}
                strokeDasharray={d.valor === null ? "6 6" : undefined}
              />
            );
          })}

          {dims.map((d) => (
            <g key={`${d.clave}-label`}>
              <text
                x={d.lx}
                y={d.ly}
                textAnchor="middle"
                fill={d.color}
                fontSize={d.nombre.length > 6 ? 16 : 19}
                fontWeight="800"
              >
                {d.nombre}
              </text>
              <text
                x={d.lx}
                y={d.ly + 26}
                textAnchor="middle"
                fill="#e2e8f0"
                fontSize="17"
                fontWeight="700"
              >
                {d.valor === null ? "—" : `${d.valor}/5`}
              </text>
            </g>
          ))}

          <circle cx={200} cy={200} r={34} fill="#020617" stroke="#e2e8f0" strokeOpacity={0.8} strokeWidth={2} />
          <text x={200} y={207} textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="800">
            Tú
          </text>
        </svg>

        {/* DIMENSIONES */}
        <div>
          {conDato.length > 0 && masFuerte && aCuidar ? (
            <p className="mb-5 text-base leading-relaxed text-slate-200">
              En tu último pulso, tu dimensión más fuerte es{" "}
              <strong className={masFuerte.colorTexto}>{masFuerte.nombre.toLowerCase()}</strong>
              {aCuidar.clave !== masFuerte.clave && (aCuidar.valor ?? 5) < (masFuerte.valor ?? 0) ? (
                <>
                  , y la que más conviene cuidar es{" "}
                  <strong className={aCuidar.colorTexto}>{aCuidar.nombre.toLowerCase()}</strong>.
                </>
              ) : (
                "."
              )}
            </p>
          ) : (
            <p className="mb-5 text-base leading-relaxed text-slate-300">
              Responde tu pulso semanal para ver cómo está cada dimensión.
            </p>
          )}

          <ul className="grid gap-3 sm:grid-cols-2">
            {dims.map((d) => (
              <li
                key={d.clave}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className={`font-black ${d.colorTexto}`}>{d.nombre}</p>
                  <p className="text-sm font-bold tabular-nums text-white">
                    {d.valor === null ? "—" : `${d.valor}/5`}
                  </p>
                </div>
                <p className="mt-1 text-sm text-slate-400">{d.abarca}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((d.valor ?? 0) / 5) * 100}%`,
                      background: d.color,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {d.fuente}: {lectura(d.valor).toLowerCase()}
                </p>
                {d.valor !== null && d.valor < 3 && (
                  <Link
                    href={d.recurso.href}
                    className={`mt-2 inline-block text-sm font-semibold ${d.colorTexto} hover:underline`}
                  >
                    {d.recurso.texto} →
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Es una guía para conocerte, no un diagnóstico. Solo tú ves este perfil.
            </p>
            <Link
              href="/pulso"
              className="rounded-xl bg-violet-400/15 px-4 py-2 text-sm font-bold text-violet-200 hover:bg-violet-400/25"
            >
              {pulso ? "Actualizar mi pulso" : "Responder mi pulso"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
