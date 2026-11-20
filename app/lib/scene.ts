import { sectionIds } from "./content";

export const scene = { index: 0, scroll: 0, pointer: { x: 0, y: 0 }, explore: false };

const listeners = new Set<() => void>();
export const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
const emit = () => listeners.forEach((fn) => fn());

/** Tracks scroll position across the page sections + pointer; call once from a client effect. */
export function startSceneTracking() {
  let raf = 0;
  const compute = () => {
    raf = 0;
    const vh = window.innerHeight;
    const mid = window.scrollY + vh * 0.5;
    const centers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY + Math.min(r.height / 2, vh / 2);
    });
    let idx = 0;
    for (let i = 0; i < centers.length - 1; i++) {
      const a = centers[i];
      const b = centers[i + 1];
      if (a != null && b != null && mid >= a) idx = i + Math.min(1, (mid - a) / Math.max(1, b - a));
    }
    scene.index = idx;
    const max = document.documentElement.scrollHeight - vh;
    scene.scroll = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    emit();
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(compute);
  };
  const onPointer = (e: PointerEvent) => {
    scene.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    scene.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    emit();
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pointermove", onPointer, { passive: true });
  window.addEventListener("load", schedule);
  schedule();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    window.removeEventListener("pointermove", onPointer);
    window.removeEventListener("load", schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}
