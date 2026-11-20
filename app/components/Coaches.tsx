import { achievements, coaches } from "../lib/content";
import CoachProfile from "./CoachProfile";

function AchievementList({ hidden }: { hidden?: boolean }) {
  return (
    <ol className="flex shrink-0 gap-4" aria-hidden={hidden || undefined}>
      {achievements.map((a, i) => (
        <li
          key={i}
          style={{ ["--n" as string]: i }}
          className={`ach-card panel group/card relative w-[min(78vw,340px)] shrink-0 overflow-hidden p-5 ${
            a.trophy ? "min-h-[170px] pr-[96px] sm:min-h-[190px] sm:pr-[120px]" : ""
          }`}
        >
          <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${i % 2 ? "bg-brand-red" : "bg-brand-green"}`} />
          <span aria-hidden className="ach-shine pointer-events-none absolute inset-0" />
          {a.trophy && (
            <div aria-hidden className="absolute bottom-0 right-1 flex w-[90px] origin-bottom-right scale-[.85] flex-col items-center sm:right-2 sm:w-[110px] sm:scale-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.trophy} alt="" loading="lazy" width={100} height={150} className="card-trophy relative z-10 -mb-1 h-[140px] w-auto" />
              <span className="h-3 w-[96px] rounded-t-sm bg-[linear-gradient(180deg,#2a2f37,#111418)] shadow-[inset_0_1px_0_rgba(255,255,255,.18)]" />
              <span className="h-2 w-[110px] bg-[linear-gradient(90deg,#008B22,#e9e9e9_50%,#E71920)] opacity-80" />
              <span className="pointer-events-none absolute bottom-3 h-10 w-[120px] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,205,110,.35),transparent_70%)]" />
            </div>
          )}
          <p className="eyebrow">{a.year ? `${a.year} · ${a.division}` : a.division}</p>
          <p className="display mt-1 text-3xl">{a.result}</p>
          <p className="mt-1 text-silver">{a.event}</p>
        </li>
      ))}
    </ol>
  );
}

export default function Coaches() {
  const head = coaches.find((c) => c.featured)!;
  const staff = coaches.filter((c) => !c.featured);
  return (
    <section id="coaches" aria-labelledby="coaches-title" className="relative flex min-h-screen items-center py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div data-reveal="true">
          <p className="eyebrow">Coaches &amp; achievements</p>
          <h2 id="coaches-title" className="display mt-3 text-[clamp(2.8rem,8vw,6rem)]">LEADERS WHO BUILD CHAMPIONS.</h2>
        </div>

        <div className="mt-10 space-y-5">
          <article className="panel grid overflow-hidden md:grid-cols-[minmax(0,320px)_1fr]" data-reveal="true">
            <div className="relative grid aspect-[4/5] place-items-center bg-surface-2 md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={head.photo} alt={`${head.name}, ${head.role}`} className="h-full w-full object-cover object-top" loading="lazy" width={900} height={1200} />
            </div>
            <div className="p-6 sm:p-8">
              <p className="eyebrow">{head.role} · {head.location}</p>
              <h3 className="display mt-2 text-5xl sm:text-6xl">{head.name}</h3>
              <p className="mt-4 max-w-2xl text-silver">{head.bio}</p>
              <CoachProfile c={head} />
            </div>
          </article>
        </div>

        <h3 className="display mt-12 text-3xl sm:text-4xl" data-reveal="true">Coaching staff</h3>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {staff.map((c, i) => (
            <article key={c.id} data-staff="true" style={{ ["--i" as string]: i }} className="staff-card group panel relative overflow-hidden">
              <span aria-hidden className="staff-bar absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-brand-green to-brand-red" />
              <div className="staff-photo grid h-72 place-items-center overflow-hidden bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.photo} alt={`${c.name}, ${c.role}`} className="staff-img h-full w-full object-cover object-[50%_12%]" loading="lazy" width={700} height={875} />
              </div>
              <div className="p-4">
                <p className="eyebrow !text-[.7rem]">{c.role}</p>
                <h3 className="display mt-1 text-3xl">{c.name}</h3>
                <p className="mt-1 text-sm text-silver">{c.location}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-14" data-reveal="true">
          <h3 className="display text-3xl sm:text-4xl">Achievements</h3>
          <div
            data-motion="showpiece"
            data-reveal="true"
            className="ach-marquee group/ach relative mt-6 min-w-0 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
          >
            <div className="marquee-track ach-track flex w-max gap-4 py-2">
              <AchievementList />
              <AchievementList hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
