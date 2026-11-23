"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { gameDay, liveScreen } from "../lib/content";

/** Only allow embeds from known live-stream hosts; force muted autoplay. */
function safeEmbed(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    const ok = ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "www.facebook.com", "web.facebook.com"];
    if (u.protocol !== "https:" || !ok.includes(u.hostname)) return null;
    if (u.hostname.includes("youtube")) {
      u.searchParams.set("autoplay", "1");
      u.searchParams.set("mute", "1");
      u.searchParams.set("playsinline", "1");
    }
    if (u.hostname.includes("facebook")) {
      // A normal video/watch/share link can't be framed; wrap it in Facebook's embed player.
      const player = u.pathname.startsWith("/plugins/video.php")
        ? u
        : new URL(`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.toString())}`);
      player.searchParams.set("show_text", "false");
      player.searchParams.set("autoplay", "true");
      player.searchParams.set("mute", "true");
      return player.toString();
    }
    return u.toString();
  } catch {
    return null;
  }
}

const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

function Expanded({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Expanded video"
      data-testid="expanded-player"
      className="fixed inset-0 z-[200] grid place-items-center bg-black/80 p-4 backdrop-blur-sm fx-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-[min(92vw,1100px)]">
        <div className="aspect-video w-full overflow-hidden rounded-sm bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)] ring-1 ring-white/15">
          {children}
        </div>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          data-testid="expanded-close"
          className="display absolute -top-11 right-0 flex items-center gap-2 rounded-sm bg-black/70 px-3 py-1.5 tracking-widest text-white ring-1 ring-white/30 hover:bg-brand-red"
        >
          ✕ Close
        </button>
      </div>
    </div>,
    document.body,
  );
}

