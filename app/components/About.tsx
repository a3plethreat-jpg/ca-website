import { aboutFacts, pillars } from "../lib/content";

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative flex min-h-screen items-center py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl rounded-sm bg-gradient-to-r from-bg/80 to-transparent p-0 md:p-2" data-reveal="true">
          <p className="eyebrow">About the camp</p>
          <h2 id="about-title" className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">MORE THAN BASKETBALL.</h2>
          <p className="display mt-4 text-xl text-green-text sm:text-3xl">
            BUILDING BETTER PLAYERS. BUILDING STRONGER CHARACTER.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <li key={p.title} data-reveal="true" className="panel relative overflow-hidden p-6">
              <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${i % 2 ? "bg-brand-red" : "bg-brand-green"}`} />
              <span aria-hidden className="display text-5xl text-white/15">0{i + 1}</span>
              <h3 className="display mt-2 text-3xl">{p.title}</h3>
              <p className="mt-3 text-silver">{p.text}</p>
            </li>
          ))}
        </ul>
        <dl className="panel mt-10 grid overflow-hidden sm:grid-cols-2 lg:grid-cols-3" data-reveal="true">
          {aboutFacts.map((f) => (
            <div key={f.label} className="p-5 shadow-[inset_0_0_0_.5px_rgba(255,255,255,.12)]">
              <dt className="eyebrow">{f.label}</dt>
              <dd className={`mt-2 ${f.muted ? "text-silver italic" : "text-white"}`}>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
