/*
  Generador de Shorts de Psyqus (v2).

  Cada Short sigue el mismo formato, a partir de contenido/shorts/guiones.json:
    1. Gancho     · una pregunta en la que el trabajador se reconoce
    2. Escena     · Toño, Lupita, su jefa o Beto en una situación real
    3. La clave   · una sola idea que explica por qué pasa
    4. Pruébalo   · una acción o frase lista para usar
    5. Cierre     · frase que se queda y a dónde ir en Psyqus

  Uso (desde la raíz del proyecto):
    node scripts/shorts-v2/generar.mjs                  → todos, a scripts/shorts-v2/salida/
    node scripts/shorts-v2/generar.mjs poner-limites    → solo ese
    node scripts/shorts-v2/generar.mjs --instalar       → además copia a public/shorts
                                                          (respaldo previo en respaldos_shorts/)
    VOZ=Raul node scripts/shorts-v2/generar.mjs         → otra voz de Windows

  Requiere ffmpeg, sharp (dependencia de Next) y una voz de Windows en español.
*/

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, "../..");
const SALIDA = path.join(AQUI, "salida");
const TRABAJO = path.join(AQUI, ".trabajo");

const W = 720;
const H = 1280;
const FPS = 24;
const PAUSA_INI = 0.35;
const PAUSA_FIN = 0.45;
const VOZ = process.env.VOZ || "Sabina";
const VELOCIDAD = Number(process.env.VELOCIDAD || 1.05);
const SIN_VOZ = process.env.SIN_VOZ === "1";
const SOLO_LISTA = process.env.SOLO_LISTA === "1";

const SEGMENTOS = ["gancho", "escena", "clave", "prueba", "cierre"];

const guiones = JSON.parse(fs.readFileSync(path.join(RAIZ, "contenido/shorts/guiones.json"), "utf8"));
const args = process.argv.slice(2);
const instalar = args.includes("--instalar");
const elegidos = args.filter((a) => !a.startsWith("--"));
const lista = elegidos.length ? guiones.filter((g) => elegidos.includes(g.id)) : guiones;

// Logo reducido al tamaño en que se dibuja (240 px): cada cuadro del cierre lo incluye.
const LOGO = await (async () => {
  const archivo = path.join(RAIZ, "public/logo.jpg");
  if (!fs.existsSync(archivo)) return null;
  const buf = await sharp(archivo).resize(240, 240).jpeg({ quality: 85 }).toBuffer();
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
})();

/* ================================================================ utilidades */

const esc = (s) =>
  String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const ease = (x) => 1 - (1 - clamp01(x)) ** 3;
const pop = (x) => {
  const t = clamp01(x);
  return t < 1 ? 1 + 0.12 * Math.sin(t * Math.PI) * (1 - t) - (1 - ease(t)) * 0.25 : 1;
};

/* Ajuste de línea aproximado por ancho de caracteres. */
function lineas(texto, maxCar) {
  const palabras = String(texto).split(/\s+/);
  const out = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (prueba.length > maxCar && actual) {
      out.push(actual);
      actual = p;
    } else {
      actual = prueba;
    }
  }
  if (actual) out.push(actual);
  return out;
}

function textoMultilinea(x, y, texto, { size, maxCar, color = "#fff", peso = 800, alto = 1.18, anchor = "middle", opacidad = 1 }) {
  return lineas(texto, maxCar)
    .map(
      (l, i) =>
        `<text x="${x}" y="${y + i * size * alto}" text-anchor="${anchor}" font-family="Segoe UI" font-weight="${peso}" font-size="${size}" fill="${color}" fill-opacity="${opacidad}">${esc(l)}</text>`
    )
    .join("");
}

function wavDuracion(archivo) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", archivo], { encoding: "utf8" });
  return Number(r.stdout.trim());
}

/* ================================================================ personajes */

const PERSONAJES = {
  tono: { piel: "#e2a982", sombra: "#c98d68", pelo: "#2b1d16", ropa: "#0f766e", ropa2: "#14b8a6", peinado: "corto" },
  lupita: { piel: "#c98b67", sombra: "#ad7151", pelo: "#3a2418", ropa: "#e76f51", ropa2: "#f4a261", peinado: "largo" },
  jefa: { piel: "#ebbd98", sombra: "#d39f7b", pelo: "#5b3a29", ropa: "#334155", ropa2: "#475569", peinado: "chongo", cuello: "#f8fafc" },
  beto: { piel: "#d8a27c", sombra: "#bd8762", pelo: "#1c1917", ropa: "#6d28d9", ropa2: "#8b5cf6", peinado: "despeinado", lentes: true },
};

