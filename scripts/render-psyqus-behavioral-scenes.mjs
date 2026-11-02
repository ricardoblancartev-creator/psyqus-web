import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const output = process.argv[2] || path.resolve(".video-work");
await fs.mkdir(output, { recursive: true });

const narration = [
  "En hora pico, cada conductor se pregunta: ¿a qué bomba me conviene entrar?",
  "Una fila corta no siempre significa menos espera. El tiempo de servicio también importa.",
  "Psyqus Behavioral te permite explorar escenarios antes de cambiar la operación.",
  "Compara la fila visible con la carga estimada, usando las mismas llegadas y tiempos de servicio.",
  "Observa espera media, percentil noventa y filas máximas bajo distintos supuestos conductuales.",
  "Es un prototipo experimental. Valídalo con datos de tu estación. Psyqus Behavioral. Solicita un piloto.",
];

const e = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const t = (x, y, text, size = 48, color = "#eef6f3", weight = 500, extra = "") => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${e(text)}</text>`;
const multiline = (x, y, lines, size = 80, color = "#f2f7f5", weight = 700, step = 1.12) => lines.map((line, i) => t(x, y + i * size * step, line, size, color, weight)).join("");
const car = (x, y, color, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="0" y="22" width="122" height="46" rx="17" fill="${color}"/><path d="M22 22 39 2h46l20 20" fill="${color}"/><rect x="43" y="7" width="34" height="15" rx="5" fill="#17302d"/><rect x="82" y="7" width="18" height="15" rx="5" fill="#17302d"/><circle cx="28" cy="69" r="11" fill="#101a1a" stroke="#90a49d" stroke-width="4"/><circle cx="96" cy="69" r="11" fill="#101a1a" stroke="#90a49d" stroke-width="4"/></g>`;
const pump = (x, y, scale = 1) => `<g transform="translate(${x} ${y}) scale(${scale})"><rect x="12" y="0" width="90" height="180" rx="15" fill="#1e3431" stroke="#4b6c63" stroke-width="5"/><rect x="27" y="20" width="60" height="45" rx="7" fill="#081210" stroke="#50d2a7" stroke-width="3"/><path d="M102 42h22v86q0 16 13 16" fill="none" stroke="#7da89a" stroke-width="8" stroke-linecap="round"/><rect x="0" y="165" width="114" height="12" rx="6" fill="#50d2a7"/></g>`;
const panel = (x, y, w, h, content, fill = "#12201e") => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${fill}" stroke="#2c4941" stroke-width="2"/>${content}</g>`;

const header = (section) => `<g><circle cx="132" cy="102" r="18" fill="#50d2a7"/><circle cx="132" cy="102" r="8" fill="#0b1213"/><path d="M132 84v36M114 102h36" stroke="#b6f3dd" stroke-width="3"/><text x="166" y="111" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#d7e5df" letter-spacing="2">PSYQUS BEHAVIORAL</text><text x="1770" y="107" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="600" fill="#729188" letter-spacing="2">${e(section.toUpperCase())}</text><path d="M130 142H1790" stroke="#29433c" stroke-width="2"/></g>`;
const caption = (line, index) => `<g><rect x="88" y="858" width="1744" height="164" rx="28" fill="#08100f" fill-opacity=".91" stroke="#2e4a42" stroke-width="2"/><rect x="88" y="858" width="8" height="164" rx="4" fill="#50d2a7"/>${multiline(135, 924, line.length > 79 ? [line.slice(0, line.lastIndexOf(" ", 75)), line.slice(line.lastIndexOf(" ", 75) + 1)] : [line], 38, "#f2f7f5", 600, 1.18)}<text x="1780" y="988" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="16" fill="#739087">0${index + 1} / 06</text></g>`;
const background = () => `<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#101e20"/><stop offset=".55" stop-color="#0b1617"/><stop offset="1" stop-color="#0d211d"/></linearGradient><radialGradient id="glow"><stop offset="0" stop-color="#1a5a47" stop-opacity=".5"/><stop offset="1" stop-color="#0b1213" stop-opacity="0"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#bg)"/><ellipse cx="1540" cy="470" rx="650" ry="540" fill="url(#glow)"/><path d="M0 700 1920 280M0 820 1920 400" stroke="#294039" stroke-opacity=".2" stroke-width="2"/>`;

