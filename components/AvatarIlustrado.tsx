/*
  Acompañante ilustrado de Psyqus (estilo 2D cálido, como los Shorts).

  - Parpadea y respira siempre; mueve la boca mientras "hablando" es true.
  - Detrás lleva las cuatro dimensiones que acompaña (bio, psico, social y
    espiritual) como círculos que se cruzan; se iluminan al hablar.
  - Reemplaza visualmente a Avatar3D (que se conserva en
    app/dashboard/components/Avatar3D.tsx).
*/

type Props = {
  avatar: "mujer" | "hombre";
  hablando: boolean;
};

const DIMENSIONES = [
  { nombre: "Bio", color: "#34d399", cx: 150, cy: 138, lx: 92, ly: 64 },
  { nombre: "Psico", color: "#22d3ee", cx: 250, cy: 138, lx: 308, ly: 64 },
  { nombre: "Social", color: "#fbbf24", cx: 150, cy: 228, lx: 64, ly: 262 },
  { nombre: "Espiritual", color: "#a78bfa", cx: 250, cy: 228, lx: 336, ly: 262 },
];

const PIEL = "#e7b48f";
const PIEL_SOMBRA = "#cf9774";
const CABELLO = "#3a2820";

export default function AvatarIlustrado({ avatar, hablando }: Props) {
  const mujer = avatar === "mujer";
  const ropa = mujer ? "#0f766e" : "#1e3a5f";
  const ropaLuz = mujer ? "#14b8a6" : "#2c5282";

  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      <svg
        viewBox="0 0 400 420"
        className={`psq-avatar w-full ${hablando ? "psq-hablando" : ""}`}
        role="img"
        aria-label={`Acompañante ${mujer ? "mujer" : "hombre"}${hablando ? ", hablando" : ""}`}
      >
        <style>{`
          .psq-avatar .psq-cuerpo { transform-origin: 200px 420px; animation: psq-respira 4.5s ease-in-out infinite; }
          .psq-avatar .psq-ojos { transform-origin: 200px 214px; animation: psq-parpadeo 5s infinite; }
          .psq-avatar .psq-boca-abierta { opacity: 0; transform-origin: 200px 252px; }
          .psq-avatar.psq-hablando .psq-boca-abierta { opacity: 1; animation: psq-habla 0.32s ease-in-out infinite alternate; }
          .psq-avatar.psq-hablando .psq-boca-cerrada { opacity: 0; }
          .psq-avatar .psq-dim { transition: fill-opacity .6s ease, stroke-opacity .6s ease; }
          .psq-avatar .psq-halo { transform-origin: 200px 183px; animation: psq-late 6s ease-in-out infinite; }
          .psq-avatar.psq-hablando .psq-dim { fill-opacity: .3; stroke-opacity: 1; }
          @keyframes psq-respira { 0%,100% { transform: scale(1); } 50% { transform: scale(1.012, 1.018); } }
          @keyframes psq-parpadeo { 0%,92%,100% { transform: scaleY(1); } 95% { transform: scaleY(0.1); } }
          @keyframes psq-habla { from { transform: scaleY(0.35); } to { transform: scaleY(1); } }
          @keyframes psq-late { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }
          @media (prefers-reduced-motion: reduce) {
            .psq-avatar .psq-cuerpo, .psq-avatar .psq-ojos, .psq-avatar .psq-halo { animation: none; }
            .psq-avatar.psq-hablando .psq-boca-abierta { animation: none; }
          }
        `}</style>

        <defs>
          <radialGradient id="psq-luz" cx="50%" cy="45%" r="55%">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.18" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`psq-ropa-${avatar}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={ropaLuz} />
            <stop offset="1" stopColor={ropa} />
          </linearGradient>
        </defs>

        <circle cx="200" cy="190" r="190" fill="url(#psq-luz)" />

        {/* Cuatro dimensiones */}
        <g className="psq-halo">
          {DIMENSIONES.map((d) => (
            <circle
              key={d.nombre}
              className="psq-dim"
              cx={d.cx}
              cy={d.cy}
              r={96}
              fill={d.color}
              fillOpacity={0.12}
              stroke={d.color}
              strokeOpacity={0.55}
              strokeWidth={2.5}
            />
          ))}
        </g>
        {DIMENSIONES.map((d) => (
          <text
            key={`${d.nombre}-t`}
            x={d.lx}
            y={d.ly}
            textAnchor="middle"
            fill={d.color}
            fontSize={d.nombre.length > 6 ? 15 : 17}
            fontWeight={800}
          >
            {d.nombre}
          </text>
        ))}

        <g className="psq-cuerpo">
          {/* Cabello de atrás (mujer) */}
          {mujer && (
            <path
              d="M138 196 C128 128 168 112 200 112 C238 112 274 130 264 200 C268 250 270 286 252 306 L148 306 C130 286 134 250 138 196 Z"
              fill={CABELLO}
            />
          )}

          {/* Torso */}
          <path
            d="M86 420 C90 352 132 318 200 312 C268 318 310 352 314 420 Z"
            fill={`url(#psq-ropa-${avatar})`}
          />
          {/* Cuello */}
          <path d="M180 262 L220 262 L222 316 C210 326 190 326 178 316 Z" fill={PIEL_SOMBRA} />
          {/* Escote / cuello de la ropa */}
          {mujer ? (
            <path d="M172 314 L200 350 L228 314 C220 310 180 310 172 314 Z" fill={PIEL} />
          ) : (
            <>
              <path d="M176 312 L200 342 L224 312 L214 308 L200 324 L186 308 Z" fill="#e2e8f0" />
              <path d="M196 330 L204 330 L208 380 L200 392 L192 380 Z" fill="#0ea5b7" />
            </>
          )}

          {/* Orejas */}
          <ellipse cx="141" cy="214" rx="10" ry="15" fill={PIEL_SOMBRA} />
          <ellipse cx="259" cy="214" rx="10" ry="15" fill={PIEL_SOMBRA} />
          {/* Cara */}
          <path
            d="M142 200 C142 150 168 128 200 128 C232 128 258 150 258 200 C258 246 232 276 200 276 C168 276 142 246 142 200 Z"
            fill={PIEL}
          />

          {/* Cabello de enfrente */}
          {mujer ? (
            <path
              d="M138 204 C132 146 166 116 204 118 C240 120 268 146 262 204 C254 176 240 160 222 152 C206 168 176 176 150 176 C144 184 140 194 138 204 Z"
              fill={CABELLO}
            />
          ) : (
            <path
              d="M140 196 C136 144 168 120 204 120 C238 120 266 142 260 196 C256 178 250 166 240 158 C216 160 186 156 162 150 C152 162 146 176 140 196 Z"
              fill={CABELLO}
            />
          )}

          {/* Cejas */}
          <path d="M166 196 Q178 189 190 195" stroke={CABELLO} strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M210 195 Q222 189 234 196" stroke={CABELLO} strokeWidth="4" strokeLinecap="round" fill="none" />

          {/* Ojos */}
          <g className="psq-ojos">
            <ellipse cx="178" cy="214" rx="6.5" ry="7.5" fill="#2b2118" />
            <ellipse cx="222" cy="214" rx="6.5" ry="7.5" fill="#2b2118" />
            <circle cx="180" cy="211" r="2" fill="#ffffff" />
            <circle cx="224" cy="211" r="2" fill="#ffffff" />
          </g>

          {/* Nariz y mejillas */}
          <path d="M199 222 Q195 236 201 238" stroke={PIEL_SOMBRA} strokeWidth="3" strokeLinecap="round" fill="none" />
          <circle cx="166" cy="236" r="9" fill="#f08a7e" fillOpacity="0.28" />
          <circle cx="234" cy="236" r="9" fill="#f08a7e" fillOpacity="0.28" />

          {/* Boca */}
          <path
            className="psq-boca-cerrada"
            d="M184 250 Q200 262 216 250"
            stroke="#a8504a"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <g className="psq-boca-abierta">
            <path d="M186 248 Q200 268 214 248 Z" fill="#8f3d3a" />
            <path d="M191 257 Q200 263 209 257" stroke="#e9877c" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>

          {/* Barba ligera (hombre) */}
          {!mujer && (
            <path
              d="M150 236 C156 262 176 278 200 278 C224 278 244 262 250 236 C244 256 226 268 200 268 C174 268 156 256 150 236 Z"
              fill={CABELLO}
              fillOpacity="0.35"
            />
          )}
        </g>
      </svg>

      <p className="-mt-1 text-xs text-slate-400">
        Te acompaño en lo bio, psico, social y espiritual
      </p>
    </div>
  );
}
