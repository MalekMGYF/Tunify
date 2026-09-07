"use client";

import { SCREENSHOTS } from "@/config/app";

export default function AppPreview() {
  return (
    <section id="preview" className="py-24 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A closer look</h2>
          <p className="mt-4 text-lg text-mist-300">See Tunify&apos;s library, player, and playlists in action.</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {SCREENSHOTS.map((shot) => (
            <figure key={shot.src} className="overflow-hidden rounded-2xl border border-white/8 bg-ink-900/60">
              <div className="relative aspect-[9/16] w-full bg-ink-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    e.currentTarget.parentElement?.classList.add("bg-tunify-radial");
                  }}
                />
              </div>
              <figcaption className="border-t border-white/8 px-4 py-3 text-sm text-mist-300">{shot.caption}</figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-sm text-mist-400">
          Placeholder screenshots shown above — see the README for how to swap in real ones.
        </p>
      </div>
    </section>
  );
}
