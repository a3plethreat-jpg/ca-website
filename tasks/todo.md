# Plan / results

## Done
- [x] Smoke-test live site (desktop + mobile): no console errors, no failed requests
- [x] Rebuild editable Next.js 16 + Tailwind v4 source (all sections, interactions, form, Dudoy)
- [x] Move live screen to the arena's upper-right corner, angled to the court, ~1.4x bigger, broadcast overlays
- [x] Verified: build + typecheck clean; 19 feature checks pass (nav, live screen, expand, coach profile, gallery filter/lightbox, Dudoy, form validation/guardian/submit, mobile menu)

## Deploy
- [x] GitHub workflow deploys to the `ca-website` Worker (token cleaned + verified before deploy; token re-saved)
- [ ] Move `coachatriplethreat.com` from the old Pages project to the `ca-website` Worker

## Page debug (2026-11-23)
- [x] Mobile hero: on short phones (<=760px tall) the hero copy overlapped the corner live screen by up to 143px. Fixed: smaller screen, no description, tighter copy. Verified at 360x640 to 768x1024, no overlap.
- [x] Dudoy speech bubble could cover the "Explore our story" button: made click-through.
- [x] Removed duplicate `allowFullScreen` on the live-screen iframes (console warning).
- [ ] BLOCKER (owner): every Cloudflare deploy since PR #4 failed: the `CLOUDFLARE_API_TOKEN` repo secret is rejected ("token status: invalid"). v3.coachatriplethreat.com still serves an old build. Replace the secret, then re-run the "Deploy to Cloudflare" workflow.
- Note: coachatriplethreat.com is served by Vercel (not Cloudflare Pages as assumed above).

## Next
- [ ] Sponsors logo section (need logo files, names, links)
- [x] Merch page `/merch` (2026-11-24): improved take on the standalone merch site, in the camp's own design. One card per design with color swatches and front/back views, line filter, enlarge dialog, size + qty, multi-item request list, "Merch Order" inquiry prefilled; verified desktop + mobile, no console errors, submit clears the request.
- [x] Merch hero frame animated with Remotion (`@remotion/player`, lazy-loaded): 4-slide loop of the tees, pause/play button, pauses off-screen, still frame for reduced motion. Product cards reveal on scroll; "Added" pops.
- [ ] Remotion license: free for individuals and companies of up to 3 people; larger orgs need a company license (owner to confirm, then set `acknowledgeRemotionLicense` to silence the console notice)
- [x] Merch prices (owner, 2026-11-24): washed-pink faith tees ₱700, all others ₱500. Shown on cards, in the reel, request list with totals, and the order message. Added the "Every shirt is a dream come true" quote band. New Coach A 3D red/black photos (black has Dark/Light views).
- [x] Merch sizes (owner): S, M, L, XL, XXL, XXXL
- [x] Merch ordering flow (owner, 2026-11-24): pick design + size -> name, phone, address, email -> submit; team confirms and asks for payment first; online receipt + delivery day after payment; pickup at practice or delivery via J&T Express / Lalamove. Phone, address and pickup/delivery are required for "Merch Order" (client + server). Staff email and customer auto-reply follow the flow.
- [ ] Merch: payment channel details (e.g. GCash number) to include in the confirmation reply
- [x] Mobile hero (2026-11-24): corner live-screen replaced with a 3D-animated Dudoy popup (CSS perspective/rotateY/rotateX showcase spin + pulsing glow, jump.webp — transparent, celebratory), full-card link to /merch, "NEW DROP" badge + "SHOP THE MERCH" CTA. Desktop/tablet (>=768px) unchanged — still shows the live stream/replay screen. Verified: no video/iframe mounted on phones, click routes to /merch, reduced-motion gets a static tilt (no spin).
- [ ] Decide on porting the optional 3D arena scene
- [ ] Configure email delivery (Resend) and real live-stream URL
