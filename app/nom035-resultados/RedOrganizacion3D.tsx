"use client";

/*
  Red 3D de la organización (NOM-035).

  - Núcleo: la organización, con el color de su nivel general.
  - Áreas: nodos alrededor del núcleo.
  - Personas: avatares con iniciales y anillo del color de su
    nivel de riesgo, agrupados alrededor de su área.
  - Dominios (Guía II): órbita exterior; su tamaño refleja la
    proporción de personas en nivel Medio o superior.
  - Flecha de tendencia: apunta al centro de gravedad del
    riesgo (dominios o áreas con más riesgo). Es una
    proyección con los datos actuales, no un pronóstico.
*/

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type PersonaRed = {
  id: string;
  nombre: string;
  area: string;
  nivel: string | null; // nivel final Guía II
  seguimientoI: boolean; // criterio DOF de la Guía I
  siSinAcontecimiento: boolean;
};

export type DominioRed = {
  nombre: string;
  niveles: Record<string, number>;
  predominante: string;
};

type Props = {
  personas: PersonaRed[];
  dominios: DominioRed[];
  lecturaIA: {
    cargando: boolean;
    tendencia?: string;
    focos?: string[];
    resumen?: string;
    error?: boolean;
  };
  onPedirLectura: () => void;
};

const NIVELES = ["Nulo o despreciable", "Bajo", "Medio", "Alto", "Muy alto"];

const COLOR: Record<string, string> = {
  "Nulo o despreciable": "#38bdf8",
  Bajo: "#4ade80",
  Medio: "#facc15",
  Alto: "#fb923c",
  "Muy alto": "#ef4444",
  "Sin dato": "#94a3b8",
};

/* Riesgo de 0 a 4 por persona. */
export function riesgoPersona(p: PersonaRed) {
  if (p.nivel) {
    const i = NIVELES.indexOf(p.nivel);
    return Math.max(i, p.seguimientoI ? 4 : 0);
  }
  if (p.seguimientoI) return 4;
  if (p.siSinAcontecimiento) return 1;
  return 0;
}

function nivelDeRiesgo(r: number) {
  return NIVELES[Math.max(0, Math.min(4, Math.round(r)))];
}

function etiquetaPersona(p: PersonaRed) {
  if (p.nivel) return `Guía II: ${p.nivel}${p.seguimientoI ? " · Guía I: seguimiento" : ""}`;
  if (p.seguimientoI) return "Guía I: requiere valoración clínica";
  if (p.siSinAcontecimiento) return "Guía I: respuestas «Sí» sin acontecimiento";
  return "Guía I: sin criterio de seguimiento";
}

function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");
}

