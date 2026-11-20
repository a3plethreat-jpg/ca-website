"use client";

import { useEffect, useRef } from "react";
import { mindset, mindsetMvps } from "../lib/content";

const steps = [...mindset.principles, mindset.finale];
const dash = (a: number, b: number) =>
  `clamp(0, calc(1 - (var(--p) - ${a}) / ${(b - a).toFixed(2)}), 1)`;

const CA_PATH =
  "M503.5 670.1 C509.6 667.2 518.4 663.1 522.8 660.8 C527.3 658.6 533.8 655.6 537.2 654.1 L543.4 651.5 L615.6 651.1 L687.8 650.7 L689.5 648.5 C690.4 647.3 694.0 641.0 697.5 634.4 C700.9 627.9 704.3 622.1 704.8 621.5 C706.6 619.7 708.6 621.6 717.4 633.6 C722.0 639.9 727.0 646.4 728.5 648.0 L731.4 650.9 L763.1 651.5 C804.8 652.3 819.6 651.9 819.9 650.3 C820.0 649.6 818.4 646.8 816.2 643.9 C800.0 622.2 776.9 591.6 772.0 585.3 C768.8 581.1 762.4 572.8 757.9 566.8 C753.3 560.9 745.7 550.9 740.9 544.7 C729.8 530.2 697.7 487.2 675.3 456.8 C669.9 449.5 662.0 438.8 657.8 433.1 C653.6 427.4 646.9 418.2 642.8 412.7 C632.3 398.3 630.6 396.8 617.8 392.3 C606.9 388.3 599.0 387.5 591.1 389.3 C567.0 394.8 568.8 393.6 553.8 413.3 C527.7 447.5 510.8 469.6 502.9 479.7 C498.4 485.4 492.0 493.8 488.7 498.2 C485.3 502.6 479.9 509.4 476.7 513.4 C473.4 517.4 467.3 525.3 463.0 531.1 C446.7 553.0 424.0 582.5 422.4 583.9 C420.1 585.9 319.4 586.0 311.5 584.0 C277.1 575.3 256.4 545.9 261.6 513.3 C265.5 489.4 277.4 473.0 297.9 463.2 C312.2 456.4 307.4 456.8 394.8 456.6 C444.1 456.4 472.6 456.1 473.1 455.6 C473.8 454.8 481.0 445.8 494.3 428.8 C519.5 396.7 533.8 379.3 539.2 373.9 C546.7 366.5 547.5 364.2 541.4 367.3 C540.1 368.0 536.2 369.6 532.6 370.9 C529.1 372.2 519.7 376.2 511.6 379.7 C503.6 383.3 493.3 387.6 488.9 389.2 L480.8 392.2 L393.3 392.6 C297.5 393.1 302.8 392.9 284.9 398.1 C252.1 407.5 225.0 426.4 207.1 452.1 C187.8 480.0 180.0 513.7 185.5 545.5 C192.8 588.2 226.4 626.6 270.0 642.1 C295.1 651.0 289.8 650.6 382.5 650.9 C476.1 651.2 465.0 652.5 473.6 640.6 C476.5 636.4 482.6 628.0 487.1 621.7 C491.6 615.5 499.2 605.1 504.1 598.6 C509.0 592.1 527.6 567.2 545.5 543.3 C591.7 481.6 593.7 479.0 595.1 478.2 C596.6 477.3 598.2 479.1 606.7 490.9 C612.8 499.5 625.6 516.9 632.9 526.6 C635.4 529.8 639.7 535.6 642.5 539.4 C653.0 553.8 660.3 563.5 667.0 572.3 C674.5 582.1 674.5 582.2 672.7 584.0 C671.5 585.1 665.3 585.3 615.6 585.3 C579.7 585.3 559.3 585.6 558.3 586.1 C557.5 586.5 555.1 589.2 552.9 591.9 C550.8 594.7 544.4 602.7 538.6 609.8 C506.8 648.6 489.7 672.0 491.3 674.4 C491.9 675.5 490.9 675.8 503.5 670.1 Z";

