"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { MerchReel, REEL, reelDuration } from "./MerchReel";

/** The animated merch frame in the /merch hero (Remotion Player, plays in the browser). */
export default function MerchHeroPlayer() {
  const player = useRef<PlayerRef>(null);
  const box = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      userPaused.current = true; // show a still frame; the visitor can still press play
      p.seekTo(40);
    }
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    p.addEventListener("play", onPlay);
    p.addEventListener("pause", onPause);

    // Only animate while the frame is on screen.
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userPaused.current) p.play();
      else if (!e.isIntersecting) p.pause();
    });
    if (box.current) io.observe(box.current);
    return () => {
      io.disconnect();
      p.removeEventListener("play", onPlay);
      p.removeEventListener("pause", onPause);
    };
  }, []);

  function toggle() {
    const p = player.current;
    if (!p) return;
    if (p.isPlaying()) {
      userPaused.current = true;
      p.pause();
    } else {
      userPaused.current = false;
      p.play();
    }
  }

  return (
    <div ref={box} className="relative aspect-square w-full border border-line bg-bg shadow-2xl shadow-black/60">
      <Player
        ref={player}
        component={MerchReel}
        durationInFrames={reelDuration}
        fps={REEL.fps}
        compositionWidth={REEL.width}
        compositionHeight={REEL.height}
        loop
        controls={false}
        clickToPlay={false}
        doubleClickToFullscreen={false}
        initiallyMuted
        style={{ width: "100%", height: "100%" }}
      />
      <span className="sr-only">
        Animated showcase of the camp tees: Coach A 3D Shirt, Built by Faith, Walk by Faith, and Play Hard Stay True.
      </span>
      <button
        type="button"
        onClick={toggle}
        className="display absolute bottom-3 right-3 z-10 bg-bg/80 px-3 py-1.5 text-sm tracking-[.14em] text-white backdrop-blur hover:bg-bg"
        aria-label={playing ? "Pause animation" : "Play animation"}
      >
        {playing ? "❚❚ Pause" : "▶ Play"}
      </button>
    </div>
  );
}
