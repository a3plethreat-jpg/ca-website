"use client";

import { useEffect, useRef } from "react";
import { scene, startSceneTracking, subscribe } from "../lib/scene";

/** Fixed full-screen arena backdrop; crossfades + parallaxes between arena stills as you scroll. */
const layers = [
  { id: "arena-front", scene: 0 },
  { id: "arena-angle", scene: 1 },
  { id: "arena-hoop", scene: 2 },
  { id: "arena-overhead", scene: 3 },
  { id: "arena-high", scene: 4 },
  { id: "arena-front", scene: 5 },
];

export default function Stage() {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stop = startSceneTracking();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const paint = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${scene.scroll})`;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const o = Math.max(0, 1 - Math.abs(scene.index - layers[i].scene));
        el.style.opacity = String(o);
        const k = reduce ? 0 : 8;
        el.style.transform = `scale(${1.06 + 0.04 * o}) translate3d(${-scene.pointer.x * k}px, ${-scene.pointer.y * k * 0.6}px, 0)`;
      });
    };
    paint();
    const off = subscribe(paint);
    return () => {
      off();
      stop();
    };
  }, []);

  return (
    <>
      <div
        ref={bar}
        aria-hidden
        className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-brand-green to-brand-red"
      />
      <div aria-hidden className="fixed inset-0 z-0 overflow-hidden bg-bg" data-testid="stage" data-mode="image">
        <div className="absolute inset-0">
          {layers.map((l, i) => (
            <div
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/gallery/${l.id}.webp`}
                alt=""
                decoding="async"
                loading={i === 0 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(8,10,12,.55)_100%)]" />
      </div>
    </>
  );
}
