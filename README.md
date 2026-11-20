# CA Triple Threat Basketball Camp — website

Editable Next.js (App Router) + Tailwind CSS v4 source, rebuilt from the production site at
https://preview.coachatriplethreat.com/ (the original source was not available, so this was reconstructed from the
deployed markup, styles and client code; first commit in git history holds an exact copy of the compiled build).

## Run
```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```
Copy `.env.example` to `.env.local` to configure contact details, the Dudoy chat endpoint, email delivery and the live stream.

## Structure
| Path | What |
|---|---|
| `app/lib/content.ts` | **All site copy/data** (coaches, achievements, gallery, mindset, contact, live-screen config) |
| `app/components/` | `Header`, `Stage` (fixed arena backdrop), `Hero` + `LiveScreen`, `About`, `Coaches`, `Mindset`, `Gallery`, `Contact` + `InquiryForm`, `Dudoy` (mascot chatbot), `Motion` (GSAP reveals) |
| `app/api/inquiry/route.ts` | Contact form endpoint (validates, honeypot, sends via Resend if configured) |
| `app/globals.css` | Tailwind theme tokens + custom styles |
| `public/` | Images, clips, mascot poses, audio |

## Hero corner "live screen"
Sits in the upper-right corner of the arena photo, angled toward the court, with broadcast chrome (badge, channel bug, ticker).
- Default: plays the recorded highlight (`liveScreen.clips`) and is labelled **LIVE REPLAY**.
- Set `NEXT_PUBLIC_LIVE_STREAM_URL` (YouTube/Facebook https URL) to embed a real stream; the badge then reads **LIVE**.
- Tweak position/size in `app/globals.css` (`.live-screen`, `.live-frame`).

## Known gaps vs. production
- The optional WebGL 3D arena scene (desktop only, progressive enhancement) is **not** ported; the image-based backdrop (the site's own fallback mode) is used.
- `/api/inquiry` delivery is a new implementation (Resend). Without `RESEND_API_KEY` + `INQUIRY_FROM_EMAIL` submissions are only logged server-side.
- The Dudoy chat points at `https://dudoy.coachatriplethreat.com/chat` (existing service); built-in answers are the fallback.
