import os
import re
from collections import defaultdict

ROOT = "."

page_files = []
env_usage = []
supabase_usage = []
file_case_map = defaultdict(list)

print("\n🔎 Analizando proyecto Psyqus...\n")

for root, dirs, files in os.walk(ROOT):
    for file in files:

        path = os.path.join(root, file)

        # detectar pages
        if file == "page.tsx":
            page_files.append(path)

        # detectar case sensitivity
        file_case_map[file.lower()].append(path)

        # analizar contenido
        if file.endswith((".ts", ".tsx", ".js")):

            try:
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()

                    # detectar uso de env
                    env_matches = re.findall(r'process\.env\.(\w+)', content)
                    for env in env_matches:
                        env_usage.append((env, path))

                    # detectar supabase
                    if "createClient(" in content or "supabase" in content:
                        supabase_usage.append(path)

            except:
                pass

print("📄 PAGES DETECTADAS:")
for p in page_files:
    print(" -", p)

print("\n⚠️ POSIBLES PROBLEMAS DE CASE SENSITIVITY:")
for name, paths in file_case_map.items():
    if len(paths) > 1:
        print(f" {name} ->")
        for p in paths:
            print("   ", p)

print("\n🌎 VARIABLES DE ENTORNO USADAS:")
for env, path in env_usage:
    print(f" {env} -> {path}")

print("\n🧠 ARCHIVOS QUE USAN SUPABASE:")
for s in supabase_usage:
    print(" -", s)

print("\n🚨 RECOMENDACIÓN:")

for s in supabase_usage:
    if "app" in s:
        print("⚠️ Supabase usado en:", s)
        print("   Considera agregar: export const dynamic = 'force-dynamic'\n")

print("\n✅ Diagnóstico terminado.\n")