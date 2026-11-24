"use client";

import { useRef, useState } from "react";
import { contact, NO_AGE } from "../lib/content";
import { inquirySchema } from "../lib/inquiry";

const field =
  "w-full min-h-12 border border-line transition-colors duration-[120ms] bg-black/35 px-4 py-3 text-white placeholder:text-silver/60 focus:border-brand-green";

type Status = "idle" | "sending" | "success" | "error";

type Props = {
  /** Preselects the inquiry type (e.g. "Merch Order"). */
  defaultType?: (typeof contact.inquiryTypes)[number];
  /** Prefills the message box. Change `key` on the form to apply a new value. */
  defaultMessage?: string;
  label?: string;
  /** Called after the inquiry was accepted by the server. */
  onSuccess?: () => void;
};

export default function InquiryForm({ defaultType, defaultMessage, label = "Camp inquiry form", onSuccess }: Props = {}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [banner, setBanner] = useState("");
  const [age, setAge] = useState("");
  const busy = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy.current || status === "sending") return;
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      inquiryType: String(fd.get("inquiryType") ?? ""),
      ageGroup: String(fd.get("ageGroup") ?? ""),
      guardian: fd.get("guardian") === "on",
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    };
    const parsed = inquirySchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) errs[String(issue.path[0])] ??= issue.message;
      setErrors(errs);
      setBanner("Please fix the highlighted fields.");
      setStatus("error");
      document.getElementById(`f-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setBanner("");
    setStatus("sending");
    busy.current = true;
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        onSuccess?.();
        return void setStatus("success");
      }
      if (data.fields) setErrors(data.fields);
      setBanner(data.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setBanner("We couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    } finally {
      busy.current = false;
    }
  }

  if (status === "success")
    return (
      <div role="status" className="panel fx-panel p-8" data-testid="form-success">
        <span aria-hidden className="rule fx-draw block w-16" />
        <h3 className="display mt-4 text-4xl">Message sent.</h3>
        <p className="mt-3 text-silver">Thank you — the coaching team has your inquiry and will reply by email.</p>
        <button type="button" className="btn btn-ghost mt-6" onClick={() => setStatus("idle")}>Send another</button>
      </div>
    );

  const err = (k: string) =>
    errors[k] ? (
      <p id={`e-${k}`} className="fx-in mt-1 text-sm text-red-text">{errors[k]}</p>
    ) : null;
  const aria = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `e-${k}` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="panel space-y-5 p-6 sm:p-8" aria-label={label}>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="f-name" className="eyebrow">Full name *</label>
          <input id="f-name" name="name" autoComplete="name" required className={`${field} mt-2`} {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor="f-email" className="eyebrow">Email address *</label>
          <input id="f-email" name="email" type="email" autoComplete="email" required className={`${field} mt-2`} {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="f-phone" className="eyebrow">Mobile number (optional)</label>
          <input id="f-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" className={`${field} mt-2`} {...aria("phone")} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor="f-inquiryType" className="eyebrow">Inquiry type *</label>
          <select id="f-inquiryType" name="inquiryType" required defaultValue={defaultType ?? ""} className={`${field} mt-2`} {...aria("inquiryType")}>
            <option value="" disabled>Select…</option>
            {contact.inquiryTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          {err("inquiryType")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="f-ageGroup" className="eyebrow">Player age group (if relevant)</label>
          <select id="f-ageGroup" name="ageGroup" value={age} onChange={(e) => setAge(e.target.value)} className={`${field} mt-2`}>
            <option value="">Not specified</option>
            {contact.ageGroups.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {!!age && age !== NO_AGE && (
        <div className="border border-brand-green/60 bg-brand-green/10 p-4">
          <p className="text-sm text-silver">{contact.guardianNote}</p>
          <label className="mt-3 flex items-start gap-3">
            <input id="f-guardian" type="checkbox" name="guardian" className="mt-1 h-5 w-5 accent-[#008B22]" {...aria("guardian")} />
            <span>I am the parent or guardian and this is my contact information.</span>
          </label>
          {err("guardian")}
        </div>
      )}

      <div>
        <label htmlFor="f-message" className="eyebrow">Message *</label>
        <textarea id="f-message" name="message" rows={5} required defaultValue={defaultMessage} className={`${field} mt-2`} {...aria("message")} />
        {err("message")}
      </div>

      <div aria-live="polite">
        {status === "error" && banner && (
          <p role="alert" className="fx-in border border-brand-red/70 bg-brand-red/10 p-4 text-red-text" data-testid="form-error">{banner}</p>
        )}
      </div>

      <button type="submit" disabled={status === "sending"} className="btn btn-primary w-full disabled:cursor-wait disabled:opacity-60 sm:w-auto">
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </button>
      {status === "sending" && <div aria-hidden className="fx-pulse h-[3px] w-full bg-gradient-to-r from-brand-green to-brand-red" />}
    </form>
  );
}
