"use client";

import dynamic from "next/dynamic";

// Remotion only runs in the browser; load it after the page so it doesn't block first paint.
const MerchHeroPlayer = dynamic(() => import("./MerchHeroPlayer"), {
  ssr: false,
  loading: () => (
    <div className="relative aspect-square w-full overflow-hidden border border-line bg-bg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/merch/logo-red.webp" alt="" className="h-full w-full object-cover opacity-60" />
    </div>
  ),
});

export default function MerchHeroFrame() {
  return <MerchHeroPlayer />;
}
