import { NextResponse } from "next/server";
import { site } from "../../lib/content";
import { inquirySchema } from "../../lib/inquiry";
import { mailProvider, sendMail } from "../../lib/mailer";

export const runtime = "nodejs";

/**
 * Staff routing by inquiry type. INQUIRY_ROUTES is a JSON object mapping an inquiry type
 * to one or more comma-separated emails, e.g.
 * {"Basketball Camp":"coach@x.com","Partnership":"a@x.com,b@x.com"}.
 * Unmapped types (or invalid config) fall back to INQUIRY_TO_EMAIL.
 */
function routeFor(type: string, fallback: string): string[] {
  try {
    const routes = JSON.parse(process.env.INQUIRY_ROUTES || "{}") as Record<string, unknown>;
    const raw = routes[type];
    if (typeof raw === "string") {
      const list = raw.split(",").map((e) => e.trim()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
      if (list.length) return list;
    }
  } catch {
    console.warn("[inquiry] INQUIRY_ROUTES is not valid JSON; using default recipient");
  }
  return [fallback];
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Small branded page returned to plain HTML form posts (no JavaScript needed). */
function formPage(status: number, ok: boolean, message: string, fields: Record<string, string>, back: string) {
  const list = Object.values(fields).length
    ? `<ul>${Object.values(fields).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>`
    : "";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${ok ? "Sent" : "Please check your form"} | ${esc(site.name)}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#080a0c;color:#fff;font:16px/1.6 system-ui,sans-serif;padding:24px}
main{max-width:560px;border:1px solid #262c34;background:#11151a;padding:32px}h1{margin:0 0 8px;font:800 2rem/1.1 "Arial Narrow",Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em}
.rule{height:4px;width:96px;background:linear-gradient(90deg,#008b22 50%,#e71920 50%);margin-bottom:20px}p,li{color:#c9d0d7}li{margin:4px 0}
a{display:inline-block;margin-top:16px;padding:12px 20px;background:#e71920;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.08em;text-transform:uppercase}</style></head>
<body><main><div class="rule"></div><h1>${ok ? "Sent. Salamat!" : "Please check your form"}</h1><p>${esc(!ok && list ? "Please fix the following:" : message)}</p>${list}
${ok ? `<a href="${esc(site.url)}">Visit the camp site</a>` : `<a href="${esc(back)}" onclick="history.back();return false">Go back and fix it</a>`}</main></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function POST(req: Request) {
  // Accepts JSON (the site's own forms) or a plain HTML form post (e.g. the standalone form).
  const type = req.headers.get("content-type") ?? "";
  const isForm = type.includes("application/x-www-form-urlencoded") || type.includes("multipart/form-data");
  const ref = req.headers.get("referer") ?? "";
  const back = /^https?:\/\//i.test(ref) ? ref : site.url;
  const reply = (status: number, data: { ok: boolean; message?: string; fields?: Record<string, string> }) =>
    isForm
      ? formPage(
          status,
          data.ok,
          data.message ?? (data.ok ? "Thank you — our team received your message and will reply by email." : "Something went wrong."),
          data.fields ?? {},
          back,
        )
      : NextResponse.json(data, { status });

  let body: unknown;
  try {
    if (isForm) {
      const fd = await req.formData();
      const get = (k: string) => (typeof fd.get(k) === "string" ? (fd.get(k) as string) : "");
      body = {
        name: get("name"),
        email: get("email"),
        phone: get("phone"),
        inquiryType: get("inquiryType"),
        ageGroup: get("ageGroup"),
        guardian: get("guardian") === "on" || get("guardian") === "true",
        address: get("address"),
        fulfillment: get("fulfillment"),
        message: get("message"),
        website: get("website"),
      };
    } else {
      body = await req.json();
    }
  } catch {
    return reply(400, { ok: false, message: "Invalid request." });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return reply(422, { ok: false, message: "Please fix the highlighted fields.", fields });
  }

  const d = parsed.data;
  // Honeypot filled => pretend success, deliver nothing.
  if (d.website) return reply(200, { ok: true });

  const isOrder = d.inquiryType === "Merch Order";
  const text = (
    isOrder
      ? [
          "NEW MERCH ORDER — confirm the order, then send payment details.",
          "",
          `Name: ${d.name}`,
          `Email: ${d.email}`,
          `Phone: ${d.phone || "-"}`,
          `Address: ${d.address || "-"}`,
          `Pickup / delivery: ${d.fulfillment || "-"}`,
          "",
          d.message,
          "",
          "Next: confirm stock and the total, ask for payment, then send the online receipt and the delivery day.",
        ]
      : [
          `Name: ${d.name}`,
          `Email: ${d.email}`,
          `Phone: ${d.phone || "-"}`,
          `Inquiry type: ${d.inquiryType}`,
          `Age group: ${d.ageGroup || "-"}`,
          `Guardian confirmed: ${d.guardian ? "yes" : "no"}`,
          "",
          d.message,
        ]
  ).join("\n");

  const defaultTo = process.env.INQUIRY_TO_EMAIL || "info@coachatriplethreat.com";
  const recipients = routeFor(d.inquiryType, defaultTo);
  // Merch orders go out through Sendly when it's configured; everything else via Gmail/Resend.
  const channel = isOrder ? "merch" : "default";
  if (!mailProvider(channel)) {
    // No provider configured: log so nothing is silently lost during development.
    console.warn("[inquiry] email not configured (SENDLY_* for merch, GMAIL_* or RESEND_API_KEY + INQUIRY_FROM_EMAIL). Submission:\n" + text);
    return reply(200, {
      ok: true,
      message: isOrder
        ? "We received your order request. Our team will confirm it and send payment details; after payment you'll get an online receipt and your delivery day."
        : undefined,
    });
  }

  try {
    await sendMail({
      to: recipients,
      replyTo: d.email,
      subject: isOrder ? `Merch order — ${d.name} (${d.fulfillment})` : `Camp inquiry — ${d.inquiryType} (${d.name})`,
      text,
    }, channel);

    // Auto-reply worker: acknowledge the sender. Best-effort — never fails the submission.
    try {
      const first = d.name.trim().split(/\s+/)[0];
      await sendMail({
        to: [d.email],
        replyTo: recipients[0],
        subject: isOrder
          ? "We received your merch order — CA Triple Threat"
          : "We got your message — CA Triple Threat Basketball Camp",
        text: (isOrder
          ? [
              `Hi ${first},`,
              "",
              "Salamat! We received your order request:",
              "",
              d.message,
              "",
              `Pickup / delivery: ${d.fulfillment}`,
              "",
              "What happens next:",
              "1. Our team confirms your order and sends you the payment details.",
              "2. Once your payment is received, you get an online receipt and your delivery day.",
              "3. Pick it up at practice, or receive it via J&T Express or Lalamove.",
              "",
              "This email is not a receipt. Please wait for our confirmation before paying.",
              "",
              "— CA Triple Threat Basketball Camp",
            ]
          : [
              `Hi ${first},`,
              "",
              `Thanks for reaching out about "${d.inquiryType}". Our coaching team has received your inquiry and will reply as soon as possible.`,
              "",
              "You can reply to this email to add more details.",
              "",
              "— CA Triple Threat Basketball Camp",
            ]
        ).join("\n"),
      }, channel);
    } catch (err) {
      console.warn("[inquiry] auto-reply error", err);
    }
    return reply(200, {
      ok: true,
      message: isOrder
        ? "We received your order request. Our team will confirm it and send payment details; after payment you'll get an online receipt and your delivery day."
        : undefined,
    });
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return reply(502, { ok: false, message: "We couldn't send your message right now. Please email us directly." });
  }
}
