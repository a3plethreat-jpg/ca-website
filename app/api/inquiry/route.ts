import { NextResponse } from "next/server";
import { inquirySchema } from "../../lib/inquiry";

export const runtime = "nodejs";

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
  const to = process.env.INQUIRY_TO_EMAIL || "info@coachatriplethreat.com";
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
        to: [to],
        reply_to: d.email,
        subject: `Camp inquiry — ${d.inquiryType} (${d.name})`,
        text,
      }),
    });
    if (!res.ok) throw new Error(`provider ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiry] send failed", err);
    return NextResponse.json({ ok: false, message: "We couldn't send your message right now. Please email us directly." }, { status: 502 });
  }
}