export default function LiveScreen() {
  const embed = liveScreen.streamUrl ? safeEmbed(liveScreen.streamUrl) : null;
  const [clipIdx, setClipIdx] = useState(0);
  const clip = liveScreen.clips[clipIdx];
  const many = liveScreen.clips.length > 1;
  const switched = useRef(false); // true once a clip has ended and the next one is loading
  const nextClip = () => { switched.current = true; setClipIdx((i) => (i + 1) % liveScreen.clips.length); };
  const videoRef = useRef<HTMLVideoElement>(null);
  const bigRef = useRef<HTMLVideoElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => setReduced(matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // play only while on screen + tab visible
  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduced) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden && !expanded) v.play().catch(() => {});
      else v.pause();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    }, { threshold: 0.05 });
    io.observe(v);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced, expanded]);

  useEffect(() => {
    if (!expanded) return;
    const big = bigRef.current;
    const v = videoRef.current;
    if (big && v) {
      big.currentTime = v.currentTime;
      big.play().catch(() => {
        big.muted = true;
        big.play().catch(() => {});
      });
    }
  }, [expanded]);

  const close = () => {
    const big = bigRef.current;
    const v = videoRef.current;
    if (big && v) v.currentTime = big.currentTime;
    setExpanded(false);
  };

  const onExpand = () => {
    if (embed || !isMobile()) return setExpanded(true);
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      v.requestFullscreen?.().catch(() => (v.muted = true));
    }
  };

  // Game day: today's matchups lead the ticker and the next one shows as "UP NEXT" (Philippine time, client only).
  const [today, setToday] = useState<{ on: boolean; next?: (typeof gameDay.games)[number] }>({ on: false });
  useEffect(() => {
    const tick = () => {
      const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const ymd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setToday({
        on: ymd === gameDay.date,
        next: gameDay.delayed ? gameDay.games.find((g) => !g.done) : gameDay.games.find((g) => g.time > hm),
      });
    };
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);
  const schedule = today.on
    ? `${gameDay.games.filter((g) => g.playing).map((g) => `NOW PLAYING: ${g.division} CA TRIPLE THREAT VS ${g.opponent} · `).join("")}` +
      `TODAY · ${gameDay.event} · ${gameDay.venue} · ${gameDay.delayed ? "SCHEDULE RUNNING LATE · " : ""}` +
      gameDay.games.map((g) => `${g.label} ${g.division}: CA TRIPLE THREAT VS ${g.opponent}`).join("  ·  ") + "  ·  "
    : "";
  const ticker = `${schedule}${liveScreen.ticker}  ·  `;

  return (
    <div
      className="live-screen absolute"
      data-testid="live-screen"
      data-motion="showpiece"
    >
      {/* rig cables up to the rafters */}
      <span aria-hidden className="live-cable left-[14%]" />
      <span aria-hidden className="live-cable right-[14%]" />

      <div className="live-frame relative aspect-video w-full">
        {embed ? (
          <iframe
            src={embed}
            title="Live stream"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 h-full w-full border-0 bg-black"
            data-testid="live-embed"
          />
        ) : (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            src={clip.src}
            poster={clip.poster}
            muted
            loop={!many}
            onEnded={many ? nextClip : undefined}
            onLoadedData={(e) => { if (switched.current && !reduced && !expanded) e.currentTarget.play().catch(() => {}); }}
            playsInline
            preload="auto"
            controls={reduced}
            aria-label="Camp game highlight"
            data-testid="live-video"
            className="jumbo-video absolute inset-0 h-full w-full bg-black object-cover"
          />
        )}

        {/* broadcast chrome */}
        <span aria-hidden className="jumbo-led pointer-events-none absolute inset-0" />
        <span aria-hidden className="jumbo-glare pointer-events-none absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute inset-0 text-[clamp(.55rem,.85vw,.8rem)]">
          <span className="display absolute left-[3%] top-[5%] flex items-center gap-[.5em] rounded-[.2em] bg-brand-red px-[.7em] py-[.2em] tracking-widest text-white shadow-[0_0_14px_rgba(231,25,32,.7)]">
            <span className="h-[.6em] w-[.6em] animate-pulse rounded-full bg-white" />
            {/* the embedded broadcast is live on game day; afterwards it is a recording */}
            {embed && (liveScreen.streamIsLive || today.on) ? liveScreen.badgeLive : liveScreen.badgeReplay}
          </span>
          {today.on && today.next && (
            <span data-testid="up-next" className="display absolute left-[3%] top-[17%] rounded-[.2em] bg-black/70 px-[.7em] py-[.2em] tracking-widest text-white ring-1 ring-brand-green/60">
              {today.next.playing
                ? `NOW PLAYING · ${today.next.division} · CA TRIPLE THREAT VS ${today.next.opponent}`
                : `UP NEXT · ${gameDay.delayed ? "DELAYED" : today.next.label} · ${today.next.division} VS ${today.next.opponent}`}
            </span>
          )}
          <span className="display absolute right-[3%] top-[5%] flex items-center gap-[.5em] rounded-[.2em] bg-black/65 px-[.7em] py-[.2em] tracking-[.18em] text-white ring-1 ring-white/25">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-clean.png" alt="" className="h-[1.5em] w-[1.5em] rounded-full" />
            {liveScreen.channel}
          </span>
          <div className="absolute inset-x-0 bottom-0 overflow-hidden bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-[6%]">
            <div className="live-ticker display flex w-max whitespace-nowrap py-[.35em] tracking-[.14em] text-white/95">
              <span className="px-[.5em]">{ticker}</span>
              <span className="px-[.5em]">{ticker}</span>
            </div>
            <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[linear-gradient(90deg,#008B22_0_50%,#E71920_50%_100%)]" />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onExpand}
        data-testid="live-expand"
        aria-label="Expand live screen"
        className="display absolute right-0 top-[calc(100%+8px)] z-20 flex items-center gap-1.5 rounded-sm bg-black/70 px-2 py-1 text-[clamp(.6rem,.9vw,.85rem)] tracking-widest text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-brand-red focus-visible:bg-brand-red"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-[1.2em] w-[1.2em]" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
        Expand
      </button>

      {expanded && (
        <Expanded onClose={close}>
          {embed ? (
            <iframe
              src={embed.replace(/([?&])mute=(1|true)/, "$1mute=0")}
              title="Live stream (expanded)"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              className="h-full w-full border-0"
            />
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video ref={bigRef} src={clip.src} controls playsInline loop data-testid="expanded-video" className="h-full w-full bg-black object-contain" />
          )}
        </Expanded>
      )}
    </div>
  );
}