function texturaAvatar(texto: string, color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  ctx.beginPath();
  ctx.arc(64, 64, 58, 0, Math.PI * 2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.stroke();
  // Silueta
  ctx.fillStyle = "#cbd5e1";
  ctx.beginPath();
  ctx.arc(64, 50, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(64, 96, 30, 20, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText(texto, 64, 57);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function texturaTexto(texto: string, color = "#e2e8f0", tam = 34) {
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d")!;
  ctx.font = `bold ${tam}px Arial`;
  const ancho = Math.ceil(ctx.measureText(texto).width) + 24;
  c.width = ancho;
  c.height = tam + 20;
  ctx.font = `bold ${tam}px Arial`;
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  ctx.fillText(texto, 12, c.height / 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return { textura: t, aspecto: c.width / c.height };
}

function normalizarArea(area: string) {
  const a = String(area || "Sin área").trim().toLocaleLowerCase("es-MX");
  return a.charAt(0).toLocaleUpperCase("es-MX") + a.slice(1);
}

export default function RedOrganizacion3D({ personas, dominios, lecturaIA, onPedirLectura }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number; p: PersonaRed } | null>(null);

  /* ---------- Análisis (antes de dibujar) ---------- */
  const analisis = useMemo(() => {
    const areas = new Map<string, PersonaRed[]>();
    personas.forEach((p) => {
      const a = normalizarArea(p.area);
      areas.set(a, [...(areas.get(a) || []), p]);
    });

    const resumenAreas = [...areas.entries()]
      .map(([nombre, ps]) => ({
        nombre,
        personas: ps,
        riesgo: ps.reduce((s, p) => s + riesgoPersona(p), 0) / ps.length,
        enRiesgo: ps.filter((p) => riesgoPersona(p) >= 2).length,
      }))
      .sort((a, b) => b.riesgo - a.riesgo);

    const riesgoGlobal = personas.length
      ? personas.reduce((s, p) => s + riesgoPersona(p), 0) / personas.length
      : 0;

    const dominiosRiesgo = dominios
      .map((d) => {
        const total = Object.values(d.niveles).reduce((a, b) => a + b, 0) || 1;
        const medioOMas = (d.niveles["Medio"] || 0) + (d.niveles["Alto"] || 0) + (d.niveles["Muy alto"] || 0);
        const altoOMas = (d.niveles["Alto"] || 0) + (d.niveles["Muy alto"] || 0);
        return { ...d, proporcion: medioOMas / total, altos: altoOMas, total };
      })
      .sort((a, b) => b.proporcion - a.proporcion);

    const focoDominio = dominiosRiesgo.find((d) => d.proporcion >= 0.3);
    const focoArea = resumenAreas.find((a) => a.enRiesgo > 0 && resumenAreas.length > 1);

    let direccion: string;
    if (!personas.length) direccion = "Sin datos.";
    else if (focoDominio)
      direccion = `La presión se concentra en el dominio «${focoDominio.nombre}» (${Math.round(
        focoDominio.proporcion * 100
      )}% del grupo en nivel Medio o superior). Si no se atiende, es el frente con más probabilidad de elevar el nivel general en la próxima medición.`;
    else if (focoArea)
      direccion = `El riesgo se concentra en el área «${focoArea.nombre}» (${focoArea.enRiesgo} de ${focoArea.personas.length} personas con señales). Conviene priorizarla.`;
    else
      direccion = "La red está estable: no hay concentraciones de riesgo. La prioridad es mantener las acciones preventivas.";

    return { resumenAreas, riesgoGlobal, dominiosRiesgo, focoDominio, direccion };
  }, [personas, dominios]);

  /* ---------- Escena 3D ---------- */
  useEffect(() => {
    const host = contenedor.current;
    if (!host) return;

    const ancho = host.clientWidth;
    const alto = host.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(ancho, alto);
    host.appendChild(renderer.domElement);

    const escena = new THREE.Scene();
    escena.fog = new THREE.FogExp2(0x020617, 0.022);

    const camara = new THREE.PerspectiveCamera(50, ancho / alto, 0.1, 200);
    camara.position.set(0, 9, 26);

    const controles = new OrbitControls(camara, renderer.domElement);
    controles.enableDamping = true;
    controles.autoRotate = true;
    controles.autoRotateSpeed = 0.6;
    controles.minDistance = 10;
    controles.maxDistance = 55;

    escena.add(new THREE.AmbientLight(0xffffff, 0.7));
    const luz = new THREE.PointLight(0x22d3ee, 60, 60);
    luz.position.set(0, 6, 0);
    escena.add(luz);

    const desechables: { dispose: () => void }[] = [];
    const seguir = <T extends { dispose: () => void }>(x: T) => (desechables.push(x), x);

    // Núcleo
    const colorGlobal = new THREE.Color(COLOR[nivelDeRiesgo(analisis.riesgoGlobal)]);
    const nucleo = new THREE.Mesh(
      seguir(new THREE.IcosahedronGeometry(1.5, 3)),
      seguir(new THREE.MeshStandardMaterial({ color: colorGlobal, emissive: colorGlobal, emissiveIntensity: 0.55, roughness: 0.3 }))
    );
    escena.add(nucleo);
    const halo = new THREE.Mesh(
      seguir(new THREE.SphereGeometry(2.3, 32, 32)),
      seguir(new THREE.MeshBasicMaterial({ color: colorGlobal, transparent: true, opacity: 0.12 }))
    );
    escena.add(halo);

    const etiqueta = (texto: string, pos: THREE.Vector3, alto = 0.7, color?: string) => {
      const { textura, aspecto } = texturaTexto(texto, color);
      seguir(textura);
      const s = new THREE.Sprite(seguir(new THREE.SpriteMaterial({ map: textura, transparent: true, depthWrite: false })));
      s.scale.set(alto * aspecto, alto, 1);
      s.position.copy(pos);
      escena.add(s);
      return s;
    };
    etiqueta("Organización", new THREE.Vector3(0, 2.8, 0), 0.8, "#67e8f9");

    // Conexiones y pulsos
    const lineas: number[] = [];
    const pulsos: { desde: THREE.Vector3; hasta: THREE.Vector3; t: number; v: number; mesh: THREE.Mesh }[] = [];
    const geoPulso = seguir(new THREE.SphereGeometry(0.09, 8, 8));
    const conectar = (a: THREE.Vector3, b: THREE.Vector3, color: string, conPulso: boolean) => {
      lineas.push(a.x, a.y, a.z, b.x, b.y, b.z);
      if (conPulso) {
        const m = new THREE.Mesh(geoPulso, seguir(new THREE.MeshBasicMaterial({ color })));
        escena.add(m);
        pulsos.push({ desde: a, hasta: b, t: Math.random(), v: 0.15 + Math.random() * 0.25, mesh: m });
      }
    };

    // Áreas y personas
    const sprites: { sprite: THREE.Sprite; persona: PersonaRed }[] = [];
    const nAreas = analisis.resumenAreas.length;
    const radioAreas = nAreas > 1 ? 7 : 0.001;
    const centroRiesgo = new THREE.Vector3();
    let pesoRiesgo = 0;

    analisis.resumenAreas.forEach((area, i) => {
      const ang = (i / Math.max(1, nAreas)) * Math.PI * 2;
      const hub = new THREE.Vector3(Math.cos(ang) * radioAreas, Math.sin(i * 1.7) * 1.2, Math.sin(ang) * radioAreas);
      const colorArea = COLOR[nivelDeRiesgo(area.riesgo)];

      if (nAreas > 1) {
        const m = new THREE.Mesh(
          seguir(new THREE.OctahedronGeometry(0.55)),
          seguir(new THREE.MeshStandardMaterial({ color: colorArea, emissive: colorArea, emissiveIntensity: 0.4 }))
        );
        m.position.copy(hub);
        escena.add(m);
        etiqueta(area.nombre, hub.clone().add(new THREE.Vector3(0, 1, 0)), 0.55);
        conectar(new THREE.Vector3(), hub, colorArea, true);
      }

      // Personas en una esfera de Fibonacci alrededor del área.
      const n = area.personas.length;
      const radio = nAreas > 1 ? 1.6 + Math.sqrt(n) * 0.45 : 3.2 + Math.sqrt(n) * 0.8;
      area.personas.forEach((p, k) => {
        const y = 1 - (k / Math.max(1, n - 1 || 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const phi = k * 2.399963;
        const pos = hub.clone().add(new THREE.Vector3(Math.cos(phi) * r * radio, y * radio * 0.6, Math.sin(phi) * r * radio));
        const riesgo = riesgoPersona(p);
        const color = COLOR[nivelDeRiesgo(riesgo)];
        const tex = seguir(texturaAvatar(iniciales(p.nombre), color));
        const s = new THREE.Sprite(seguir(new THREE.SpriteMaterial({ map: tex, transparent: true })));
        const tam = 0.85 + riesgo * 0.08;
        s.scale.set(tam, tam, 1);
        s.position.copy(pos);
        escena.add(s);
        sprites.push({ sprite: s, persona: p });
        conectar(nAreas > 1 ? hub : new THREE.Vector3(), pos, color, riesgo >= 2);
        if (riesgo >= 2) {
          centroRiesgo.add(pos.clone().multiplyScalar(riesgo));
          pesoRiesgo += riesgo;
        }
      });
    });

    // Dominios (Guía II) en órbita exterior
    const nDom = analisis.dominiosRiesgo.length;
    const centroDominios = new THREE.Vector3();
    let pesoDominios = 0;
    analisis.dominiosRiesgo.forEach((d, i) => {
      const ang = (i / nDom) * Math.PI * 2 + 0.3;
      const pos = new THREE.Vector3(Math.cos(ang) * 14, -2.5 + Math.sin(ang * 2) * 1.5, Math.sin(ang) * 14);
      const color = COLOR[d.predominante] || COLOR["Sin dato"];
      const m = new THREE.Mesh(
        seguir(new THREE.SphereGeometry(0.35 + d.proporcion * 1.1, 24, 24)),
        seguir(new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, transparent: true, opacity: 0.9 }))
      );
      m.position.copy(pos);
      escena.add(m);
      etiqueta(d.nombre, pos.clone().add(new THREE.Vector3(0, 1.1 + d.proporcion, 0)), 0.45, "#cbd5e1");
      lineas.push(0, 0, 0, pos.x, pos.y, pos.z);
      if (d.proporcion >= 0.3) {
        centroDominios.add(pos.clone().multiplyScalar(d.proporcion));
        pesoDominios += d.proporcion;
      }
    });

    const geoLineas = seguir(new THREE.BufferGeometry());
    geoLineas.setAttribute("position", new THREE.Float32BufferAttribute(lineas, 3));
    escena.add(new THREE.LineSegments(geoLineas, seguir(new THREE.LineBasicMaterial({ color: 0x334155, transparent: true, opacity: 0.55 }))));

    // Flecha de tendencia
    const destino = pesoDominios
      ? centroDominios.divideScalar(pesoDominios)
      : pesoRiesgo
      ? centroRiesgo.divideScalar(pesoRiesgo)
      : null;
    let flecha: THREE.ArrowHelper | null = null;
    if (destino && destino.length() > 0.5) {
      const largo = Math.min(destino.length(), 11);
      flecha = new THREE.ArrowHelper(destino.clone().normalize(), new THREE.Vector3(), largo, 0xf472b6, 1.2, 0.7);
      escena.add(flecha);
      etiqueta("Tendencia", destino.clone().normalize().multiplyScalar(largo + 1), 0.6, "#f9a8d4");
    }

    // Estrellas de fondo
    const estrellas = new Float32Array(900);
    for (let i = 0; i < estrellas.length; i++) estrellas[i] = (Math.random() - 0.5) * 120;
    const geoEstrellas = seguir(new THREE.BufferGeometry());
    geoEstrellas.setAttribute("position", new THREE.BufferAttribute(estrellas, 3));
    escena.add(new THREE.Points(geoEstrellas, seguir(new THREE.PointsMaterial({ color: 0x475569, size: 0.12 }))));

    // Interacción
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const alMover = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camara);
      const hit = raycaster.intersectObjects(sprites.map((s) => s.sprite))[0];
      const encontrado = hit && sprites.find((s) => s.sprite === hit.object);
      controles.autoRotate = !encontrado;
      setHover(encontrado ? { x: e.clientX - r.left, y: e.clientY - r.top, p: encontrado.persona } : null);
    };
    renderer.domElement.addEventListener("pointermove", alMover);

    const alRedimensionar = () => {
      const w = host.clientWidth, h = host.clientHeight;
      camara.aspect = w / h;
      camara.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", alRedimensionar);

    // Animación
    let cuadro = 0;
    const reloj = new THREE.Clock();
    const animar = () => {
      cuadro = requestAnimationFrame(animar);
      const dt = reloj.getDelta();
      const t = reloj.elapsedTime;
      nucleo.rotation.y += dt * 0.3;
      halo.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
      pulsos.forEach((p) => {
        p.t = (p.t + dt * p.v) % 1;
        p.mesh.position.lerpVectors(p.desde, p.hasta, p.t);
      });
      if (flecha) flecha.setLength(Math.min(destino!.length(), 11) * (0.92 + Math.sin(t * 2.5) * 0.08), 1.2, 0.7);
      controles.update();
      renderer.render(escena, camara);
    };
    animar();

    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("resize", alRedimensionar);
      renderer.domElement.removeEventListener("pointermove", alMover);
      controles.dispose();
      desechables.forEach((d) => d.dispose());
      renderer.dispose();
      host.removeChild(renderer.domElement);
    };
  }, [analisis]);

  const nivelGlobal = nivelDeRiesgo(analisis.riesgoGlobal);

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6">
      <div className="relative h-[560px] overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_center,_#0b1730_0%,_#020617_70%)]">
        <div ref={contenedor} className="absolute inset-0" />

        {hover && (
          <div
            className="pointer-events-none absolute z-10 rounded-xl border border-white/10 bg-slate-950/95 px-4 py-3 text-sm shadow-xl"
            style={{ left: Math.min(hover.x + 14, 9999), top: hover.y + 14 }}
          >
            <p className="font-bold text-white">{hover.p.nombre}</p>
            <p className="text-slate-400">{normalizarArea(hover.p.area)}</p>
            <p className="mt-1" style={{ color: COLOR[nivelDeRiesgo(riesgoPersona(hover.p))] }}>
              {etiquetaPersona(hover.p)}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-slate-300">
          {NIVELES.map((n) => (
            <span key={n} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLOR[n] }} />
              {n}
            </span>
          ))}
        </div>

        <p className="pointer-events-none absolute right-4 top-4 text-xs text-slate-500">
          Arrastra para girar · rueda para acercar · pasa sobre un avatar
        </p>
      </div>

      <aside className="space-y-5">
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Estado de la organización</p>
          <p className="mt-3 text-3xl font-black" style={{ color: COLOR[nivelGlobal] }}>
            {nivelGlobal}
          </p>
          <div className="mt-4 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${(analisis.riesgoGlobal / 4) * 100}%`, background: COLOR[nivelGlobal] }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Índice de riesgo promedio {analisis.riesgoGlobal.toFixed(1)} de 4</p>
        </div>

        <div className="rounded-2xl border border-pink-400/20 bg-pink-500/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-300">Hacia dónde va</p>
          <p className="mt-3 text-sm leading-6 text-slate-200">{analisis.direccion}</p>
          {analisis.dominiosRiesgo.length > 0 && (
            <div className="mt-4 space-y-2">
              {analisis.dominiosRiesgo.slice(0, 4).map((d) => (
                <div key={d.nombre}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="text-slate-400">{d.nombre}</span>
                    <span className="font-bold text-white">{Math.round(d.proporcion * 100)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${d.proporcion * 100}%`, background: COLOR[d.predominante] }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-500">% del grupo en nivel Medio o superior por dominio.</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Lectura inteligente</p>

          {!lecturaIA.cargando && !lecturaIA.tendencia && (
            <>
              <p className="mt-3 text-sm text-slate-300">
                La IA lee primero todos los datos (anónimos y agregados) y después proyecta la tendencia y los focos de atención.
              </p>
              <button
                onClick={onPedirLectura}
                className="mt-4 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-300"
              >
                Analizar la red
              </button>
              {lecturaIA.error && <p className="mt-3 text-xs text-red-300">No fue posible generar la lectura. Intenta de nuevo.</p>}
            </>
          )}

          {lecturaIA.cargando && <p className="mt-3 text-sm text-cyan-200">Leyendo los datos de la evaluación…</p>}

          {lecturaIA.tendencia && (
            <div className="mt-3 space-y-4 text-sm leading-6 text-slate-200">
              {lecturaIA.resumen && <p>{lecturaIA.resumen}</p>}
              <p>
                <span className="font-bold text-cyan-300">Tendencia: </span>
                {lecturaIA.tendencia}
              </p>
              {!!lecturaIA.focos?.length && (
                <div>
                  <p className="font-bold text-cyan-300">Requiere atención en:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {lecturaIA.focos.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-xs text-slate-500">Proyección con los datos actuales; no es un pronóstico. Debe revisarla un profesional.</p>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
