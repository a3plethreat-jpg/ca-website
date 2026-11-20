"use client";

import { useEffect, useRef, useState } from "react";
import { DUDOY_CHAT_URL, sectionIds } from "../lib/content";
import { greeting, idlePoses, localReply, sectionPoses, suggestions, type Reply } from "../lib/dudoy";

type Msg = { from: "dudoy" | "you"; text: string; link?: { label: string; href: string } };
type Phase = "idle" | "run" | "whistle";

let audioCtx: AudioContext | null = null;

function whistle() {
  try {
    const ctx = audioCtx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2350, t);
    osc.frequency.linearRampToValueAtTime(2850, t + 0.08);
    lfo.frequency.value = 32;
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(osc.frequency);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
    gain.gain.setValueAtTime(0.08, t + 0.42);
    gain.gain.exponentialRampToValueAtTime(1e-4, t + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.62);
    lfo.stop(t + 0.62);
  } catch {}
}

function unlockAudio() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audioCtx ??= new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch {}
}

/** Dudoy: the mascot that follows you down the page, reacts to sections, and answers questions. */
export default function Dudoy() {
  const [pose, setPose] = useState("ball");
  const [say, setSay] = useState<string | null>(null);
  const [side, setSide] = useState<"right" | "left">("right");
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [runMs, setRunMs] = useState(0);
  const [popKey, setPopKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "dudoy", text: "Hi! I'm Dudoy, the Triple Threat assistant. Ask me anything about the camp! 🏀" },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [talking, setTalking] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [vw, setVw] = useState<number | null>(null);

  const phaseRef = useRef<Phase>("idle");
  const sideRef = useRef<"right" | "left">("right");
  const openRef = useRef(false);
  const voiceRef = useRef(true);
  const armed = useRef(false); // true after first click (audio allowed)
  const timers = useRef<number[]>([]);
  const poseTimer = useRef(0);
  const sayTimer = useRef(0);
  const current = useRef("");
  const lastSection = useRef<{ pose: string; say: string } | null>(null);
  const goto = useRef<(id: string, force?: boolean) => void>(() => {});
  const greetAudio = useRef<HTMLAudioElement | null>(null);
  const speakAudio = useRef<HTMLAudioElement | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  };
  openRef.current = open;
  voiceRef.current = voiceOn;

  const basePose = () => sectionPoses[current.current]?.pose ?? "ball";
  const flash = (p: string, ms: number) => {
    if (phaseRef.current !== "idle") return;
    setPose(p);
    window.clearTimeout(poseTimer.current);
    poseTimer.current = window.setTimeout(() => {
      if (phaseRef.current === "idle") setPose(basePose());
    }, ms);
  };

  useEffect(() => {
    try {
      setVoiceOn(localStorage.getItem("dudoy-voice") !== "off");
    } catch {}
    const onResize = () => setVw(document.documentElement.clientWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const clearAll = () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
    const show = () => {
      const s = lastSection.current ?? sectionPoses[current.current];
      if (!s) return;
      clearAll();
      setPhase("idle");
      setRunMs(0);
      setPose(s.pose);
      setPopKey((k) => k + 1);
      setSay(s.say);
      window.clearTimeout(sayTimer.current);
      sayTimer.current = window.setTimeout(() => setSay(null), 4500);
    };
    const onSection = (id: string, force = false) => {
      const s = sectionPoses[id];
      if (!s) return;
      lastSection.current = s;
      const target: "right" | "left" = id === "home" || sectionIds.indexOf(id) % 2 === 0 ? "right" : "left";
      window.clearTimeout(sayTimer.current);
      window.clearTimeout(poseTimer.current);
      const busyNow = phaseRef.current !== "idle";
      if (target === sideRef.current) {
        if (busyNow && !force) return;
        show();
        return;
      }
      if (force || openRef.current) {
        sideRef.current = target;
        setSide(target);
        show();
        return;
      }
      clearAll();
      const ms = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : Math.min(2200, Math.max(700, ((document.documentElement.clientWidth - 140) / 650) * 1000));
      sideRef.current = target;
      setRunMs(ms);
      setSide(target);
      setSay(null);
      if (ms) {
        setPhase("run");
        setPose("dribble");
      }
      later(ms, () => {
        setPhase("whistle");
        setRunMs(0);
        setPose("point");
        setPopKey((k) => k + 1);
        if (armed.current && voiceRef.current) whistle();
        later(1000, show);
      });
    };
    goto.current = onSection;

    const io = new IntersectionObserver(
      (entries) => {
        const ids = entries.filter((e) => e.isIntersecting).map((e) => e.target.id);
        const id = ids[ids.length - 1];
        if (id && id !== current.current) {
          current.current = id;
          onSection(id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const idle = window.setInterval(() => {
      if (!document.hidden) flash(idlePoses[Math.floor(Math.random() * idlePoses.length)], 2200);
    }, 12000);
    return () => {
      io.disconnect();
      window.clearInterval(idle);
      window.clearTimeout(sayTimer.current);
      window.clearTimeout(poseTimer.current);
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when chat closes, resume the section behaviour
  useEffect(() => {
    if (wasOpen.current && !open && current.current) goto.current(current.current);
    wasOpen.current = open;
  }, [open]);
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [msgs, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const speak = async (text: string) => {
    if (!voiceOn || !DUDOY_CHAT_URL) return;
    try {
      const res = await fetch(DUDOY_CHAT_URL.replace(/\/chat$/, "/speak"), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) return;
      const url = URL.createObjectURL(await res.blob());
      greetAudio.current?.pause();
      speakAudio.current?.pause();
      const a = new Audio(url);
      speakAudio.current = a;
      a.onplay = () => setTalking(true);
      a.onended = a.onpause = () => {
        setTalking(false);
        URL.revokeObjectURL(url);
      };
      await a.play();
    } catch {
      setTalking(false);
    }
  };

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || busy) return;
    const next: Msg[] = [...msgs, { from: "you", text }];
    setMsgs(next);
    setInput("");
    if (phaseRef.current === "idle") setPose("spin");
    const fallback: Reply = localReply(text);
    if (!DUDOY_CHAT_URL) {
      setMsgs([...next, fallback]);
      if (phaseRef.current === "idle") setPose(basePose());
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(DUDOY_CHAT_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          section: current.current || "home",
          messages: next.slice(-8).map((m) => ({ role: m.from === "you" ? "user" : "assistant", content: m.text })),
        }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.reply) throw new Error("no reply");
      setMsgs([...next, { from: "dudoy", text: data.reply, link: fallback.link }]);
      speak(data.reply);
    } catch {
      setMsgs([...next, fallback]);
      speak(fallback.text);
    } finally {
      setBusy(false);
      if (phaseRef.current === "idle") setPose(basePose());
    }
  };

  const onToggle = () => {
    armed.current = true;
    unlockAudio();
    if (phaseRef.current !== "idle") goto.current(current.current, true);
    let first = true;
    try {
      first = sessionStorage.getItem("dudoy-greeted") !== "1";
      sessionStorage.setItem("dudoy-greeted", "1");
    } catch {}
    if (!open && first) {
      if (voiceOn) {
        speakAudio.current?.pause();
        try {
          greetAudio.current ??= new Audio(greeting.src);
          greetAudio.current.currentTime = 0;
          greetAudio.current.play().catch(() => {});
        } catch {}
        flash("jump", 2500);
      }
      setMsgs((m) => (m.some((x) => x.text === greeting.text) ? m : [...m, { from: "dudoy", text: greeting.text }]));
    }
    setOpen((v) => !v);
    setSay(null);
  };

  const toggleVoice = () => {
    setVoiceOn((v) => {
      const nv = !v;
      try {
        localStorage.setItem("dudoy-voice", nv ? "on" : "off");
      } catch {}
      if (!nv) {
        greetAudio.current?.pause();
        speakAudio.current?.pause();
        setTalking(false);
      }
      return nv;
    });
  };

  const x =
    side === "right"
      ? `calc(${vw === null ? "100vw" : `${vw}px`} - 100% - var(--dudoy-m))`
      : "var(--dudoy-m)";
  const running = phase === "run";
  const edge = side === "right" ? "right-0" : "left-0";

  return (
    <div
      data-testid="dudoy"
      data-motion="showpiece"
      data-phase={phase}
      data-side={side}
      style={
        {
          transform: `translateX(${x})`,
          transition: running ? `transform ${runMs}ms linear` : "none",
          "--dudoy-skid": side === "left" ? "-6px" : "6px",
          "--dudoy-tilt": side === "left" ? "-4deg" : "4deg",
        } as React.CSSProperties
      }
      className={`fixed bottom-3 left-0 z-[90] [--dudoy-m:12px] sm:bottom-5 sm:[--dudoy-m:20px] ${running ? "dudoy-running" : ""} ${
        phase === "whistle" ? "dudoy-whistling" : ""
      }`}
    >
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Dudoy"
          data-testid="dudoy-chat"
          className={`panel fx-panel absolute bottom-[calc(100%+10px)] ${edge} flex w-[min(92vw,360px)] flex-col overflow-hidden !bg-[#0c0f13]/95`}
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="display text-xl">
              Dudoy <span className="ml-1 text-xs tracking-widest text-green-text">{talking ? "🔊 TALKING…" : "● CAMP ASSISTANT"}</span>
            </p>
            <span className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleVoice}
                aria-pressed={voiceOn}
                aria-label={voiceOn ? "Mute Dudoy's voice" : "Turn on Dudoy's voice"}
                title={voiceOn ? "Voice on" : "Voice off"}
                data-testid="dudoy-voice"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
              >
                {voiceOn ? "🔊" : "🔇"}
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10">
                ✕
              </button>
            </span>
          </div>
          <div ref={scroller} className="max-h-[50vh] space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {msgs.map((m, i) => (
              <div key={i} className={m.from === "you" ? "text-right" : ""}>
                <p className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-left ${m.from === "you" ? "bg-brand-green/30" : "bg-white/10"}`}>{m.text}</p>
                {m.link && (
                  <a href={m.link.href} onClick={() => setOpen(false)} className="mt-1 block text-xs font-semibold text-green-text underline underline-offset-4">
                    {m.link.label} →
                  </a>
                )}
              </div>
            ))}
            {busy && (
              <p data-testid="dudoy-typing" className="inline-block rounded-lg bg-white/10 px-3 py-2 text-white/70">
                <span className="animate-pulse">Dudoy is typing…</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 px-4 pb-2">
            {suggestions.map((s) => (
              <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-white/20 px-2.5 py-1 text-xs hover:border-brand-green hover:bg-brand-green/20">
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <label htmlFor="dudoy-input" className="sr-only">Ask Dudoy</label>
            <input
              id="dudoy-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the camp…"
              autoComplete="off"
              className="min-h-10 flex-1 rounded-sm border border-white/15 bg-black/40 px-3 text-sm focus:border-brand-green"
            />
            <button type="submit" disabled={busy} className="btn btn-primary !min-h-10 !px-4 !text-sm disabled:opacity-60">Send</button>
          </form>
        </div>
      )}

      {phase === "whistle" && !open && (
        <p aria-hidden className={`dudoy-say absolute bottom-[calc(100%+8px)] ${edge} w-max rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black shadow-lg`}>
          FWEEET! 🎶
        </p>
      )}
      {say && !open && phase !== "whistle" && (
        <p role="status" className={`dudoy-say absolute bottom-[calc(100%+8px)] ${edge} w-max max-w-[60vw] rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black shadow-lg sm:max-w-[260px]`}>
          {say}
        </p>
      )}

      <button
        type="button"
        onClick={onToggle}
        aria-label={open ? "Close Dudoy chat" : "Chat with Dudoy, the camp assistant"}
        aria-expanded={open}
        className={`dudoy-btn group relative block h-24 w-[72px] sm:h-32 sm:w-24 ${talking ? "dudoy-talking" : ""}`}
      >
        <span
          aria-hidden
          className="dudoy-shadow absolute -bottom-1 left-1/2 h-3 w-[80%] -translate-x-1/2 rounded-[50%] [background:radial-gradient(closest-side,rgba(0,0,0,.75),transparent),linear-gradient(90deg,rgba(0,139,34,.55),rgba(231,25,32,.55))] blur-[2px]"
        />
        <span key={popKey} className="dudoy-hop block h-full w-full">
          <span className="dudoy-bob block h-full w-full">
            <span className="block h-full w-full" style={running && side === "left" ? { transform: "scaleX(-1)" } : undefined}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={pose}
                src={`/dudoy/${pose}.webp`}
                alt=""
                width={96}
                height={96}
                className="dudoy-pose h-full w-full object-contain object-bottom drop-shadow-[0_8px_10px_rgba(0,0,0,.6)]"
              />
            </span>
          </span>
        </span>
        {phase === "whistle" && (
          <span aria-hidden className="dudoy-tweet absolute -top-2 left-1/2 text-xl">〰️</span>
        )}
        {!open && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 grid h-6 w-6 place-items-center rounded-full bg-brand-red text-xs font-bold ring-2 ring-bg">?</span>
        )}
      </button>
    </div>
  );
}
