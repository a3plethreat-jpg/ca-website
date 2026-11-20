import { site } from "../lib/content";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line bg-bg">
      <div className="rule" />
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-silver sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Court imagery is AI-rendered concept art, not a photograph of an existing facility.</p>
      </div>
    </footer>
  );
}