/* Expresión → cejas y boca. */
function cara(animo, cx, cy, hablando, t) {
  const pelo = "#2b1d16";
  const parpadeo = Math.sin(t * 2.1) > 0.985 ? 0.15 : 1;
  let cejaI = `M${cx - 30} ${cy - 22} Q${cx - 18} ${cy - 30} ${cx - 6} ${cy - 23}`;
  let cejaD = `M${cx + 6} ${cy - 23} Q${cx + 18} ${cy - 30} ${cx + 30} ${cy - 22}`;
  let boca = `M${cx - 14} ${cy + 30} Q${cx} ${cy + 40} ${cx + 14} ${cy + 30}`;

  if (["tenso", "tensa", "apenado", "triste"].includes(animo)) {
    cejaI = `M${cx - 30} ${cy - 20} Q${cx - 18} ${cy - 24} ${cx - 6} ${cy - 30}`;
    cejaD = `M${cx + 6} ${cy - 30} Q${cx + 18} ${cy - 24} ${cx + 30} ${cy - 20}`;
    boca = animo === "apenado" ? `M${cx - 10} ${cy + 33} Q${cx} ${cy + 37} ${cx + 10} ${cy + 33}` : `M${cx - 12} ${cy + 36} Q${cx} ${cy + 30} ${cx + 12} ${cy + 36}`;
  }
  if (["enojado", "enojada"].includes(animo)) {
    cejaI = `M${cx - 30} ${cy - 30} L${cx - 6} ${cy - 20}`;
    cejaD = `M${cx + 6} ${cy - 20} L${cx + 30} ${cy - 30}`;
    boca = `M${cx - 13} ${cy + 36} Q${cx} ${cy + 28} ${cx + 13} ${cy + 36}`;
  }
  if (animo === "burlon") {
    cejaI = `M${cx - 30} ${cy - 30} Q${cx - 18} ${cy - 36} ${cx - 6} ${cy - 28}`;
    boca = `M${cx - 14} ${cy + 32} Q${cx + 2} ${cy + 40} ${cx + 16} ${cy + 26}`;
  }
  if (animo === "atento") {
    cejaI = `M${cx - 30} ${cy - 27} Q${cx - 18} ${cy - 34} ${cx - 6} ${cy - 28}`;
    cejaD = `M${cx + 6} ${cy - 28} Q${cx + 18} ${cy - 34} ${cx + 30} ${cy - 27}`;
    boca = `M${cx - 9} ${cy + 33} Q${cx} ${cy + 37} ${cx + 9} ${cy + 33}`;
  }
  if (animo === "feliz") {
    boca = `M${cx - 16} ${cy + 28} Q${cx} ${cy + 46} ${cx + 16} ${cy + 28}`;
  }

  const apertura = hablando ? 0.35 + 0.65 * Math.abs(Math.sin(t * 13)) : 0;
  const bocaSvg =
    apertura > 0.05
      ? `<ellipse cx="${cx}" cy="${cy + 33}" rx="${11}" ry="${3 + 8 * apertura}" fill="#7f2f2b"/>`
      : `<path d="${boca}" stroke="#8f3d3a" stroke-width="4" stroke-linecap="round" fill="none"/>`;

  return `
    <path d="${cejaI}" stroke="${pelo}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <path d="${cejaD}" stroke="${pelo}" stroke-width="5" stroke-linecap="round" fill="none"/>
    <g transform="translate(0 ${cy - 8}) scale(1 ${parpadeo}) translate(0 ${-(cy - 8)})">
      <ellipse cx="${cx - 18}" cy="${cy - 8}" rx="6" ry="7.5" fill="#241912"/>
      <ellipse cx="${cx + 18}" cy="${cy - 8}" rx="6" ry="7.5" fill="#241912"/>
      <circle cx="${cx - 16}" cy="${cy - 11}" r="2" fill="#fff"/>
      <circle cx="${cx + 20}" cy="${cy - 11}" r="2" fill="#fff"/>
    </g>
    <path d="M${cx - 1} ${cy + 2} Q${cx - 5} ${cy + 15} ${cx + 2} ${cy + 17}" stroke="#00000033" stroke-width="3" stroke-linecap="round" fill="none"/>
    <circle cx="${cx - 30}" cy="${cy + 18}" r="9" fill="#f08a7e" fill-opacity="0.25"/>
    <circle cx="${cx + 30}" cy="${cy + 18}" r="9" fill="#f08a7e" fill-opacity="0.25"/>
    ${bocaSvg}`;
}

