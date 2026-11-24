/**
 * Outbound email for the inquiry form.
 * Provider order: Gmail API (GMAIL_* env) -> Resend (RESEND_API_KEY + INQUIRY_FROM_EMAIL) -> none.
 * Uses plain fetch only, so it runs on Node and on Cloudflare Workers.
 */
export type Mail = { to: string[]; replyTo?: string; subject: string; text: string };

const clean = (s: string) => s.replace(/[\r\n]+/g, " ").trim(); // header-injection guard
const b64url = (b: Uint8Array) => {
  let bin = "";
  for (const x of b) bin += String.fromCharCode(x);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const b64 = (s: string) => {
  let bin = "";
  for (const x of new TextEncoder().encode(s)) bin += String.fromCharCode(x);
  return btoa(bin);
};
const encodeHeader = (s: string) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${b64(s)}?=`);

function gmailConfig() {
  const { GMAIL_CLIENT_ID: id, GMAIL_CLIENT_SECRET: secret, GMAIL_REFRESH_TOKEN: refresh, GMAIL_SENDER: sender } = process.env;
  return id && secret && refresh && sender ? { id, secret, refresh, sender } : null;
}

export function mailProvider(): "gmail" | "resend" | null {
  if (gmailConfig()) return "gmail";
  if (process.env.RESEND_API_KEY && process.env.INQUIRY_FROM_EMAIL) return "resend";
  return null;
}

async function sendGmail(m: Mail) {
  const c = gmailConfig()!;
  const tok = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: c.id,
      client_secret: c.secret,
      refresh_token: c.refresh,
      grant_type: "refresh_token",
    }),
  });
  if (!tok.ok) throw new Error(`gmail token ${tok.status}`);
  const { access_token } = (await tok.json()) as { access_token: string };

  const fromName = process.env.GMAIL_SENDER_NAME ? `${encodeHeader(clean(process.env.GMAIL_SENDER_NAME))} ` : "";
  const headers = [
    `From: ${fromName}<${clean(c.sender)}>`,
    `To: ${m.to.map(clean).join(", ")}`,
    ...(m.replyTo ? [`Reply-To: ${clean(m.replyTo)}`] : []),
    `Subject: ${encodeHeader(clean(m.subject))}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
  ];
  const raw = b64url(new TextEncoder().encode(`${headers.join("\r\n")}\r\n\r\n${b64(m.text)}`));
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: { Authorization: `Bearer ${access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  if (!res.ok) throw new Error(`gmail send ${res.status}`);
}

async function sendResend(m: Mail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL,
      to: m.to,
      reply_to: m.replyTo,
      subject: clean(m.subject),
      text: m.text,
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}`);
}

export async function sendMail(m: Mail) {
  const p = mailProvider();
  if (p === "gmail") return sendGmail(m);
  if (p === "resend") return sendResend(m);
  throw new Error("no mail provider configured");
}
