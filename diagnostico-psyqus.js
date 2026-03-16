const fs = require("fs");
const path = require("path");

function checkFile(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf8");
}

function log(title, ok) {
  if (ok) {
    console.log("✅", title);
  } else {
    console.log("❌", title);
  }
}

console.log("\n🔎 DIAGNÓSTICO PROYECTO PSYQUS\n");

const root = process.cwd();

const layoutPath = path.join(root, "app", "layout.tsx");
const globalsPath = path.join(root, "app", "globals.css");
const tailwindPath = path.join(root, "tailwind.config.ts");
const postcssPath = path.join(root, "postcss.config.js");
const supabasePath = path.join(root, "lib", "supabase.ts");
const middlewarePath = path.join(root, "middleware.ts");

log("Existe app/layout.tsx", checkFile(layoutPath));
log("Existe app/globals.css", checkFile(globalsPath));
log("Existe tailwind.config.ts", checkFile(tailwindPath));
log("Existe postcss.config.js", checkFile(postcssPath));
log("Existe lib/supabase.ts", checkFile(supabasePath));
log("Existe middleware.ts (opcional)", checkFile(middlewarePath));

console.log("\n🔎 Revisando Tailwind config...\n");

const tailwindContent = readFile(tailwindPath);

if (tailwindContent.includes("./app/**/*")) {
  console.log("✅ Tailwind escanea carpeta app");
} else {
  console.log("❌ Tailwind NO escanea carpeta app");
}

console.log("\n🔎 Revisando globals.css...\n");

const globalsContent = readFile(globalsPath);

if (globalsContent.includes("@tailwind base")) {
  console.log("✅ @tailwind base encontrado");
} else {
  console.log("❌ Falta @tailwind base");
}

if (globalsContent.includes("@tailwind utilities")) {
  console.log("✅ @tailwind utilities encontrado");
} else {
  console.log("❌ Falta @tailwind utilities");
}

console.log("\n🔎 Revisando layout.tsx...\n");

const layoutContent = readFile(layoutPath);

if (layoutContent.includes("globals.css")) {
  console.log("✅ globals.css está importado en layout");
} else {
  console.log("❌ globals.css NO está importado en layout");
}

if (layoutContent.includes("ClerkProvider")) {
  console.log("✅ ClerkProvider detectado");
} else {
  console.log("⚠️ ClerkProvider no detectado");
}

console.log("\n🔎 Revisando Supabase export...\n");

const supabaseContent = readFile(supabasePath);

if (supabaseContent.includes("export const supabase")) {
  console.log("✅ Supabase exportado correctamente");
} else {
  console.log("❌ Supabase NO exportado");
}

console.log("\n🏁 Diagnóstico terminado\n");