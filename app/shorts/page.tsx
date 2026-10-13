"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  Brain,
  BookOpen,
  Activity,
  ClipboardList,
  HeartHandshake,
  Volume2,
  VolumeX,
  Play,
  Loader2,
  Sparkles,
} from "lucide-react";

type ShortBienestar = {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  video_url: string;
  cta_label: string | null;
  cta_href: string | null;
  orden: number | null;
};

export default function ShortsPage() {
  const [shorts, setShorts] = useState<ShortBienestar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    async function cargarContenido() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("contenido_bienestar")
        .select(
          `
          id,
          titulo,
          descripcion,
          categoria,
          video_url,
          cta_label,
          cta_href,
          orden
        `
        )
        .eq("activo", true)
        .order("orden", { ascending: true });

      if (error) {
        console.error("Error cargando Psyqus Shorts:", error);
        setError(
          "Todavía no fue posible cargar el contenido de bienestar."
        );
        setLoading(false);
        return;
      }

      setShorts((data || []) as ShortBienestar[]);
      setLoading(false);
    }

    cargarContenido();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#020617] text-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">
            Preparando tu espacio...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#020617] px-6 text-white">
        <div className="max-w-md text-center">
          <Brain className="mx-auto mb-5 h-10 w-10 text-cyan-400" />

          <h1 className="text-xl font-semibold">
            Psyqus
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error}
          </p>

          <Link
            href="/dashboard"
            className="mt-7 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm transition hover:bg-white/10"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  if (shorts.length === 0) {
    return (
      <main className="flex min-h-[100dvh] flex-col bg-[#020617] text-white">
        <div className="flex flex-1 items-center justify-center px-6 pb-24">
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
              <Sparkles className="h-7 w-7 text-cyan-400" />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Psyqus Shorts
            </p>

            <h1 className="mt-3 text-2xl font-semibold">
              Tu espacio de bienestar
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Aún no hay contenido publicado.
              Cuando se agreguen nuevos videos aparecerán aquí.
            </p>
          </div>
        </div>

        <BottomNavigation />
      </main>
    );
  }

  return (
    <main className="relative h-[100dvh] overflow-hidden bg-black text-white">
      <div className="absolute left-0 right-0 top-0 z-30 bg-gradient-to-b from-black/70 to-transparent px-5 pb-10 pt-[max(1.25rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Psyqus
            </p>

            <h1 className="text-lg font-semibold">
              Para ti
            </h1>
          </div>

          <Link
            href="/ia"
            className="flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs backdrop-blur-md"
          >
            <Brain className="h-4 w-4 text-cyan-300" />
            Hablar con Psyqus
          </Link>
        </div>
      </div>

      <section className="h-full snap-y snap-mandatory overflow-y-scroll">
        {shorts.map((short) => (
          <ShortCard
            key={short.id}
            short={short}
            muted={muted}
            setMuted={setMuted}
          />
        ))}
      </section>

      <BottomNavigation />
    </main>
  );
}

function ShortCard({
  short,
  muted,
  setMuted,
}: {
  short: ShortBienestar;
  muted: boolean;
  setMuted: (value: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    const video = videoRef.current;

    if (!element || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.7) {
          video.play().catch(() => {});
          setPlaying(true);
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      {
        threshold: [0.25, 0.7, 0.9],
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      video.pause();
    };
  }, []);

  function togglePlay() {
    const video = videoRef.current;

    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  return (
    <article
      ref={containerRef}
      className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-[#020617]"
    >
      <video
        ref={videoRef}
        src={short.video_url}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        onClick={togglePlay}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90" />

      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="Reproducir video"
          className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 backdrop-blur-md"
        >
          <Play className="ml-1 h-7 w-7 fill-white text-white" />
        </button>
      )}

      <div className="absolute bottom-28 left-0 right-0 z-20">
        <div className="mx-auto flex max-w-xl items-end gap-4 px-5">
          <div className="min-w-0 flex-1">
            {short.categoria && (
              <span className="mb-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium text-cyan-200 backdrop-blur-md">
                {short.categoria}
              </span>
            )}

            <h2 className="max-w-lg text-2xl font-semibold leading-tight tracking-tight">
              {short.titulo}
            </h2>

            {short.descripcion && (
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">
                {short.descripcion}
              </p>
            )}

            {short.cta_label && short.cta_href && (
              <Link
                href={short.cta_href}
                className="mt-5 inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition active:scale-95"
              >
                {short.cta_label}
              </Link>
            )}
          </div>

          <button
            onClick={() => setMuted(!muted)}
            aria-label={muted ? "Activar sonido" : "Silenciar"}
            className="mb-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur-md"
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

function BottomNavigation() {
  const items = [
    {
      href: "/shorts",
      label: "Shorts",
      icon: Play,
    },
    {
      href: "/psicoeducacion",
      label: "Aprender",
      icon: BookOpen,
    },
    {
      href: "/pulso",
      label: "Pulso",
      icon: Activity,
    },
    {
      href: "/encuesta",
      label: "Evaluar",
      icon: ClipboardList,
    },
    {
      href: "/buzon",
      label: "Ayuda",
      icon: HeartHandshake,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#020617]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-xl items-center justify-around px-2 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] transition ${
                item.href === "/shorts"
                  ? "text-cyan-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
