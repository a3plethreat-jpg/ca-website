import type { Metadata } from "next";
import Footer from "../components/Footer";
import MerchShop from "../components/MerchShop";
import MerchHeroFrame from "../components/merch/MerchHeroFrame";
import { merch, peso, site } from "../lib/content";

export const metadata: Metadata = {
  title: "Merch | CA Triple Threat Basketball Camp",
  description: "Coach A 3D shirts, washed-pink faith tees and Play Hard Stay True camp apparel. Pick a color and size and send an order request.",
  alternates: { canonical: `${site.url}/merch` },
};

const basePrice = Math.min(...merch.products.map((p) => p.price));
const faithPrice = Math.max(...merch.products.filter((p) => p.line === "Faith").map((p) => p.price));

export default function MerchPage() {
  return (
    <>
      <a
        href="#collection"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to the collection
      </a>
      <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-3" aria-label={`${site.name} — home`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-clean.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full" />
            <span className="display text-lg tracking-[.08em]">Triple Threat <span className="text-red-text">Merch</span></span>
          </a>
          <nav aria-label="Merch" className="flex items-center gap-5 sm:gap-7">
            <a href="#collection" className="display hidden tracking-[.12em] text-silver hover:text-white sm:inline">Collection</a>
            <a href="#lookbook" className="display hidden tracking-[.12em] text-silver hover:text-white sm:inline">Lookbook</a>
            <a href="#order" className="display tracking-[.12em] text-silver hover:text-white">Order</a>
            <a href="/" className="display tracking-[.12em] text-white">← Camp</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden border-b border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/merch/logo-lineup.webp" alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-24">
            <div>
            <p className="eyebrow text-green-text">Official camp apparel</p>
            <h1 className="display mt-4 text-6xl leading-[.9] sm:text-8xl">
              Play hard.<br />
              <span className="text-red-text">Stay true.</span>
            </h1>
            <span aria-hidden className="rule mt-6 block w-40" />
            <p className="mt-6 max-w-xl text-lg text-silver">
              Wear what the camp stands for. Camp tees {peso(basePrice)}, washed-pink faith tees {peso(faithPrice)}. Pick a design, color and size, add it to your request, and the coaching team will confirm payment and pickup.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href="#collection" className="btn btn-primary">Shop the collection</a>
              <a href="#order" className="btn btn-ghost">How ordering works</a>
            </div>
            </div>
            <div className="rise">
              <MerchHeroFrame />
            </div>
          </div>
        </section>
        <section aria-labelledby="dream-quote" className="relative overflow-hidden border-b border-line">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(60%_80%_at_20%_50%,rgba(0,139,34,.18),transparent),radial-gradient(60%_80%_at_80%_50%,rgba(231,25,32,.16),transparent)]" />
          <figure className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
            <span aria-hidden className="display block text-7xl leading-none text-green-text">“</span>
            <blockquote id="dream-quote" className="display mt-2 text-4xl leading-tight sm:text-5xl">
              {merch.quote.text}
            </blockquote>
            <figcaption className="mt-6 text-lg text-silver">{merch.quote.invite}</figcaption>
            <span aria-hidden className="rule mx-auto mt-8 block w-40" />
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a href="#collection" className="btn btn-primary">Find your shirt</a>
              <a href="/#contact" className="btn btn-ghost">Join the camp</a>
            </div>
          </figure>
        </section>
        <MerchShop />
      </main>
      <Footer />
    </>
  );
}