/* Medio cuerpo. (cx, base) = centro inferior del torso; s = escala. */
function personaje(tipo, cx, base, s, animo, hablando, t) {
  const p = PERSONAJES[tipo];
  const resp = 1 + 0.012 * Math.sin(t * 2.2 + cx);
  const cy = -250; // centro de la cara en coordenadas locales
  const pelo = p.peinado;

  const peloAtras =
    pelo === "largo"
      ? `<path d="M-72 ${cy - 10} C-80 ${cy - 90} -40 ${cy - 112} 0 ${cy - 112} C40 ${cy - 112} 82 ${cy - 90} 72 ${cy - 10} C76 ${cy + 50} 74 ${cy + 100} 56 ${cy + 120} L-56 ${cy + 120} C-74 ${cy + 100} -76 ${cy + 50} -72 ${cy - 10} Z" fill="${p.pelo}"/>`
      : pelo === "chongo"
        ? `<circle cx="0" cy="${cy - 100}" r="34" fill="${p.pelo}"/>`
        : "";

  const peloFrente =
    pelo === "largo"
      ? `<path d="M-70 ${cy - 4} C-74 ${cy - 82} -36 ${cy - 104} 4 ${cy - 102} C44 ${cy - 100} 76 ${cy - 76} 70 ${cy - 4} C62 ${cy - 34} 48 ${cy - 50} 28 ${cy - 60} C10 ${cy - 42} -26 ${cy - 34} -54 ${cy - 34} C-62 ${cy - 26} -68 ${cy - 16} -70 ${cy - 4} Z" fill="${p.pelo}"/>`
      : pelo === "chongo"
        ? `<path d="M-66 ${cy - 10} C-70 ${cy - 80} -34 ${cy - 100} 0 ${cy - 100} C34 ${cy - 100} 70 ${cy - 80} 66 ${cy - 10} C58 ${cy - 46} 36 ${cy - 62} 0 ${cy - 64} C-36 ${cy - 62} -58 ${cy - 46} -66 ${cy - 10} Z" fill="${p.pelo}"/>`
        : pelo === "despeinado"
          ? `<path d="M-66 ${cy - 16} C-72 ${cy - 86} -36 ${cy - 108} 2 ${cy - 106} L14 ${cy - 118} L22 ${cy - 104} L40 ${cy - 112} L44 ${cy - 96} C64 ${cy - 86} 72 ${cy - 56} 66 ${cy - 16} C58 ${cy - 44} 44 ${cy - 58} 20 ${cy - 66} C-4 ${cy - 58} -36 ${cy - 56} -52 ${cy - 52} C-60 ${cy - 42} -64 ${cy - 30} -66 ${cy - 16} Z" fill="${p.pelo}"/>`
          : `<path d="M-66 ${cy - 14} C-70 ${cy - 84} -36 ${cy - 104} 2 ${cy - 104} C40 ${cy - 104} 72 ${cy - 82} 66 ${cy - 14} C60 ${cy - 40} 50 ${cy - 54} 36 ${cy - 62} C10 ${cy - 58} -22 ${cy - 62} -46 ${cy - 68} C-58 ${cy - 52} -64 ${cy - 34} -66 ${cy - 14} Z" fill="${p.pelo}"/>`;

  const lentes = p.lentes
    ? `<g stroke="#111827" stroke-width="4" fill="none"><circle cx="-18" cy="${cy - 8}" r="15"/><circle cx="18" cy="${cy - 8}" r="15"/><path d="M-3 ${cy - 8} L3 ${cy - 8}"/></g>`
    : "";

  const cuello = p.cuello
    ? `<path d="M-30 -160 L0 -120 L30 -160 L18 -168 L0 -146 L-18 -168 Z" fill="${p.cuello}"/>`
    : `<path d="M-26 -162 L0 -128 L26 -162 Z" fill="${p.piel}"/>`;

  return `
  <g transform="translate(${cx} ${base}) scale(${s}) scale(1 ${resp})">
    ${peloAtras}
    <path d="M-150 0 C-146 -96 -96 -150 0 -162 C96 -150 146 -96 150 0 Z" fill="${p.ropa}"/>
    <path d="M-110 0 C-100 -70 -60 -120 0 -130 C60 -120 100 -70 110 0 Z" fill="${p.ropa2}" fill-opacity="0.35"/>
    <path d="M-24 ${cy + 70} L24 ${cy + 70} L26 -150 C12 -138 -12 -138 -26 -150 Z" fill="${p.sombra}"/>
    ${cuello}
    <ellipse cx="-66" cy="${cy}" rx="11" ry="17" fill="${p.sombra}"/>
    <ellipse cx="66" cy="${cy}" rx="11" ry="17" fill="${p.sombra}"/>
    <path d="M-64 ${cy - 6} C-64 ${cy - 66} -34 ${cy - 90} 0 ${cy - 90} C34 ${cy - 90} 64 ${cy - 66} 64 ${cy - 6} C64 ${cy + 52} 34 ${cy + 82} 0 ${cy + 82} C-34 ${cy + 82} -64 ${cy + 52} -64 ${cy - 6} Z" fill="${p.piel}"/>
    ${peloFrente}
    ${cara(animo, 0, cy, hablando, t)}
    ${lentes}
  </g>`;
}

/* ================================================================ escenarios */