/** Pinned scroll-driven section: principles swap as you scroll while the CA crest draws itself. */
export default function Mindset() {
  const root = useRef<HTMLElement>(null);
  const texts = useRef<(HTMLDivElement | null)[]>([]);
  const photos = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    let cur = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      el.style.setProperty("--p", p.toFixed(4));
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length));
      if (idx !== cur) {
        texts.current[cur]?.setAttribute("data-active", "false");
        texts.current[idx]?.setAttribute("data-active", "true");
        photos.current[cur]?.setAttribute("data-active", "false");
        photos.current[idx]?.setAttribute("data-active", "true");
        cur = idx;
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section id="mindset" ref={root} style={{ ["--p" as string]: 0 }} aria-labelledby="mindset-title" className="relative h-[620vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bg/85 via-bg/45 to-bg/10" aria-hidden />
        <div
          className="pointer-events-none absolute bottom-0 right-0 z-[1] h-[52svh] w-[70vw] opacity-60 sm:opacity-100 md:right-[6%] md:h-[82svh] md:w-[42vw]"
          data-testid="mindset-mvps"
        >
          {mindsetMvps.map((m, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={m.photo}
              ref={(el) => {
                photos.current[i] = el;
              }}
              data-active={i === 0}
              src={m.photo}
              alt={m.alt}
              loading="lazy"
              className="absolute bottom-0 right-0 h-full w-auto max-w-none translate-x-10 opacity-0 drop-shadow-[0_18px_30px_rgba(0,0,0,.75)] transition-[opacity,transform] duration-200 ease-[var(--ease-exit)] data-[active=true]:translate-x-0 data-[active=true]:opacity-100 data-[active=true]:duration-300 data-[active=true]:ease-[var(--ease-enter)] motion-reduce:translate-x-0"
            />
          ))}
        </div>

        <svg aria-hidden viewBox="0 0 1000 1000" className="absolute bottom-4 right-2 h-[40%] opacity-50 sm:right-8 sm:h-[46%]" fill="none">
          <defs>
            <linearGradient id="ca-stroke" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#008B22" />
              <stop offset=".5" stopColor="#ffffff" />
              <stop offset="1" stopColor="#E71920" />
            </linearGradient>
          </defs>
          <path d="M500 60 A440 440 0 0 0 500 940" pathLength={1} strokeDasharray="1" stroke="#008B22" strokeWidth="10" strokeLinecap="round" style={{ strokeDashoffset: dash(0.02, 0.32), transition: "stroke-dashoffset 160ms var(--ease-standard)" }} />
          <path d="M500 60 A440 440 0 0 1 500 940" pathLength={1} strokeDasharray="1" stroke="#E71920" strokeWidth="10" strokeLinecap="round" style={{ strokeDashoffset: dash(0.12, 0.42), transition: "stroke-dashoffset 160ms var(--ease-standard)" }} />
          <path
            d={CA_PATH}
            pathLength={1}
            strokeDasharray="1"
            stroke="url(#ca-stroke)"
            strokeWidth="6"
            strokeLinejoin="round"
            fill="#ffffff"
            style={{
              strokeDashoffset: dash(0.3, 0.82),
              fillOpacity: "clamp(0, calc((var(--p) - 0.84) * 7), 1)",
              transition: "stroke-dashoffset 160ms var(--ease-standard), fill-opacity 200ms var(--ease-enter)",
            }}
          />
        </svg>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6">
          <p className="eyebrow">Coach A mindset</p>
          <h2 id="mindset-title" className="display mt-2 text-[clamp(1.6rem,4vw,2.6rem)] text-silver">{mindset.heading}</h2>
          <p className="display mt-1 text-xl text-green-text">{mindset.support}</p>
          <div className="relative mt-8 min-h-[44vh]">
            {steps.map((s, i) => (
              <div
                key={s}
                ref={(el) => {
                  texts.current[i] = el;
                }}
                data-active={i === 0}
                className="absolute inset-x-0 top-0 translate-y-4 opacity-0 transition-[opacity,transform] duration-200 ease-[var(--ease-exit)] data-[active=true]:translate-y-0 data-[active=true]:opacity-100 data-[active=true]:duration-300 data-[active=true]:ease-[var(--ease-enter)] motion-reduce:translate-y-0"
              >
                <p className="eyebrow">
                  {i < mindset.principles.length ? `Principle 0${i + 1} / 0${mindset.principles.length}` : "The standard"}
                </p>
                <p className="display mt-3 max-w-4xl text-[clamp(2.6rem,9vw,7.5rem)]">{s}</p>
                <div className={`mt-5 h-[3px] w-28 ${i % 2 ? "bg-brand-red" : "bg-brand-green"}`} />
              </div>
            ))}
          </div>
          <p className="mt-10 max-w-md text-xs text-silver/70">{mindset.note}</p>
        </div>
      </div>
    </section>
  );
}
