"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gallery, galleryCategories, trainingClips } from "../lib/content";

function TrainingClips() {
  const refs = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      refs.current.forEach((v) => v && (v.controls = true));
      return;
    }
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.35 },
    );
    refs.current.forEach((v) => v && io.observe(v));
    return () => io.disconnect();
  }, []);
  return (
    <div className="mt-8">
      <h3 className="display text-2xl sm:text-3xl">Training clips</h3>
      <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="training-clips">
        {trainingClips.map((c, i) => (
          <li key={c.src} className="panel overflow-hidden">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              ref={(el) => {
                refs.current[i] = el;
              }}
              src={c.src}
              poster={c.poster}
              muted
              loop
              playsInline
              preload="none"
              aria-label={`Training clip ${i + 1}`}
              className="aspect-video w-full bg-black object-cover"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Gallery() {
  const [cat, setCat] = useState("All");
  const [idx, setIdx] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const items = gallery.filter((g) => cat === "All" || g.category === cat);

  const close = useCallback(() => {
    dlg.current?.close();
    setIdx(null);
  }, []);

  useEffect(() => {
    if (idx !== null && dlg.current && !dlg.current.open) dlg.current.showModal();
  }, [idx]);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => (i === null ? i : (i + 1) % items.length));
      if (e.key === "ArrowLeft") setIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, items.length]);

  const cur = idx !== null ? items[idx] : null;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="relative min-h-screen py-24">
      <div className="absolute inset-0 bg-bg/80" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div data-reveal="true">
          <p className="eyebrow">Our album</p>
          <h2 id="gallery-title" className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">INSIDE THE ARENA.</h2>
          <p className="mt-3 max-w-2xl text-silver">
            Training clips and real moments from the NYBL Season 4 Invitational Cup in Baliwag, alongside concept renders of the CA Triple Threat court (labelled as such).
          </p>
        </div>

        <TrainingClips />

        <div role="tablist" aria-label="Gallery categories" className="mt-8 flex flex-wrap gap-2">
          {["All", ...galleryCategories].map((c) => {
            const n = c === "All" ? gallery.length : gallery.filter((g) => g.category === c).length;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`display min-h-11 border px-4 text-lg tracking-widest transition-colors ${
                  cat === c ? "border-brand-green bg-brand-green/20 text-white" : "border-line text-silver hover:text-white"
                }`}
              >
                {c}
                {n === 0 && <span className="ml-2 text-xs normal-case tracking-normal text-silver">soon</span>}
              </button>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="panel mt-8 p-8 text-silver">New {cat.toLowerCase()} photos and videos are coming soon.</p>
        ) : (
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((g, i) => (
              <li key={g.src}>
                <button
                  type="button"
                  onClick={() => setIdx(i)}
                  className="group relative block aspect-video w-full overflow-hidden border border-line"
                  aria-label={`Open image: ${g.alt}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={g.small}
                    alt={g.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-[50%_20%] transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 text-left text-sm text-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {g.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <dialog
        ref={dlg}
        onClose={() => setIdx(null)}
        onClick={(e) => e.target === dlg.current && close()}
        aria-label="Image viewer"
        className="m-auto max-h-[94vh] w-[min(96vw,1400px)] max-w-none border border-line bg-bg p-0 text-white backdrop:bg-black/90"
      >
        {cur && (
          <figure className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cur.src} alt={cur.alt} className="max-h-[78vh] w-full object-contain" />
            <figcaption className="p-4 text-sm text-silver">{cur.caption}</figcaption>
            <div className="absolute right-2 top-2 flex gap-2">
              <button type="button" onClick={close} autoFocus className="btn btn-ghost !min-h-11 !px-4">Close</button>
            </div>
            {items.length > 1 && (
              <div className="pointer-events-none absolute inset-y-0 flex w-full items-center justify-between px-2">
                <button type="button" aria-label="Previous image" onClick={() => setIdx(((idx as number) - 1 + items.length) % items.length)} className="btn btn-ghost pointer-events-auto !min-h-11 !px-4">‹</button>
                <button type="button" aria-label="Next image" onClick={() => setIdx(((idx as number) + 1) % items.length)} className="btn btn-ghost pointer-events-auto !min-h-11 !px-4">›</button>
              </div>
            )}
          </figure>
        )}
      </dialog>
    </section>
  );
}