const art = [
  `<g transform="translate(0 0)">${multiline(140, 355, ["¿Qué fila", "avanzará mejor?"], 91)}<text x="145" y="570" font-family="Arial" font-size="27" fill="#94aaa2">Una pregunta real en cada hora pico.</text>${panel(980, 230, 730, 520, `<path d="M1040 360h610M1040 525h610" stroke="#2a4740" stroke-width="8" stroke-dasharray="18 18"/><path d="M1055 300h600" stroke="#47675d" stroke-width="9"/><path d="M1120 300v-43h450v43" fill="none" stroke="#50d2a7" stroke-width="9"/>${pump(1075, 380, .82)}${pump(1440, 380, .82)}${car(1210, 425, "#65a9ff", .92)}${car(1225, 590, "#32c99a", .92)}${car(1400, 590, "#ff9b68", .92)}<text x="1050" y="710" font-family="Arial" font-size="20" fill="#93aaa1">BOMBAS · FILAS · DECISIONES</text>`, "#0f1b19")}</g>`,
  `<g>${multiline(140, 335, ["Una fila corta", "no siempre es", "la más rápida."], 78)}${panel(1030, 235, 700, 495, `<text x="1080" y="295" font-family="Arial" font-size="23" font-weight="700" fill="#dbe8e3">LO QUE SE VE / LO QUE IMPORTA</text><text x="1080" y="365" font-family="Arial" font-size="20" fill="#8ca49b">FILA A · MENOS AUTOS</text>${car(1080, 390, "#65a9ff", .65)}${car(1230, 390, "#65a9ff", .65)}<rect x="1470" y="395" width="185" height="22" rx="11" fill="#20332f"/><rect x="1470" y="395" width="66" height="22" rx="11" fill="#65a9ff"/><text x="1080" y="515" font-family="Arial" font-size="20" fill="#8ca49b">FILA B · SERVICIO MÁS LENTO</text>${car(1080, 545, "#ff9b68", .65)}<rect x="1470" y="555" width="185" height="22" rx="11" fill="#20332f"/><rect x="1470" y="555" width="148" height="22" rx="11" fill="#ff9b68"/><text x="1080" y="665" font-family="Arial" font-size="17" fill="#6e887f">DIAGRAMA ILUSTRATIVO · SIN DATOS REALES</text>`)}</g>`,
  `<g>${multiline(140, 355, ["Prueba el escenario", "antes del turno."], 77)}<text x="145" y="570" font-family="Arial" font-size="26" fill="#94aaa2">Ajusta capacidad, demanda y servicio.</text>${panel(1010, 220, 710, 535, `<text x="1070" y="285" font-family="Arial" font-size="21" font-weight="700" fill="#50d2a7">CONFIGURACIÓN · EJEMPLO</text><text x="1070" y="365" font-family="Arial" font-size="21" fill="#c3d2cd">Bombas abiertas</text><text x="1630" y="365" text-anchor="end" font-family="Arial" font-size="24" fill="#50d2a7">4</text><rect x="1070" y="390" width="570" height="9" rx="4" fill="#274239"/><rect x="1070" y="390" width="250" height="9" rx="4" fill="#50d2a7"/><text x="1070" y="465" font-family="Arial" font-size="21" fill="#c3d2cd">Llegadas por hora</text><text x="1630" y="465" text-anchor="end" font-family="Arial" font-size="24" fill="#65a9ff">34</text><rect x="1070" y="490" width="570" height="9" rx="4" fill="#274239"/><rect x="1070" y="490" width="335" height="9" rx="4" fill="#65a9ff"/><text x="1070" y="565" font-family="Arial" font-size="21" fill="#c3d2cd">Tiempo de servicio promedio</text><text x="1630" y="565" text-anchor="end" font-family="Arial" font-size="24" fill="#ff9b68">7 min</text><rect x="1070" y="590" width="570" height="9" rx="4" fill="#274239"/><rect x="1070" y="590" width="280" height="9" rx="4" fill="#ff9b68"/><text x="1070" y="685" font-family="Arial" font-size="16" fill="#718b82">VALORES DE DEMOSTRACIÓN · NO SON MEDICIONES</text>`)}</g>`,
  `<g>${multiline(140, 350, ["Mismas llegadas.", "Dos reglas."], 80)}<text x="145" y="555" font-family="Arial" font-size="25" fill="#94aaa2">Compara bajo condiciones pareadas.</text>${panel(970, 230, 760, 520, `<text x="1030" y="290" font-family="Arial" font-size="22" font-weight="700" fill="#dce8e3">COMPARACIÓN ILUSTRATIVA</text><path d="M1055 625h600M1055 355v270" stroke="#345047" stroke-width="3"/><path d="M1070 570C1160 530 1210 585 1300 485S1470 475 1635 390" fill="none" stroke="#65a9ff" stroke-width="7" stroke-linecap="round"/><path d="M1070 590C1160 575 1210 535 1300 520S1470 490 1635 460" fill="none" stroke="#50d2a7" stroke-width="7" stroke-linecap="round"/><circle cx="1110" cy="551" r="8" fill="#65a9ff"/><circle cx="1110" cy="581" r="8" fill="#50d2a7"/><text x="1070" y="690" font-family="Arial" font-size="18" fill="#65a9ff">FILA VISIBLE</text><text x="1300" y="690" font-family="Arial" font-size="18" fill="#50d2a7">CARGA ESTIMADA</text><text x="1070" y="725" font-family="Arial" font-size="15" fill="#718b82">LÍNEAS ESQUEMÁTICAS · NO SON RESULTADOS DE CAMPO</text>`)}</g>`,
  `<g>${multiline(140, 350, ["Mide lo que", "importa."], 84)}<text x="145" y="555" font-family="Arial" font-size="25" fill="#94aaa2">Indicadores para formular mejores preguntas.</text>${panel(970, 240, 760, 510, `<g>${[[1020,"ESPERA MEDIA","Promedio"],[1240,"PERCENTIL 90","Cola alta"],[1460,"FILA MÁXIMA","Pico" ]].map(([x,title,sub])=>`<rect x="${x}" y="350" width="190" height="250" rx="24" fill="#0b1615" stroke="#2b4940" stroke-width="2"/><circle cx="${Number(x)+95}" cy="420" r="36" fill="#173a30"/><path d="M${Number(x)+95} 395v27l19 10" fill="none" stroke="#50d2a7" stroke-width="5" stroke-linecap="round"/><text x="${Number(x)+95}" y="510" text-anchor="middle" font-family="Arial" font-size="17" font-weight="700" fill="#dbe8e3">${e(title)}</text><text x="${Number(x)+95}" y="548" text-anchor="middle" font-family="Arial" font-size="16" fill="#839c92">${e(sub)}</text><text x="${Number(x)+95}" y="580" text-anchor="middle" font-family="Arial" font-size="13" fill="#627e74">COMPARAR</text>`).join("")}</g><text x="1020" y="685" font-family="Arial" font-size="15" fill="#718b82">RESULTADOS DEPENDEN DE LOS SUPUESTOS DEL MODELO</text>`)}</g>`,
  `<g><circle cx="960" cy="335" r="83" fill="#10211d" stroke="#50d2a7" stroke-width="4"/><circle cx="960" cy="335" r="38" fill="none" stroke="#d4eee4" stroke-width="5"/><circle cx="960" cy="252" r="10" fill="#50d2a7"/><circle cx="877" cy="335" r="10" fill="#65a9ff"/><circle cx="1043" cy="335" r="10" fill="#65a9ff"/><circle cx="960" cy="418" r="10" fill="#ff9b68"/><path d="M960 263v34M887 335h34M999 335h34M960 373v34" stroke="#9dcbbb" stroke-width="4"/><text x="960" y="520" text-anchor="middle" font-family="Arial" font-size="69" font-weight="700" fill="#f2f7f5">PSYQUS</text><text x="960" y="572" text-anchor="middle" font-family="Arial" font-size="24" font-weight="600" letter-spacing="8" fill="#50d2a7">BEHAVIORAL</text><text x="960" y="665" text-anchor="middle" font-family="Arial" font-size="31" fill="#dbe8e3">Explora. Compara. Decide con más información.</text><rect x="725" y="710" width="470" height="72" rx="36" fill="#50d2a7"/><text x="960" y="756" text-anchor="middle" font-family="Arial" font-size="25" font-weight="700" fill="#082019">SOLICITA UN PILOTO</text><text x="960" y="825" text-anchor="middle" font-family="Arial" font-size="15" fill="#8fa69e">PROTOTIPO EXPERIMENTAL · VALIDAR CON DATOS DE CAMPO</text></g>`,
];

