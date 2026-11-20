"use client";

import { useId, useState } from "react";
import type { Coach } from "../lib/content";

export default function CoachProfile({ c }: { c: Coach }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rows: [string, string][] = [];
  if (c.background) rows.push(["Background", c.background]);
  if (c.certifications?.length) rows.push(["Certifications", c.certifications.join(", ")]);
  if (c.teams?.length) rows.push(["Teams coached", c.teams.join(", ")]);
  if (c.philosophy) rows.push(["Philosophy", c.philosophy]);
  const awards = c.awards ?? [];
  if (!rows.length && !awards.length && !c.awardPhoto) return null;

  const item = (i: number) => ({
    className:
      "transition-[opacity,transform] duration-[260ms] ease-[var(--ease-enter)] motion-reduce:translate-y-0 " +
      (open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"),
    style: { transitionDelay: open ? `${40 + 50 * Math.min(i, 4)}ms` : "0ms" },
  });

  return (
    <div className="mt-5 border-t border-line pt-4">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="display group inline-flex min-h-11 items-center gap-3 text-lg tracking-widest text-green-text"
      >
        {open ? "Hide profile" : "View profile"}
        <span
          aria-hidden
          className={`grid h-7 w-7 place-items-center rounded-full border border-green-text/60 transition-transform duration-300 ease-[var(--ease-standard)] ${
            open ? "rotate-45 bg-brand-green/20" : "group-hover:rotate-90"
          }`}
        >
          +
        </span>
      </button>
      <div
        id={id}
        data-open={open}
        role="region"
        aria-label={`${c.name} profile details`}
        inert={!open}
        className={`grid transition-[grid-template-rows,visibility] duration-[320ms] ease-[var(--ease-standard)] motion-reduce:transition-none ${
          open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`mt-4 grid gap-6 ${c.awardPhoto ? "lg:grid-cols-[1fr_minmax(0,260px)]" : ""}`}>
            <div className="space-y-4 text-silver">
              {rows.map(([k, v], i) => (
                <p key={k} {...item(i)}>
                  <strong className="text-white">{k}: </strong>
                  {v}
                </p>
              ))}
              {awards.length > 0 && (
                <ul {...item(rows.length)} className={`space-y-2 ${item(rows.length).className}`}>
                  {awards.map((a) => (
                    <li key={a.title} className="flex gap-3">
                      <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${a.title === "Champion" ? "bg-brand-red" : "bg-brand-green"}`} />
                      <span>
                        <strong className="text-white">{a.title}</strong> — {a.event}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {c.awardPhoto && (
              <figure
                className={`relative mx-auto w-full max-w-[260px] transition-[opacity,transform] duration-[300ms] ease-[cubic-bezier(.34,1.3,.64,1)] motion-reduce:transform-none ${
                  open ? "translate-x-0 rotate-0 opacity-100" : "translate-x-6 rotate-3 opacity-0"
                }`}
                style={{ transitionDelay: open ? "160ms" : "0ms" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.awardPhoto}
                  alt={`${c.name} holding the Best Coach trophy and wearing a champion's medal`}
                  loading="lazy"
                  width={640}
                  height={851}
                  className="aspect-[3/4] w-full border border-white/15 object-cover object-top shadow-[0_18px_40px_-16px_rgba(0,0,0,.8)]"
                />
                {awards[0] && (
                  <figcaption
                    className={`display absolute -left-3 top-4 bg-brand-green px-3 py-1 text-sm tracking-widest text-white shadow-lg transition-[opacity,transform] duration-[200ms] ease-[cubic-bezier(.34,1.56,.64,1)] motion-reduce:transform-none ${
                      open ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    }`}
                    style={{ transitionDelay: open ? "300ms" : "0ms" }}
                  >
                    ★ {awards[0].title}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
