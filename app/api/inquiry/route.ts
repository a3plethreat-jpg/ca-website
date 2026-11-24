import { NextResponse } from "next/server";
import { inquirySchema } from "../../lib/inquiry";

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

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] ??= i.message;
    return NextResponse.json({ ok: false, message: "Please fix the highlighted fields.", fields }, { status: 422 });
  }

  const d = parsed.data;
  // Honeypot filled => pretend success, deliver nothing.
  if (d.website) return NextResponse.json({ ok: true });

  const text = [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Phone: ${d.phone || "-"}`,
    `Inquiry type: ${d.inquiryType}`,
    `Age group: ${d.ageGroup || "-"}`,
    `Guardian confirmed: ${d.guardian ? "yes" : "no"}`,
    "",
    d.message,
  ].join("\n");

  const key = process.env.RESEND_API_KEY;
  const defaultTo = process.env.INQUIRY_TO_EMAIL || "info@coachatriplethreat.com";
  const recipients = routeFor(d.inquiryType, defaultTo);
  const to = recipients[0];
  const from = process.env.INQUIRY_FROM_EMAIL;
  if (!key || !from) {
    // No provider configured: log so nothing is silently lost during development.
    console.warn("[inquiry] email not configured (RESEND_API_KEY / INQUIRY_FROM_EMAIL). Submission:\n" + text);
    return NextResponse.json({ ok: true });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: recipients,
        reply_to: d.email,
        subject: `Camp inquiry — ${d.inquiryType} (${d.name})`,
        text,
      }),
    });
    if (!res.ok) throw new Error(`provider ${res.status}`);

    // Auto-reply worker: acknowledge the sender. Best-effort — never fails the submission.
    try {
      const first = d.name.trim().split(/\s+/)[0];
      const ack = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to: [d.email],
          reply_to: to,
          subject: "We got your message — CA Triple Threat Basketball Camp",
          text: [
            `Hi ${first},`,
            "",
            `Thanks for reaching out about "${d.inquiryType}". Our coaching team has received your inquiry and will reply as soon as possible.`,
            "",
            "You can reply to this email to add more details.",
            "",
            "— CA Triple Threat Basketball Camp",
          ].join("\n"),
        }),
      });
      if (!ack.ok) console.warn("[inquiry] auto-reply failed", ack.status);
    } catch (err) {
      console.warn("[inquiry] auto-reply error", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return NextResponse.json({ ok: false, message: "We couldn't send your message right now. Please email us directly." }, { status: 502 });
  }
}