function fondoLugar(lugar, x, y, w, h, t) {
  const pared = { oficina: "#f2ece3", escritorio: "#eef1f5", chat: "#e9eef5", calma: "#ece8f6", casa: "#1e2a44" }[lugar] || "#f2ece3";
  const piso = { oficina: "#d8c7b0", escritorio: "#cfd8e2", chat: "#cfd8e2", calma: "#d8d0ea", casa: "#2a3654" }[lugar] || "#d8c7b0";
  const noche = lugar === "casa";
  const ventana = noche
    ? `<rect x="${x + 40}" y="${y + 50}" width="170" height="140" rx="14" fill="#0f1a33"/><circle cx="${x + 160}" cy="${y + 95}" r="22" fill="#fde68a"/><circle cx="${x + 150}" cy="${y + 88}" r="20" fill="#0f1a33"/>`
    : `<rect x="${x + 40}" y="${y + 50}" width="170" height="140" rx="14" fill="#bfe1ec"/><path d="M${x + 125} ${y + 50} V${y + 190} M${x + 40} ${y + 120} H${x + 210}" stroke="#ffffff" stroke-width="7"/>`;
  const planta = `<g transform="translate(${x + w - 90} ${y + h - 220})"><rect x="-26" y="70" width="52" height="64" rx="8" fill="#c28c70"/><ellipse cx="-16" cy="40" rx="20" ry="40" fill="#5d8d79"/><ellipse cx="16" cy="34" rx="20" ry="44" fill="#6fa58c"/></g>`;
  const lampara = noche ? `<g transform="translate(${x + w - 110} ${y + 70})"><path d="M-30 40 L30 40 L18 0 L-18 0 Z" fill="#fcd34d"/><rect x="-3" y="40" width="6" height="120" fill="#94a3b8"/><ellipse cx="0" cy="60" rx="70" ry="50" fill="#fde68a" fill-opacity="${0.12 + 0.03 * Math.sin(t * 2)}"/></g>` : "";
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="${pared}"/>
    <path d="M${x} ${y + h * 0.72} H${x + w} V${y + h - 34} Q${x + w} ${y + h} ${x + w - 34} ${y + h} H${x + 34} Q${x} ${y + h} ${x} ${y + h - 34} Z" fill="${piso}"/>
    ${ventana}
    ${lugar !== "casa" ? planta : lampara}`;
}

function escritorioFrente(x, y, w, t, color) {
  const pend = ["Correo", "Entrega", "Junta"]
    .map((txt, i) => {
      const yy = y - 150 + i * 44 + 3 * Math.sin(t * 2 + i);
      return `<g><rect x="${x + w - 190}" y="${yy}" width="150" height="34" rx="10" fill="#fde2d0"/><text x="${x + w - 115}" y="${yy + 23}" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="17" fill="#7c3f24">${txt}</text></g>`;
    })
    .join("");
  return `
    <rect x="${x + 30}" y="${y}" width="${w - 60}" height="26" rx="10" fill="#a8795c"/>
    <rect x="${x + 70}" y="${y + 26}" width="18" height="90" fill="#86624b"/>
    <rect x="${x + w - 88}" y="${y + 26}" width="18" height="90" fill="#86624b"/>
    <rect x="${x + 110}" y="${y - 96}" width="170" height="100" rx="10" fill="#334155"/>
    <rect x="${x + 120}" y="${y - 86}" width="150" height="80" rx="6" fill="${color}" fill-opacity="0.35"/>
    ${pend}`;
}

function telefono(x, y, mensaje, t, color, entrada) {
  const k = ease(entrada);
  return `
    <g transform="translate(${x} ${y})">
      <rect x="0" y="0" width="230" height="400" rx="34" fill="#1e293b"/>
      <rect x="12" y="14" width="206" height="372" rx="24" fill="#f8fafc"/>
      <rect x="85" y="22" width="60" height="8" rx="4" fill="#1e293b"/>
      <text x="30" y="72" font-family="Segoe UI" font-weight="800" font-size="20" fill="#1e293b">Trabajo</text>
      <rect x="70" y="100" width="134" height="64" rx="16" fill="${color}" fill-opacity="0.35"/>
      <rect x="84" y="116" width="100" height="10" rx="5" fill="#334155" fill-opacity="0.5"/>
      <rect x="84" y="136" width="70" height="10" rx="5" fill="#334155" fill-opacity="0.5"/>
      <g opacity="${k}" transform="translate(0 ${(1 - k) * 20})">
        <rect x="26" y="190" width="${Math.max(70, 26 + mensaje.length * 15)}" height="60" rx="16" fill="#e2e8f0"/>
        <text x="46" y="230" font-family="Segoe UI" font-weight="800" font-size="28" fill="#0f172a">${esc(mensaje)}</text>
      </g>
    </g>`;
}

function burbuja(texto, x, y, colaX, entrada) {
  const ls = lineas(texto, 20);
  const w = Math.min(560, Math.max(...ls.map((l) => l.length)) * 17 + 60);
  const h = ls.length * 40 + 34;
  const k = pop(entrada);
  const bx = Math.max(70, Math.min(W - 70 - w, x - w / 2));
  return `
    <g opacity="${clamp01(entrada * 3)}" transform="translate(${bx + w / 2} ${y + h}) scale(${k}) translate(${-(bx + w / 2)} ${-(y + h)})">
      <rect x="${bx + 4}" y="${y + 6}" width="${w}" height="${h}" rx="26" fill="#00000022"/>
      <rect x="${bx}" y="${y}" width="${w}" height="${h}" rx="26" fill="#ffffff"/>
      <path d="M${colaX - 16} ${y + h - 2} L${colaX + 10} ${y + h - 2} L${colaX - 4} ${y + h + 28} Z" fill="#ffffff"/>
      ${ls.map((l, i) => `<text x="${bx + w / 2}" y="${y + 44 + i * 40}" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="30" fill="#0f172a">${esc(l)}</text>`).join("")}
    </g>`;
}

/* ================================================================ marco */

function marco(g, indiceSeg, progresoSeg, cuerpo) {
  const color = g.color;
  const barras = SEGMENTOS.map((_, i) => {
    const x = 36 + i * ((W - 72) / 5);
    const ancho = (W - 72) / 5 - 8;
    const lleno = i < indiceSeg ? 1 : i === indiceSeg ? progresoSeg : 0;
    return `<rect x="${x}" y="34" width="${ancho}" height="6" rx="3" fill="#ffffff" fill-opacity="0.22"/><rect x="${x}" y="34" width="${ancho * lleno}" height="6" rx="3" fill="#ffffff"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <radialGradient id="glow" cx="50%" cy="38%" r="70%">
        <stop offset="0" stop-color="${color}" stop-opacity="0.32"/>
        <stop offset="1" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stop-color="#0b1426"/><stop offset="1" stop-color="#111c34"/>
      </linearGradient>
      <clipPath id="logo"><rect x="${W / 2 - 120}" y="300" width="240" height="240" rx="44"/></clipPath>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>
    ${barras}
    <rect x="36" y="62" width="${g.categoria.length * 13 + 44}" height="40" rx="20" fill="${color}" fill-opacity="0.22" stroke="${color}" stroke-opacity="0.6"/>
    <text x="${36 + 22}" y="89" font-family="Segoe UI" font-weight="800" font-size="20" fill="${color}">${esc(g.categoria)}</text>
    <text x="${W - 36}" y="90" text-anchor="end" font-family="Segoe UI" font-weight="800" font-size="22" letter-spacing="4" fill="#ffffff" fill-opacity="0.75">PSYQUS</text>
    ${cuerpo}
  </svg>`;
}

function subtitulo(texto) {
  if (!texto) return "";
  const ls = lineas(texto, 30);
  const h = ls.length * 44 + 26;
  const y = 1010;
  return `<g><rect x="40" y="${y}" width="${W - 80}" height="${h}" rx="22" fill="#020617" fill-opacity="0.72"/>
    ${ls.map((l, i) => `<text x="${W / 2}" y="${y + 46 + i * 44}" text-anchor="middle" font-family="Segoe UI" font-weight="700" font-size="32" fill="#ffffff">${esc(l)}</text>`).join("")}</g>`;
}

/* Trozos de subtítulo repartidos según la cantidad de letras. */
function trozosSubtitulo(texto, duracion) {
  const palabras = texto.split(/\s+/);
  const trozos = [];
  let actual = [];
  for (const p of palabras) {
    actual.push(p);
    const largo = actual.join(" ").length;
    if (largo > 46 || /[.?!…:]$/.test(p) && largo > 18) {
      trozos.push(actual.join(" "));
      actual = [];
    }
  }
  if (actual.length) trozos.push(actual.join(" "));
  const total = trozos.reduce((s, t) => s + t.length, 0);
  let t = 0;
  return trozos.map((txt) => {
    const d = (txt.length / total) * duracion;
    const r = { txt, desde: t, hasta: t + d };
    t += d;
    return r;
  });
}

/* ================================================================ segmentos */

function protagonista(g) {
  return g.escena.personajes[0];
}

function cuadroSegmento(g, seg, tl, dur, tg) {
  const color = g.color;
  const e = g.escena;
  const entrada = (d = 0) => ease((tl - d) / 0.45);

  if (seg === "gancho") {
    const k = entrada(0);
    const prota = protagonista(g);
    return `
      <g opacity="${k}" transform="translate(0 ${(1 - k) * 30})">
        ${textoMultilinea(W / 2, 220, g.gancho.pantalla, { size: 58, maxCar: 18, alto: 1.14 })}
        <rect x="${W / 2 - 60}" y="${220 + lineas(g.gancho.pantalla, 18).length * 66 - 10}" width="120" height="8" rx="4" fill="${color}"/>
      </g>
      <g opacity="${entrada(0.25)}">
        ${fondoLugar(e.lugar, 70, 520, W - 140, 440, tg)}
        ${personaje(prota, W / 2, 960, 1.05, e.animo[prota] || "normal", false, tg)}
      </g>`;
  }

  if (seg === "escena") {
    const n = e.personajes.length;
    const xs = n === 1 ? [e.lugar === "chat" ? 230 : W / 2] : [215, W - 215];
    const base = 960;
    let cuerpo = fondoLugar(e.lugar, 40, 330, W - 80, 630, tg);
    e.personajes.forEach((p, i) => {
      const hablando = e.habla === p && tl > 0.6 && tl < dur - 0.3;
      cuerpo += personaje(p, xs[i], base, n === 1 ? 1.15 : 0.95, e.animo[p] || "normal", hablando, tg + i);
    });
    if (e.lugar === "escritorio") cuerpo += escritorioFrente(70, 830, W - 140, tg, color);
    if (e.lugar === "chat") cuerpo += telefono(410, 420, e.burbuja, tg, color, (tl - 0.5) / 0.4);
    if (e.lugar !== "chat" && e.burbuja) {
      // La burbuja va justo encima de la cabeza de quien habla.
      const i = Math.max(0, e.personajes.indexOf(e.habla));
      const x = xs[i];
      const escala = n === 1 ? 1.15 : 0.95;
      const cabeza = base - 365 * escala;
      const alto = lineas(e.burbuja, 20).length * 40 + 34;
      cuerpo += burbuja(e.burbuja, x, Math.max(170, cabeza - alto - 50), x, (tl - 0.4) / 0.35);
    }
    return `<g opacity="${entrada(0)}">${cuerpo}</g>`;
  }

  if (seg === "clave") {
    const k = entrada(0);
    const brillo = 0.5 + 0.5 * Math.sin(tg * 3);
    return `
      <g opacity="${k}" transform="translate(0 ${(1 - k) * 30})">
        <circle cx="${W / 2}" cy="260" r="${70 + 6 * brillo}" fill="${color}" fill-opacity="0.18"/>
        <circle cx="${W / 2}" cy="260" r="56" fill="${color}"/>
        <path d="M${W / 2 - 18} 258 a22 22 0 1 1 36 0 c-7 7 -9 12 -9 20 h-18 c0 -8 -2 -13 -9 -20 z" fill="#0b1426"/>
        <rect x="${W / 2 - 10}" y="284" width="20" height="8" rx="3" fill="#0b1426"/>
        <text x="${W / 2}" y="380" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="24" letter-spacing="5" fill="${color}">LA CLAVE</text>
      </g>
      <g opacity="${entrada(0.2)}" transform="translate(0 ${(1 - entrada(0.2)) * 30})">
        <rect x="56" y="420" width="${W - 112}" height="${lineas(g.clave.pantalla, 17).length * 70 + 90}" rx="34" fill="#ffffff" fill-opacity="0.06" stroke="${color}" stroke-opacity="0.5" stroke-width="2"/>
        ${textoMultilinea(W / 2, 500, g.clave.pantalla, { size: 56, maxCar: 17, alto: 1.2 })}
      </g>`;
  }

  if (seg === "prueba") {
    const k = entrada(0);
    const frase = `“${g.prueba.frase}”`;
    const ls = lineas(frase, 19);
    const h = ls.length * 58 + 70;
    const prota = protagonista(g);
    return `
      <g opacity="${k}" transform="translate(0 ${(1 - k) * 30})">
        <circle cx="96" cy="190" r="34" fill="${color}"/>
        <path d="M80 190 L92 202 L114 176" stroke="#0b1426" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <text x="148" y="202" font-family="Segoe UI" font-weight="800" font-size="34" fill="#ffffff">Pruébalo hoy</text>
      </g>
      <g opacity="${clamp01((tl - 0.3) * 3)}" transform="translate(${W / 2} ${280 + h / 2}) scale(${pop((tl - 0.3) / 0.4)}) translate(${-W / 2} ${-(280 + h / 2)})">
        <rect x="56" y="280" width="${W - 112}" height="${h}" rx="34" fill="#ffffff"/>
        <path d="M150 ${280 + h - 2} L190 ${280 + h - 2} L160 ${280 + h + 40} Z" fill="#ffffff"/>
        ${ls.map((l, i) => `<text x="${W / 2}" y="${280 + 66 + i * 58}" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="44" fill="#0f172a">${esc(l)}</text>`).join("")}
      </g>
      <g opacity="${entrada(0.5)}">
        ${personaje(prota, 170, 1000, 0.62, "feliz", false, tg)}
      </g>`;
  }

  // cierre
  const k = entrada(0);
  return `
    <g opacity="${k}">
      <circle cx="${W / 2}" cy="420" r="${150 + 8 * Math.sin(tg * 2)}" fill="${color}" fill-opacity="0.16"/>
      ${LOGO ? `<image href="${LOGO}" x="${W / 2 - 120}" y="300" width="240" height="240" clip-path="url(#logo)"/>` : ""}
    </g>
    <g opacity="${entrada(0.3)}" transform="translate(0 ${(1 - entrada(0.3)) * 20})">
      ${textoMultilinea(W / 2, 640, g.cierre.pantalla, { size: 46, maxCar: 22, alto: 1.2 })}
    </g>
    <g opacity="${entrada(0.8)}">
      <rect x="${W / 2 - 230}" y="840" width="460" height="74" rx="37" fill="${color}"/>
      <text x="${W / 2}" y="888" text-anchor="middle" font-family="Segoe UI" font-weight="800" font-size="28" fill="#0b1426">En Psyqus: ${esc(g.cta_label)}</text>
    </g>`;
}

/* ================================================================ voz y música */

const archivoVoz = (g, i) => path.join(TRABAJO, g.id, `${i}-${SEGMENTOS[i]}.wav`);
const firmaVoz = (texto) => `${VOZ}|${VELOCIDAD}|${texto}`;
/*
  Una voz sirve si el .wav existe y fue hecho con el mismo texto. Si existe
  la firma (voz|velocidad|texto) también debe coincidir; si no hay firma, la
  voz se generó por fuera (SOLO_LISTA=1 + tts.ps1) y se acepta tal cual.
*/
const vozVigente = (salida, texto) => {
  if (!fs.existsSync(salida)) return false;
  const firma = `${salida}.texto`;
  if (fs.existsSync(firma)) return fs.readFileSync(firma, "utf8") === firmaVoz(texto);
  const txt = salida.replace(/\.wav$/, ".txt");
  return fs.existsSync(txt) && fs.readFileSync(txt, "utf8") === texto && fs.statSync(salida).mtimeMs >= fs.statSync(txt).mtimeMs;
};

/*
  Genera de una sola vez todas las voces que falten (o cuyo texto cambió).
  Abrir PowerShell tarda más de un minuto en este equipo por el antivirus,
  así que se abre una vez por lote y no por frase.
*/
function prepararVoces(guionesLista) {
  const pendientes = [];
  for (const g of guionesLista) {
    fs.mkdirSync(path.join(TRABAJO, g.id), { recursive: true });
    SEGMENTOS.forEach((seg, i) => {
      const salida = archivoVoz(g, i);
      if (vozVigente(salida, g[seg].voz)) return;
      const texto = salida.replace(/\.wav$/, ".txt");
      fs.writeFileSync(texto, g[seg].voz, "utf8");
      pendientes.push({ texto, salida, voz: g[seg].voz });
    });
  }
  if (!pendientes.length) return "(todas reutilizadas)";

  const listaJson = path.join(TRABAJO, "voces.json");
  fs.writeFileSync(listaJson, JSON.stringify(pendientes.map(({ texto, salida }) => ({ texto, salida }))), "utf8");

  // SOLO_LISTA=1: solo deja la lista para generar las voces desde una
  // sesión de PowerShell ya abierta (mucho más rápido con el antivirus).
  if (SOLO_LISTA) {
    console.log(`LISTA ${pendientes.length} ${listaJson}`);
    process.exit(0);
  }

  console.log(`Generando ${pendientes.length} voces en un solo lote…`);

  let vozUsada = "";
  for (let intento = 1; intento <= 3; intento++) {
    const faltan = pendientes.filter((p) => !vozVigente(p.salida, p.voz));
    if (!faltan.length) break;
    fs.writeFileSync(listaJson, JSON.stringify(faltan.map(({ texto, salida }) => ({ texto, salida }))), "utf8");
    const r = spawnSync(
      "powershell",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", path.join(AQUI, "tts.ps1"), "-ListFile", listaJson, "-Voice", VOZ, "-Rate", String(VELOCIDAD)],
      { encoding: "utf8", timeout: 180000 + faltan.length * 60000 }
    );
    for (const linea of (r.stdout || "").split(/\r?\n/)) {
      if (linea.startsWith("VOZ ")) vozUsada = linea.slice(4);
      if (linea.startsWith("OK ")) {
        const p = faltan.find((x) => x.salida === linea.slice(3).trim());
        if (p) fs.writeFileSync(`${p.salida}.texto`, firmaVoz(p.voz), "utf8");
      }
      if (linea.startsWith("ERROR ")) console.log(`  ${linea}`);
    }
    if (r.error) console.log(`  voz: el lote ${intento} terminó con ${r.error.message}`);
  }
  const fallidas = pendientes.filter((p) => !vozVigente(p.salida, p.voz));
  if (fallidas.length) throw new Error(`No se pudieron generar ${fallidas.length} voces.`);
  return vozUsada;
}

function musica(salida, dur) {
  const rate = 22050;
  const n = Math.floor(dur * rate);
  const acordes = [
    [130.81, 196.0, 246.94, 329.63],
    [110.0, 164.81, 196.0, 261.63],
    [87.31, 174.61, 220.0, 329.63],
    [98.0, 146.83, 196.0, 293.66],
  ];
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const ci = Math.floor(t / 4) % 4;
    const tc = t % 4;
    const env = Math.min(1, tc / 0.8) * Math.min(1, (4 - tc) / 0.8 + 0.25);
    let v = 0;
    for (const f of acordes[ci]) v += Math.sin(2 * Math.PI * f * t) * 0.15;
    const paso = Math.floor(t / 0.5);
    v += Math.sin(2 * Math.PI * acordes[ci][paso % 4] * 4 * t) * 0.09 * Math.exp(-(t - paso * 0.5) * 6);
    const fade = Math.min(1, t / 1.2) * Math.min(1, (dur - t) / 1.5);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * env * 0.5 * fade)) * 32767), 44 + i * 2);
  }
  fs.writeFileSync(salida, buf);
}

/* ================================================================ un Short */

async function generar(g) {
  const dir = path.join(TRABAJO, g.id);
  fs.mkdirSync(dir, { recursive: true });

  // 1. Voz por segmento (ya generada en lote por prepararVoces).
  //    Con SIN_VOZ=1 la duración se estima por el largo del texto (vista previa).
  const durVoz = SEGMENTOS.map((seg, i) => (SIN_VOZ ? g[seg].voz.length / 14.5 : wavDuracion(archivoVoz(g, i))));
  const dur = durVoz.map((d, i) => PAUSA_INI + d + PAUSA_FIN + (i === SEGMENTOS.length - 1 ? 1.2 : 0));
  const inicio = dur.map((_, i) => dur.slice(0, i).reduce((s, x) => s + x, 0));
  const total = dur.reduce((s, x) => s + x, 0);
  const subs = SEGMENTOS.map((seg, i) => trozosSubtitulo(g[seg].voz, durVoz[i]));

  // 2. Cuadros → ffmpeg
  const video = path.join(dir, "video.mp4");
  const ff = spawn("ffmpeg", ["-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", video]);
  const cerrado = new Promise((ok, mal) => ff.on("close", (c) => (c === 0 ? ok() : mal(new Error(`ffmpeg ${c}`)))));
  const cuadros = Math.ceil(total * FPS);
  let poster = null;

  for (let f = 0; f < cuadros; f++) {
    const t = f / FPS;
    let i = 0;
    while (i < SEGMENTOS.length - 1 && t >= inicio[i + 1]) i++;
    const tl = t - inicio[i];
    const tv = tl - PAUSA_INI;
    const trozo = subs[i].find((s) => tv >= s.desde && tv < s.hasta + 0.25) || null;
    const svg = marco(g, i, clamp01(tl / dur[i]), cuadroSegmento(g, SEGMENTOS[i], tl, dur[i], t) + subtitulo(trozo?.txt));
    const raw = await sharp(Buffer.from(svg)).flatten({ background: "#0b1426" }).raw().toBuffer();
    if (!ff.stdin.write(raw)) await new Promise((r) => ff.stdin.once("drain", r));
    if (!poster && i === 0 && tl > 1.2) poster = svg;
    if (f % 100 === 0) console.log(`  ${g.id}: cuadro ${f}/${cuadros}`);
  }
  ff.stdin.end();
  await cerrado;

  fs.mkdirSync(SALIDA, { recursive: true });
  if (SIN_VOZ) {
    fs.copyFileSync(video, path.join(SALIDA, `${g.id}.sin-voz.mp4`));
    await sharp(Buffer.from(poster)).flatten({ background: "#0b1426" }).jpeg({ quality: 82 }).toFile(path.join(SALIDA, `${g.id}.jpg`));
    return { id: g.id, segundos: total };
  }

  // 3. Audio: voz en su lugar + música suave, volumen normalizado
  const mus = path.join(dir, "musica.wav");
  musica(mus, total);
  const entradas = SEGMENTOS.flatMap((_, i) => ["-i", path.join(dir, `${i}-${SEGMENTOS[i]}.wav`)]);
  const filtros = SEGMENTOS.map((_, i) => {
    const ms = Math.round((inicio[i] + PAUSA_INI) * 1000);
    return `[${i}:a]aresample=48000,adelay=${ms}|${ms}[v${i}]`;
  });
  filtros.push(`${SEGMENTOS.map((_, i) => `[v${i}]`).join("")}amix=inputs=${SEGMENTOS.length}:normalize=0[voz]`);
  filtros.push(`[${SEGMENTOS.length}:a]aresample=48000,volume=0.20[mus]`);
  filtros.push(`[voz][mus]amix=inputs=2:normalize=0,atrim=duration=${total.toFixed(3)},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000[a]`);
  const audio = path.join(dir, "audio.m4a");
  const ra = spawnSync("ffmpeg", ["-y", "-v", "error", ...entradas, "-i", mus, "-filter_complex", filtros.join(";"), "-map", "[a]", "-ac", "2", "-c:a", "aac", "-b:a", "160k", audio], { encoding: "utf8" });
  if (ra.status !== 0) throw new Error(ra.stderr);

  // 4. Unir y póster
  fs.mkdirSync(SALIDA, { recursive: true });
  const final = path.join(SALIDA, `${g.id}.mp4`);
  const rm = spawnSync("ffmpeg", ["-y", "-v", "error", "-i", video, "-i", audio, "-c:v", "copy", "-c:a", "copy", "-shortest", "-movflags", "+faststart", final], { encoding: "utf8" });
  if (rm.status !== 0) throw new Error(rm.stderr);
  await sharp(Buffer.from(poster)).flatten({ background: "#0b1426" }).jpeg({ quality: 82 }).toFile(path.join(SALIDA, `${g.id}.jpg`));

  return { id: g.id, segundos: total };
}

/* ================================================================ principal */

if (!SIN_VOZ) console.log(`Voz: ${prepararVoces(lista)}`);
if (SIN_VOZ && instalar) throw new Error("No se instalan vistas previas sin voz.");

const resultados = [];
for (const g of lista) {
  const t0 = Date.now();
  const r = await generar(g);
  resultados.push(r);
  console.log(`✓ ${r.id} · ${r.segundos.toFixed(1)} s · ${((Date.now() - t0) / 1000).toFixed(0)} s de proceso`);
}

if (instalar) {
  const sello = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15);
  const respaldo = path.join(RAIZ, "respaldos_shorts", `antes-v2-${sello}`);
  fs.mkdirSync(respaldo, { recursive: true });
  for (const r of resultados) {
    for (const ext of ["mp4", "jpg"]) {
      const destino = path.join(RAIZ, "public/shorts", `${r.id}.${ext}`);
      if (fs.existsSync(destino)) fs.copyFileSync(destino, path.join(respaldo, `${r.id}.${ext}`));
      fs.copyFileSync(path.join(SALIDA, `${r.id}.${ext}`), destino);
    }
  }
  console.log(`Instalados en public/shorts · respaldo en ${path.relative(RAIZ, respaldo)}`);
}
