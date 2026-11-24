import { merch, nav, site } from "../lib/content";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <div className="rule" />
      <nav aria-label="Site map" className="mx-auto grid max-w-7xl gap-8 px-4 pt-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <h2 className="display text-sm tracking-[.2em] text-silver">Camp</h2>
          <ul className="mt-3 space-y-2">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={`/${n.href}`} className="text-sm text-white/85 transition-colors hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="display text-sm tracking-[.2em] text-silver">Merch</h2>
          <ul className="mt-3 space-y-2">
            {[
              { label: "The collection", href: `${merch.path}#collection` },
              { label: "Lookbook", href: `${merch.path}#lookbook` },
              { label: "Order merch", href: `${merch.path}#order` },
            ].map((p) => (
              <li key={p.href}>
                <a href={p.href} className="text-sm text-white/85 transition-colors hover:text-white">
                  {p.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-silver sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Court imagery is AI-rendered concept art, not a photograph of an existing facility.</p>
      </div>
    </footer>
  );
}