for (let i = 0; i < art.length; i++) {
  const body = `${background()}${header(i === 5 ? "explora · compara · decide" : "simulación conductual")}<g>${art[i]}</g>${caption(narration[i], i)}</svg>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${body}`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(output, `escena-${String(i + 1).padStart(2, "0")}.png`));
}

const duraciones = [7.5, 7.5, 7.5, 7.5, 7.5, 10];
const duracionesVoz = [5.21, 6.28, 4.95, 6.07, 6.29, 9];
const filtros = [];
for (let i = 0; i < art.length; i++) {
  filtros.push(`[${i}:v]zoompan=z='min(zoom+0.00019,1.045)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1280x720:fps=24,trim=duration=${duraciones[i]},setpts=PTS-STARTPTS,format=yuv420p,settb=1/24[v${i}]`);
}
for (let i = 0; i < art.length - 1; i++) {
  const anterior = i === 0 ? "v0" : `xf${i - 1}`;
  const actual = i + 1;
  const offset = duraciones.slice(0, actual).reduce((suma, n) => suma + n, 0) - actual * .4;
  filtros.push(`[${anterior}][v${actual}]xfade=transition=fade:duration=0.4:offset=${offset.toFixed(1)}[xf${i}]`);
}
filtros.push(`[xf${art.length - 2}]null[vout]`);
for (let i = 0; i < art.length; i++) {
  const inputIndex = art.length + i;
  const padding = Math.max(0, duraciones[i] - duracionesVoz[i]);
  filtros.push(`[${inputIndex}:a]aresample=48000,apad=pad_dur=${padding.toFixed(2)},atrim=duration=${duraciones[i]},asetpts=PTS-STARTPTS[a${i}]`);
}
filtros.push(`${art.map((_, i) => `[a${i}]`).join("")}concat=n=${art.length}:v=0:a=1,volume=1.12[voice]`);
filtros.push(`[12:a]volume=0.04,afade=t=in:st=0:d=1.2,afade=t=out:st=42.5:d=2.5,atrim=duration=45.5[music]`);
filtros.push(`[voice][music]amix=inputs=2:duration=longest:dropout_transition=0:weights='1 0.48',alimiter=limit=0.92[aout]`);
await fs.writeFile(path.join(output, "filter_complex.txt"), filtros.join(";\n"), "utf8");

console.log(`Created ${art.length} scene frames and video filter graph in ${output}`);
