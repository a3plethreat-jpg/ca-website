"use client";

import { useEffect, useRef, useState } from "react";
import { hero } from "../lib/content";
import LiveScreen from "./LiveScreen";

const COURT_W = 1672;
const COURT_H = 941;

export default function Hero() {
  const courtRef = useRef<HTMLDivElement>(null);
  const [lens, setLens] = useState(false);

  // pointer "flashlight" lens over the court (fine pointers only)
  useEffect(() => {
    const el = courtRef.current;
    if (
      !el ||
      !matchMedia("(hover: hover) and (pointer: fine)").matches ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    setLens(true);
    let raf = 0, tx = -999, ty = -999, x = -999, y = -999, on = false;
    const step = () => {
      raf = 0;
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      el.style.setProperty("--lx", `${x.toFixed(1)}px`);
      el.style.setProperty("--ly", `${y.toFixed(1)}px`);
      if (Math.abs(tx - x) + Math.abs(ty - y) > 0.5) raf = requestAnimationFrame(step);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      if (!on) {
        on = true;
        x = tx;
        y = ty;
        el.dataset.lensOn = "true";
      }
      if (!raf) raf = requestAnimationFrame(step);
    };
    const leave = () => {
      on = false;
      el.dataset.lensOn = "false";
    };
    const host = el.parentElement!;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="home"
      aria-labelledby="hero-title"
      data-testid="mvp-court"
      style={{ ["--hero" as string]: 1 }}
      className="relative h-[100svh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">
        <div
          ref={courtRef}
          data-motion="showpiece"
          data-lens={lens ? "on" : "off"}
          data-lens-on="false"
          className="court-in group/court absolute left-1/2 top-14 -translate-x-1/2"
          style={{
            width: `max(100%, calc((100svh - 3.5rem) * ${COURT_W / COURT_H}))`,
            aspectRatio: `${COURT_W} / ${COURT_H}`,
            ["--court-w" as string]: `max(100vw, calc((100svh - 3.5rem) * ${COURT_W / COURT_H}))`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/court/home-court.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="absolute inset-0 h-full w-full select-none transition-[filter] duration-300 group-data-[lens=on]/court:brightness-[.8] group-data-[lens=on]/court:saturate-[.75]"
          />
          {lens && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/court/home-court.webp" alt="" aria-hidden draggable={false} className="lens-img pointer-events-none absolute inset-0 h-full w-full select-none" />
              <div aria-hidden className="lens-ring pointer-events-none absolute" />
            </>
          )}
          {/* light spill from the corner screen onto the court */}
          <div
            aria-hidden
            className="jumbo-spill pointer-events-none absolute"
            style={{ left: "58%", top: "4.2%", width: "42%", height: "62%" }}
          />
          <LiveScreen />
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,transparent_35%,rgba(8,10,12,.55)_100%)]" />

        <div className="pointer-events-none absolute inset-x-0 bottom-[16%] z-30 md:bottom-[20%]" style={{ opacity: "var(--hero)" }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 [&_a]:pointer-events-auto">
            <div className="max-w-2xl bg-gradient-to-r from-bg/80 via-bg/50 to-transparent p-4 sm:p-6 md:bg-none md:p-0">
              <p className="eyebrow rise">{hero.eyebrow}</p>
              <h1
                id="hero-title"
                data-motion="showpiece"
                className="display mt-2 text-[clamp(3rem,10vw,7.5rem)] drop-shadow-[0_4px_18px_rgba(0,0,0,.7)]"
              >
                {hero.headline.split(" ").map((w, i, a) => (
                  <span key={i}>
                    <span className="spring-word inline-block" style={{ animationDelay: `${120 + 90 * i}ms` }}>
                      {w}
                    </span>
                    {i < a.length - 1 ? " " : ""}
                  </span>
                ))}
              </h1>
              <div className="rule rise mt-4 w-40" style={{ animationDelay: "60ms" }} />
              <p className="display rise mt-4 text-[clamp(1.2rem,3vw,2rem)] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,.8)]" style={{ animationDelay: "60ms" }}>
                {hero.subhead}
              </p>
              <p className="rise mt-3 max-w-xl text-white/85 drop-shadow-[0_2px_8px_rgba(0,0,0,.9)]" style={{ animationDelay: "120ms" }}>
                {hero.description}
              </p>
              <div className="rise mt-6 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: "180ms" }}>
                <a href={hero.primary.href} className="btn btn-primary">{hero.primary.label}</a>
                <a href={hero.secondary.href} className="btn btn-ghost">{hero.secondary.label}</a>
              </div>
            </div>
          </div>
        </div>

        <div
          aria-hidden
          data-motion="showpiece"
          className="board-in absolute inset-x-0 bottom-0 z-20 flex h-[12%] min-h-[56px] items-center justify-center gap-[3vw] border-t border-white/15 bg-[linear-gradient(180deg,#0d0f12,#050607)] shadow-[0_-18px_40px_rgba(0,0,0,.6)] md:h-[15%]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-clean.png" alt="" className="hidden h-[58%] w-auto sm:block" />
          <span className="hidden h-[3px] w-[10vw] bg-brand-green sm:block" />
          <span className="display text-center text-[clamp(.9rem,2.6vw,2rem)] leading-none">
            Triple Threat
            <br />
            <span className="text-[.55em] tracking-[.3em] text-silver">Basketball Camp</span>
          </span>
          <span className="hidden h-[3px] w-[10vw] bg-brand-red sm:block" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-clean.png" alt="" className="hidden h-[58%] w-auto sm:block" />
        </div>
      </div>
    </section>
  );
}
