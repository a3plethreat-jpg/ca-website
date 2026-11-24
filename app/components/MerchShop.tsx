"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { merch, type MerchProduct, type MerchView } from "../lib/content";
import InquiryForm from "./InquiryForm";

type Line = (typeof merch.lines)[number];
type RequestItem = { key: string; product: string; color: string; size: string; qty: number };

function ProductCard({
  p,
  onAdd,
  onZoom,
}: {
  p: MerchProduct;
  onAdd: (item: Omit<RequestItem, "key">) => void;
  onZoom: (v: MerchView, title: string) => void;
}) {
  const [colorIdx, setColorIdx] = useState(0);
  const [viewIdx, setViewIdx] = useState(0);
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const color = p.colors[colorIdx];
  const view = color.views[Math.min(viewIdx, color.views.length - 1)];
  const title = `${p.name} — ${color.name}`;

  function add() {
    if (!size) return document.getElementById(`size-${p.id}`)?.focus();
    onAdd({ product: p.name, color: color.name, size, qty });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className="panel flex flex-col overflow-hidden" aria-labelledby={`t-${p.id}`}>
      <button
        type="button"
        onClick={() => onZoom(view, title)}
        className="group relative block aspect-[4/5] overflow-hidden bg-black/40"
        aria-label={`Enlarge ${title}, ${view.label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={view.src}
          src={view.src}
          alt={view.alt}
          loading="lazy"
          className="fx-in h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-brand)] group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span className="eyebrow absolute left-3 top-3 bg-bg/80 px-2 py-1 text-[.7rem]">{p.line}</span>
        <span aria-hidden className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center bg-bg/80 text-lg">⤢</span>
      </button>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <h3 id={`t-${p.id}`} className="display text-2xl tracking-[.04em]">{p.name}</h3>
          <p className="mt-1 text-sm text-silver">{p.blurb}</p>
          {p.verse && <p className="mt-1 text-xs tracking-[.12em] text-green-text uppercase">{p.verse}</p>}
        </div>

        {color.views.length > 1 && (
          <div role="group" aria-label="View" className="flex gap-2">
            {color.views.map((v, i) => (
              <button
                key={v.label}
                type="button"
                aria-pressed={view === v}
                onClick={() => setViewIdx(i)}
                className="border border-line px-3 py-1.5 text-xs tracking-[.12em] uppercase text-silver aria-pressed:border-white aria-pressed:text-white"
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <fieldset>
          <legend className="eyebrow text-xs">
            Color: <span className="text-white normal-case tracking-normal">{color.name}</span>
          </legend>
          <div className="mt-2 flex gap-2">
            {p.colors.map((c, i) => (
              <label key={c.name} className="cursor-pointer">
                <input
                  type="radio"
                  name={`color-${p.id}`}
                  className="peer sr-only"
                  checked={i === colorIdx}
                  onChange={() => {
                    setColorIdx(i);
                    setViewIdx(0);
                  }}
                />
                <span
                  className="block h-8 w-8 rounded-full border border-white/25 outline-offset-2 peer-checked:outline peer-checked:outline-2 peer-checked:outline-white peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-brand-green"
                  style={{ background: c.swatch }}
                />
                <span className="sr-only">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-auto grid grid-cols-[1fr_auto] gap-3">
          <div>
            <label htmlFor={`size-${p.id}`} className="eyebrow text-xs">Size</label>
            <select
              id={`size-${p.id}`}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full min-h-11 border border-line bg-black/35 px-3 text-white focus:border-brand-green"
            >
              <option value="">Choose…</option>
              {merch.sizes.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <span className="eyebrow text-xs" id={`qty-${p.id}`}>Qty</span>
            <div role="group" aria-labelledby={`qty-${p.id}`} className="mt-1 flex min-h-11 items-center border border-line">
              <button type="button" className="h-11 w-9" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <output aria-live="polite" className="w-6 text-center">{qty}</output>
              <button type="button" className="h-11 w-9" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
            </div>
          </div>
        </div>

        <button type="button" onClick={add} className="btn btn-primary w-full" aria-describedby={!size ? `hint-${p.id}` : undefined}>
          {added ? "Added ✓" : "Add to request"}
        </button>
        {!size && <p id={`hint-${p.id}`} className="-mt-2 text-xs text-silver">Choose a size first.</p>}
      </div>
    </article>
  );
}

export default function MerchShop() {
  const [line, setLine] = useState<Line | "All">("All");
  const [items, setItems] = useState<RequestItem[]>([]);
  const [zoom, setZoom] = useState<{ v: MerchView; title: string } | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (zoom) dialog.current?.showModal();
  }, [zoom]);

  const shown = merch.products.filter((p) => line === "All" || p.line === line);

  const message = useMemo(
    () =>
      items.length
        ? [
            "Merch order request:",
            ...items.map((i) => `- ${i.product} — ${i.color} — Size ${i.size} × ${i.qty}`),
            "",
            "Pickup or delivery preference: ",
          ].join("\n")
        : "",
    [items],
  );

  // Keep the order form's message in sync without remounting (which would clear typed details).
  useEffect(() => {
    const box = document.getElementById("f-message") as HTMLTextAreaElement | null;
    if (box && message) box.value = message;
  }, [message]);

  function add(item: Omit<RequestItem, "key">) {
    setItems((list) => {
      const key = `${item.product}|${item.color}|${item.size}`;
      const found = list.find((i) => i.key === key);
      if (found) return list.map((i) => (i.key === key ? { ...i, qty: Math.min(20, i.qty + item.qty) } : i));
      return [...list, { ...item, key }];
    });
  }

  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <section id="collection" aria-labelledby="collection-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-green-text">Camp apparel</p>
            <h2 id="collection-title" className="display mt-2 text-5xl sm:text-6xl">The collection</h2>
          </div>
          <div role="group" aria-label="Filter by line" className="flex flex-wrap gap-2">
            {(["All", ...merch.lines] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={line === l}
                onClick={() => setLine(l)}
                className="display border border-line px-4 py-2 tracking-[.12em] text-silver transition-colors hover:text-white aria-pressed:border-brand-green aria-pressed:bg-brand-green/15 aria-pressed:text-white"
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((p) => (
            <ProductCard key={p.id} p={p} onAdd={add} onZoom={(v, title) => setZoom({ v, title })} />
          ))}
        </div>
      </section>

      <section id="lookbook" aria-labelledby="lookbook-title" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <p className="eyebrow text-red-text">From the court</p>
        <h2 id="lookbook-title" className="display mt-2 text-5xl sm:text-6xl">Lookbook</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {merch.lookbook.map((l) => (
            <figure key={l.src} className={l.wide ? "md:col-span-2" : undefined}>
              <button type="button" className="block w-full overflow-hidden" onClick={() => setZoom({ v: { src: l.src, alt: l.alt, label: l.caption }, title: l.caption })} aria-label={`Enlarge: ${l.caption}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.src} alt={l.alt} loading="lazy" className="w-full object-cover transition-transform duration-500 hover:scale-[1.02] motion-reduce:transition-none" />
              </button>
              <figcaption className="mt-2 text-sm text-silver">{l.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="order" aria-labelledby="order-title" className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="eyebrow text-green-text">Order</p>
          <h2 id="order-title" className="display mt-2 text-5xl sm:text-6xl">Your request</h2>
          <p className="mt-4 text-silver">
            Add tees above, then send the request. The coaching team replies by email to confirm price, sizes and pickup at camp.
          </p>
          {items.length ? (
            <ul className="mt-6 divide-y divide-line border-y border-line" aria-label="Items in your request">
              {items.map((i) => (
                <li key={i.key} className="flex items-center justify-between gap-4 py-3">
                  <span>
                    <strong className="block">{i.product}</strong>
                    <span className="text-sm text-silver">{i.color} · Size {i.size} · ×{i.qty}</span>
                  </span>
                  <button type="button" className="text-sm text-red-text underline-offset-4 hover:underline" onClick={() => setItems((l) => l.filter((x) => x.key !== i.key))} aria-label={`Remove ${i.product}, ${i.color}, size ${i.size}`}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 border border-dashed border-line p-4 text-sm text-silver">No tees added yet. You can also just describe what you want in the message.</p>
          )}
        </div>
        <InquiryForm defaultType="Merch Order" label="Merch order request form" onSuccess={() => setItems([])} />
      </section>

      {count > 0 && (
        <a
          href="#order"
          className="btn btn-primary fixed bottom-5 left-1/2 z-40 -translate-x-1/2 shadow-lg shadow-black/50"
          aria-label={`Review your request: ${count} item${count > 1 ? "s" : ""}`}
        >
          Your request · {count}
        </a>
      )}

      <dialog
        ref={dialog}
        onClose={() => setZoom(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[92vh] max-w-[min(92vw,1100px)] bg-bg p-0 text-white backdrop:bg-black/85"
        aria-label={zoom?.title}
      >
        {zoom && (
          <figure>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoom.v.src} alt={zoom.v.alt} className="max-h-[80vh] w-auto object-contain" />
            <figcaption className="flex items-center justify-between gap-4 p-4">
              <span><strong>{zoom.title}</strong> <span className="text-silver">· {zoom.v.label}</span></span>
              <button type="button" className="btn btn-ghost" onClick={() => dialog.current?.close()} autoFocus>Close</button>
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
