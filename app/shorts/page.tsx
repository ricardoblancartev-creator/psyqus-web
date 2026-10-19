"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PsyqusNavigation from "@/components/PsyqusNavigation";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

type Short = {
  poster_url?: string;
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string | null;
  video_url: string;
  cta_label: string | null;
  cta_href: string | null;
  orden: number | null;
};

const SHORTS_LOCALES: Short[] = [
{"id": "psyqus-meditar-sin-mente-en-blanco", "titulo": "Meditar no es dejar la mente en blanco", "descripcion": "Meditar no significa dejar la mente en blanco. Distraerte puede ser parte de la práctica.", "categoria": "Meditación", "video_url": "/shorts/meditar-sin-mente-en-blanco.mp4", "poster_url": "/shorts/meditar-sin-mente-en-blanco.jpg", "cta_label": "Explorar herramientas", "cta_href": "/mindfulness", "orden": -89},
{"id": "psyqus-meditacion-y-estres", "titulo": "Cómo puede ayudar la meditación", "descripcion": "La meditación puede ayudar a algunas personas a manejar el estrés. Los resultados varían; no es una solución inmediata ni universal.", "categoria": "Meditación", "video_url": "/shorts/meditacion-y-estres.mp4", "poster_url": "/shorts/meditacion-y-estres.jpg", "cta_label": "Explorar herramientas", "cta_href": "/mindfulness", "orden": -88},
{"id": "psyqus-pausa-antes-de-responder", "titulo": "Una pausa antes de responder", "descripcion": "Antes de responder un mensaje difícil, si puedes y es seguro, date unos momentos para revisar qué necesitas.", "categoria": "Meditación", "video_url": "/shorts/pausa-antes-de-responder.mp4", "poster_url": "/shorts/pausa-antes-de-responder.jpg", "cta_label": "Explorar herramientas", "cta_href": "/mindfulness", "orden": -87},

{"id": "psyqus-estres-senales", "titulo": "Tu estrés puede avisar antes", "descripcion": "Hoy te cuesta concentrarte y hasta un mensaje pequeño te pesa.", "categoria": "Estrés", "video_url": "/shorts/estres-senales.mp4", "poster_url": "/shorts/estres-senales.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -20},
{"id": "psyqus-anticipar-saturacion", "titulo": "Antes de llegar al límite", "descripcion": "Te llega otro pendiente y dices que sí sin revisar lo que ya tienes.", "categoria": "Estrés", "video_url": "/shorts/anticipar-saturacion.mp4", "poster_url": "/shorts/anticipar-saturacion.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -19},
{"id": "psyqus-companeros-acuerdos", "titulo": "Llevarse bien también se acuerda", "descripcion": "Tu compañero entrega tarde y tú terminas corrigiendo todo.", "categoria": "Convivencia", "video_url": "/shorts/companeros-acuerdos.mp4", "poster_url": "/shorts/companeros-acuerdos.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -18},
{"id": "psyqus-chat-malentendidos", "titulo": "Un mensaje seco no cuenta todo", "descripcion": "Lees el mensaje y piensas: seguro está enojado conmigo.", "categoria": "Convivencia", "video_url": "/shorts/chat-malentendidos.mp4", "poster_url": "/shorts/chat-malentendidos.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -17},
{"id": "psyqus-pedir-con-asertividad", "titulo": "Pedir un cambio sin atacar", "descripcion": "La conversación se vuelve una pelea y lo que necesitas queda perdido.", "categoria": "Comunicación", "video_url": "/shorts/pedir-con-asertividad.mp4", "poster_url": "/shorts/pedir-con-asertividad.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -16},
{"id": "psyqus-poner-limites", "titulo": "Decir que no sin pelear", "descripcion": "Ya tienes dos entregas y te pasan una tercera.", "categoria": "Comunicación", "video_url": "/shorts/poner-limites.mp4", "poster_url": "/shorts/poner-limites.jpg", "cta_label": "Seguir aprendiendo", "cta_href": "/psicoeducacion", "orden": -15},
{"id": "psyqus-reconocer-violencia", "titulo": "No todo es una broma", "descripcion": "Se burlan de ti delante del equipo y después dicen que era jugando.", "categoria": "Buen trato", "video_url": "/shorts/reconocer-violencia.mp4", "poster_url": "/shorts/reconocer-violencia.jpg", "cta_label": "Pedir apoyo", "cta_href": "/buzon", "orden": -14},
{"id": "psyqus-acompanar-companero", "titulo": "Si un compañero te cuenta algo", "descripcion": "Alguien te cuenta que se siente intimidado por otra persona del trabajo.", "categoria": "Buen trato", "video_url": "/shorts/acompanar-companero.mp4", "poster_url": "/shorts/acompanar-companero.jpg", "cta_label": "Pedir apoyo", "cta_href": "/buzon", "orden": -13},

  {
    id: "psyqus-enfoque",
    titulo: "Un paso a la vez",
    descripcion: "Una pausa para elegir qué pendiente atender primero.",
    categoria: "Enfoque",
    video_url: "/shorts/enfoque.mp4",
    cta_label: "Recuperar concentración",
    cta_href: "/mindfulness",
    orden: 1,
  },
  {
    id: "psyqus-pausa",
    titulo: "Tu pausa empieza aquí",
    descripcion: "Suelta los hombros y tómate un momento a tu ritmo.",
    categoria: "Pausa",
    video_url: "/shorts/pausa.mp4",
    cta_label: "Hacer una pausa",
    cta_href: "/mindfulness",
    orden: 2,
  },
  {
    id: "psyqus-cierre",
    titulo: "Por hoy, cierra aquí",
    descripcion: "Deja anotado lo pendiente y el primer paso para mañana.",
    categoria: "Descanso",
    video_url: "/shorts/cierre.mp4",
    cta_label: "Explorar herramientas",
    cta_href: "/mindfulness",
    orden: 3,
  },
];

function internalHref(value: string | null) {
  return value &&
    /^\/(?!\/)/.test(value) &&
    !/[\\\u0000-\u001f]/.test(value)
    ? value
    : null;
}

export default function ShortsPage() {
  const feedRef = useRef<HTMLElement>(null);

  const [shorts, setShorts] = useState<Short[]>(SHORTS_LOCALES);
  const [muted, setMuted] = useState(true);
  const [categoria, setCategoria] = useState("Todos");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    async function cargar() {
      try {
        const result = await supabase
          .from("contenido_bienestar")
          .select(
            "id,titulo,descripcion,categoria,video_url,cta_label,cta_href,orden"
          )
          .eq("activo", true)
          .order("orden", { ascending: true })
          .abortSignal(controller.signal);

        if (!mounted || result.error) return;

        const catalogo = new Map<string, Short>();
        const localesPorArchivo = new Map(
          SHORTS_LOCALES.map((video) => [
            video.video_url
              .split("/")
              .pop()
              ?.replace(/\.mp4$/, ""),
            video,
          ])
        );

        SHORTS_LOCALES.forEach((video) => {
          catalogo.set(video.id, video);
        });

        ((result.data || []) as Short[]).forEach((video) => {
          if (!video.video_url) return;

          const archivo = video.video_url
            .split("?")[0]
            .split("/")
            .pop()
            ?.replace(/\.mp4$/, "");
          const local = archivo
            ? localesPorArchivo.get(archivo)
            : undefined;

          if (local) {
            catalogo.set(local.id, {
              ...local,
              ...video,
              // Supabase may still return the old URL without audio.
              video_url: local.video_url,
              poster_url: video.poster_url || local.poster_url,
            });
          } else {
            catalogo.set(video.id || video.video_url, video);
          }
        });

        setShorts(
          Array.from(catalogo.values()).sort(
            (a, b) => (a.orden ?? 999) - (b.orden ?? 999)
          )
        );
      } catch {
        // Los videos locales siguen disponibles.
      }
    }

    void cargar();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  const categorias = [
    "Todos",
    ...Array.from(
      new Set(
        shorts
          .map((short) => short.categoria)
          .filter(
            (value): value is string =>
              Boolean(value) && value !== "Todos"
          )
      )
    ),
  ];

  const visibles =
    categoria === "Todos"
      ? shorts
      : shorts.filter((short) => short.categoria === categoria);

  function mover(direction: number) {
    const feed = feedRef.current;
    if (!feed) return;

    const next = Math.max(
      0,
      Math.min(visibles.length - 1, activeIndex + direction)
    );

    feed.scrollTo({
      top: next * feed.clientHeight,
      behavior: "smooth",
    });
  }

  return (
    <main
      className="fixed inset-0 overflow-hidden bg-[#05070b] text-white"
      style={
        {
          "--feed-height":
            "calc(100dvh - 136px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
        } as CSSProperties
      }
    >
      <header
        className="flex items-center justify-between gap-3 px-4"
        style={{
          height: "calc(52px + env(safe-area-inset-top))",
          paddingTop: "env(safe-area-inset-top)",
        }}
      >
        <h1 className="text-lg font-bold tracking-tight">
          Psyqus <span className="text-cyan-300">Shorts</span>
        </h1>

        <select
          aria-label="Categoría"
          value={categoria}
          onChange={(event) => {
            setCategoria(event.target.value);
            setActiveIndex(0);
          }}
          className="max-w-[45%] rounded-full border border-white/15 bg-slate-900 px-3 py-1.5 text-xs"
        >
          {categorias.map((item) => (
            <option key={item} value={item}>
              {item === "Todos" ? "Para ti" : item}
            </option>
          ))}
        </select>
      </header>

      <section
        key={categoria}
        ref={feedRef}
        aria-label="Videos de bienestar"
        tabIndex={0}
        onScroll={(event) => {
          const feed = event.currentTarget;

          setActiveIndex(
            Math.round(
              feed.scrollTop / Math.max(1, feed.clientHeight)
            )
          );
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;

          if (
            event.key === "ArrowDown" ||
            event.key === "ArrowUp"
          ) {
            event.preventDefault();
            mover(event.key === "ArrowDown" ? 1 : -1);
          }
        }}
        className="snap-y snap-mandatory overflow-y-auto overscroll-y-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ height: "var(--feed-height)" }}
      >
        {visibles.map((short, index) => (
          <ShortCard
            key={short.video_url}
            short={short}
            active={index === activeIndex}
            muted={muted}
            setMuted={setMuted}
          />
        ))}
      </section>

      <div className="fixed right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:flex">
        <button
          type="button"
          aria-label="Short anterior"
          disabled={activeIndex === 0}
          onClick={() => mover(-1)}
          className="rounded-full bg-white/10 p-3 hover:bg-white/20 disabled:opacity-25"
        >
          <ChevronUp />
        </button>

        <button
          type="button"
          aria-label="Siguiente short"
          disabled={activeIndex >= visibles.length - 1}
          onClick={() => mover(1)}
          className="rounded-full bg-white/10 p-3 hover:bg-white/20 disabled:opacity-25"
        >
          <ChevronDown />
        </button>
      </div>

      <PsyqusNavigation />
    </main>
  );
}

function ShortCard({
  short,
  active,
  muted,
  setMuted,
}: {
  short: Short;
  active: boolean;
  muted: boolean;
  setMuted: (value: boolean) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const manualPause = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(0);

  const href = internalHref(short.cta_href);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function sync() {
      if (
        active &&
        !document.hidden &&
        !manualPause.current
      ) {
        void video!.play().catch(() => setPlaying(false));
      } else {
        video!.pause();
      }
    }

    if (!active) manualPause.current = false;

    sync();

    document.addEventListener("visibilitychange", sync);

    return () => {
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [active, attempt]);

  function togglePlay() {
    const video = videoRef.current;
    if (!video || !active) return;

    if (video.paused) {
      manualPause.current = false;
      void video.play().catch(() => setPlaying(false));
    } else {
      manualPause.current = true;
      video.pause();
    }
  }

  return (
    <article
      aria-label={short.titulo}
      className="grid w-full snap-start snap-always place-items-center"
      style={{
        height: "var(--feed-height)",
        minHeight: "var(--feed-height)",
      }}
    >
      <div
        className="relative h-full overflow-hidden bg-black"
        style={{
          width: "min(100%, calc(var(--feed-height) * 9 / 16))",
        }}
      >
        <video
          key={attempt}
          ref={videoRef}
          src={short.video_url} poster={short.poster_url || undefined}
          muted={muted}
          loop
          playsInline
          preload={active ? "auto" : "metadata"}
          aria-label={short.titulo}
          data-short-active={active ? "true" : "false"}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {
            setFailed(true);
            setPlaying(false);
          }}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;

            setProgress(
              video.duration > 0
                ? video.currentTime / video.duration
                : 0
            );
          }}
          className="absolute inset-0 h-full w-full object-contain"
        />

        <button
          type="button"
          onClick={togglePlay}
          tabIndex={active ? 0 : -1}
          aria-label={
            playing ? "Pausar video" : "Reproducir video"
          }
          className="absolute inset-0 flex items-center justify-center"
        >
          {!playing && !failed && (
            <span className="rounded-full bg-black/45 p-5">
              <Play className="h-8 w-8 fill-white" />
            </span>
          )}
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/85 to-transparent" />

        <div className="absolute bottom-24 right-3 flex flex-col gap-3">
          <button
            type="button"
            onClick={togglePlay}
            tabIndex={active ? 0 : -1}
            aria-label={playing ? "Pausar" : "Reproducir"}
            className="rounded-full bg-black/45 p-2.5"
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const nextMuted = !muted;
              setMuted(nextMuted);

              const activeVideo = document.querySelector<HTMLVideoElement>(
                "video[data-short-active=\"true\"]"
              );

              if (activeVideo) {
                activeVideo.volume = 1;
                activeVideo.muted = nextMuted;
                if (!nextMuted && activeVideo.paused) {
                  void activeVideo.play().catch(() => undefined);
                }
              }
            }}
            tabIndex={active ? 0 : -1}
            aria-label={
              muted ? "Activar sonido" : "Silenciar video"
            }
            className="rounded-full bg-black/45 p-2.5"
          >
            {muted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-3 px-4">
          <p className="text-xs font-semibold text-cyan-200">
            @psyqus
          </p>

          <h2 className="mt-1 truncate text-sm font-semibold">
            {short.titulo}
          </h2>

          {href && short.cta_label && (
            <Link
              href={href}
              tabIndex={active ? 0 : -1}
              className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs backdrop-blur"
            >
              <span className="truncate">
                {short.cta_label}
              </span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0" />
            </Link>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
          <div
            className="h-full bg-cyan-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {failed && (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 px-5 text-center"
          >
            <p className="text-sm">
              No se pudo reproducir este video.
            </p>

            <button
              type="button"
              onClick={() => {
                setFailed(false);
                setAttempt((value) => value + 1);
              }}
              className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-black"
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
