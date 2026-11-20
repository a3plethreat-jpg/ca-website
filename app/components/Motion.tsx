"use client";

import { useEffect } from "react";

/** Scroll-reveal ([data-reveal], via GSAP ScrollTrigger) + staff-card entrance ([data-staff]). */
export default function Motion() {
  useEffect(() => {
    const staff = Array.from(document.querySelectorAll<HTMLElement>("[data-staff]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "true";
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.25 },
    );
    staff.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.in = "false";
        io.observe(el);
      } else el.dataset.in = "true";
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    let ctx: { revert: () => void } | undefined;
    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        ScrollTrigger.batch("[data-reveal]", {
          start: "top 90%",
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { opacity: 0, y: 16 },
              {
                opacity: 1,
                y: 0,
                duration: 0.32,
                ease: "power2.out",
                delay: (i: number) => 0.06 * Math.min(i, 4),
                overwrite: true,
                clearProps: "transform",
              },
            ),
        });
        gsap.set("[data-reveal]", { opacity: 0, y: 16 });
        ScrollTrigger.refresh();
      });
    })();
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return null;
}
