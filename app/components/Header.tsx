"use client";

import { useEffect, useState } from "react";
import { nav, site, sectionIds } from "../lib/content";
import { scene, subscribe } from "../lib/scene";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > 40);
      setActive(Math.min(sectionIds.length - 1, Math.floor(scene.index + 0.1)));
    };
    update();
    return subscribe(update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled || open ? "bg-bg/90 md:bg-bg/85 md:backdrop-blur-md border-b border-line" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="flex items-center gap-3" aria-label={`${site.name} — home`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-clean.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
          <span className="display hidden text-lg tracking-[.08em] sm:block">Triple Threat</span>
        </a>
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((n, i) => {
              const on = sectionIds[active] === n.href.slice(1);
              return (
                <li key={n.href}>
                  <a
                    href={n.href}
                    aria-current={on ? "true" : undefined}
                    className={`display text-[1.05rem] tracking-[.12em] transition-colors hover:text-white ${
                      on ? "text-white" : "text-silver"
                    }`}
                  >
                    {n.label}
                    <span
                      className={`mt-1 block h-[2px] origin-left transition-transform ${
                        i % 2 ? "bg-brand-red" : "bg-brand-green"
                      } ${on ? "scale-x-100" : "scale-x-0"}`}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
        <button
          type="button"
          className="lg:hidden grid h-12 w-12 place-items-center"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden className="relative block h-4 w-6">
            <span className={`absolute left-0 top-0 h-[2px] w-6 bg-white transition-transform duration-200 ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`absolute left-0 top-2 h-[2px] w-6 bg-white transition-opacity ${open ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 top-4 h-[2px] w-6 bg-white transition-transform duration-200 ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
      <nav
        id="mobile-nav"
        aria-label="Mobile"
        data-open={open}
        className="lg:hidden grid border-t border-line bg-bg/95 px-4 transition-[grid-template-rows,opacity,visibility] duration-200 ease-[var(--ease-exit)] grid-rows-[0fr] opacity-0 invisible data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 data-[open=true]:visible data-[open=true]:ease-[var(--ease-enter)] motion-reduce:transition-none"
      >
        <ul className="min-h-0 overflow-hidden pb-2">
          {nav.map((n) => (
            <li key={n.href}>
              <a
                href={n.href}
                onClick={() => setOpen(false)}
                className="display block border-b border-line py-4 text-2xl tracking-[.08em]"
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
