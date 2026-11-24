import { AbsoluteFill, Img, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { merch, peso } from "../../lib/content";

/** Remotion composition for the /merch hero frame: each design gets a short animated "drop". */
export const REEL = { fps: 30, width: 1080, height: 1080, perSlide: 84, overlap: 14 };

const slides = merch.products.map((p) => ({
  name: p.name,
  price: peso(p.price),
  line: p.line,
  verse: p.verse,
  img: p.colors[0].views[0].src,
  swatches: p.colors.map((c) => c.swatch),
  colors: p.colors.map((c) => c.name).join(" · "),
}));

export const reelDuration = slides.length * (REEL.perSlide - REEL.overlap) + REEL.overlap;

const display = "var(--font-display), 'Arial Narrow', Impact, sans-serif";
const sans = "var(--font-sans), system-ui, sans-serif";
const GREEN = "#008b22";
const RED = "#e71920";

function Slide({ s, index }: { s: (typeof slides)[number]; index: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = REEL.perSlide;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120, mass: 0.9 } });
  const exit = interpolate(frame, [dur - REEL.overlap, dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const dir = index % 2 ? -1 : 1;

  const imgX = interpolate(enter, [0, 1], [260 * dir, 0]) - exit * 220 * dir;
  const imgScale = interpolate(frame, [0, dur], [1.12, 1.0]);
  const imgRot = interpolate(enter, [0, 1], [6 * dir, 0]);
  const opacity = Math.min(enter * 1.4, 1) * (1 - exit);

  // Captions never overlap: the outgoing one is gone within 6 frames, the incoming one waits for the swap.
  const o = REEL.overlap;
  const text = (delay: number) => spring({ frame: frame - o - delay, fps, config: { damping: 18, stiffness: 140 } });
  const t1 = text(0);
  const t2 = text(5);
  const t3 = text(11);
  const rule = interpolate(frame, [o + 2, o + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const captionOut = interpolate(frame, [dur - o, dur - o + 6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* product image */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 250 }}>
        <div
          style={{
            width: 700,
            height: 700,
            overflow: "hidden",
            transform: `translateX(${imgX}px) rotate(${imgRot}deg)`,
            boxShadow: "0 40px 80px rgba(0,0,0,.6)",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <Img src={s.img} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${imgScale})` }} />
        </div>
      </AbsoluteFill>

      {/* caption block */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 70, opacity: captionOut }}>
        <div
          style={{
            fontFamily: display,
            letterSpacing: "0.3em",
            fontSize: 26,
            color: index % 2 ? "#ff5a60" : "#34d160",
            textTransform: "uppercase",
            opacity: t1,
            transform: `translateY(${(1 - t1) * 20}px)`,
          }}
        >
          {s.line} collection{s.verse ? ` · ${s.verse}` : ""}
        </div>
        <div style={{ overflow: "hidden", marginTop: 6 }}>
          <div
            style={{
              fontFamily: display,
              fontWeight: 800,
              fontSize: 92,
              lineHeight: 1,
              color: "#fff",
              textTransform: "uppercase",
              transform: `translateY(${(1 - t2) * 110}%)`,
            }}
          >
            {s.name}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
          <div style={{ display: "flex", height: 6, width: 220 * rule }}>
            <div style={{ flex: 1, background: GREEN }} />
            <div style={{ flex: 1, background: RED }} />
          </div>
          <div style={{ display: "flex", gap: 10, opacity: t3 }}>
            {s.swatches.map((c, i) => (
              <div
                key={i}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 99,
                  background: c,
                  border: "2px solid rgba(255,255,255,.5)",
                  transform: `scale(${spring({ frame: frame - o - 13 - i * 4, fps, config: { damping: 12 } })})`,
                }}
              />
            ))}
          </div>
          <div style={{ fontFamily: sans, fontSize: 24, color: "#a9b1ba", opacity: t3 }}>{s.colors}</div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: display,
              fontWeight: 800,
              fontSize: 60,
              lineHeight: 1,
              color: "#fff",
              opacity: t3,
              transform: `scale(${interpolate(t3, [0, 1], [0.6, 1])})`,
              transformOrigin: "right center",
            }}
          >
            {s.price}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function MerchReel() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  // Slow light sweep and a looping motto ticker tie the slides together.
  const sweep = interpolate(frame, [0, durationInFrames], [-40, 140]);
  const ticker = interpolate(frame, [0, durationInFrames], [0, -50]);
  const step = REEL.perSlide - REEL.overlap;
  const progress = frame / durationInFrames;

  return (
    <AbsoluteFill style={{ background: "#080a0c", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(115deg, transparent ${sweep - 30}%, rgba(0,139,34,.18) ${sweep}%, rgba(231,25,32,.14) ${sweep + 15}%, transparent ${sweep + 40}%)`,
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: 0.06 }}>
        <div style={{ fontFamily: display, fontWeight: 800, fontSize: 420, color: "#fff", whiteSpace: "nowrap", transform: `translateX(${ticker}%)` }}>
          PLAY HARD · STAY TRUE · PLAY HARD · STAY TRUE ·
        </div>
      </AbsoluteFill>

      {slides.map((s, i) => (
        <Sequence key={s.name} from={i * step} durationInFrames={REEL.perSlide} layout="none">
          <Slide s={s} index={i} />
        </Sequence>
      ))}

      {/* progress bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 6, background: "rgba(255,255,255,.08)" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: `linear-gradient(90deg, ${GREEN}, ${RED})` }} />
      </div>
    </AbsoluteFill>
  );
}
