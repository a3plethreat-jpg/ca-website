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
| `app/api/inquiry/route.ts` | Inquiry/order endpoint (validates, honeypot, routes by type, sends via Gmail or Resend). Accepts JSON (site forms) or a plain HTML form post, answering the latter with a small HTML page |
| `public/forms/order-form.html` | Standalone HTML order & inquiry form (no JS needed) that posts to `/api/inquiry`; host or embed anywhere, change the `action` URL to point at another deployment |
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

## Deploy to Cloudflare Workers (vinext)
The app runs on Cloudflare Workers via [vinext](https://github.com/cloudflare/vinext) (Next.js API on Vite). Config: `vite.config.ts`, `cloudflare.config.ts`
(Workers Response Store cache in self-contained mode + Cloudflare Images binding).
```bash
npm run build:vinext     # production build (.cloudflare/output)
npm run start:vinext     # preview in the local Workers runtime
npm run deploy:vinext    # build + deploy (needs `cf auth login` / a Cloudflare API token)
```
Set env vars as Worker secrets/vars (see `.env.example`), e.g. `RESEND_API_KEY`, `INQUIRY_FROM_EMAIL`.
`npm run dev` / `npm run build` still run plain Next.js.

### Automatic deploys (GitHub Actions)
`.github/workflows/deploy.yml` deploys on every push to `main` (or run it manually from the Actions tab). Add two repository secrets (Settings -> Secrets and variables -> Actions): `CLOUDFLARE_API_TOKEN` (permissions: Workers Scripts: Edit, Workers R2 Storage: Edit, Account Settings: Read, plus Workers Routes: Edit and DNS: Edit for the zone) and `CLOUDFLARE_ACCOUNT_ID`. The site is attached to `v3.coachatriplethreat.com` (see `domains` in `cloudflare.config.ts`).
