import { NextResponse } from "next/server";
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
  if (!mailProvider()) {
    // No provider configured: log so nothing is silently lost during development.
    console.warn("[inquiry] email not configured (GMAIL_* or RESEND_API_KEY + INQUIRY_FROM_EMAIL). Submission:\n" + text);
    return NextResponse.json({ ok: true });
  }

  try {
    await sendMail({
      to: recipients,
      replyTo: d.email,
      subject: isOrder ? `Merch order — ${d.name} (${d.fulfillment})` : `Camp inquiry — ${d.inquiryType} (${d.name})`,
      text,
    });

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
      });
    } catch (err) {
      console.warn("[inquiry] auto-reply error", err);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return NextResponse.json({ ok: false, message: "We couldn't send your message right now. Please email us directly." }, { status: 502 });
  }
}
