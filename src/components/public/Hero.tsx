import { Play, SkipBack, SkipForward, Volume2 } from "lucide-react";

export default function Hero({
  appName,
  description,
  platforms,
}: {
  appName: string;
  description: string;
  platforms: string[];
}) {
  return (
    <section id="home" className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rotate-[18deg] bg-tunify-gradient opacity-20 blur-[110px]"
      />

      <div className="container-page relative grid gap-16 lg:grid-cols-[1.05fr,0.95fr] lg:items-center">
        <div className="max-w-xl animate-rise">
          <h1 className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
            Your Music.
            <br />
            Your Way.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-mist-300">{description}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="/api/releases/latest/download"
              className="inline-flex items-center justify-center rounded-full bg-tunify-gradient px-7 py-3.5 text-base font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Download {appName}
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3.5 text-base font-semibold text-mist-100 transition-colors hover:border-white/30 hover:bg-white/5"
            >
              Explore Features
            </a>
          </div>

          <p className="mt-6 text-sm text-mist-400">
            {platforms.length > 0 ? `Available for ${platforms.join(", ")}` : "Platform availability listed below"}
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:150ms]">
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-tunify-radial" aria-hidden="true" />
          <div className="animate-float rounded-[1.75rem] border border-white/10 bg-ink-900/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur">
            <div className="rounded-[1.4rem] bg-ink-800/80 p-5">
              <div className="flex items-center justify-between text-xs text-mist-400">
                <span>Now Playing</span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-light" />
              </div>

              <div className="mt-5 aspect-square w-full overflow-hidden rounded-2xl bg-tunify-gradient">
                <img src="/album-cover.png" alt="Racore by Marwan Pablo" className="h-full w-full object-cover" />
              </div>

              <div className="mt-5">
                <p className="font-display text-base font-semibold text-mist-100">Racore</p>
                <p className="mt-0.5 text-sm text-mist-400">Marwan Pablo</p>
              </div>

              <div className="mt-4 h-1 w-full rounded-full bg-white/10">
                <div className="h-1 w-2/3 rounded-full bg-tunify-gradient" />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-mist-400">
                <span>1:52</span>
                <span>2:47</span>
              </div>

              <div className="mt-5 flex items-center justify-center gap-6">
                <SkipBack className="h-5 w-5 text-mist-300" />
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-tunify-gradient">
                  <Play className="h-4 w-4 fill-white text-white" />
                </span>
                <SkipForward className="h-5 w-5 text-mist-300" />
              </div>

              <div className="mt-5 flex items-center gap-2 text-mist-400">
                <Volume2 className="h-4 w-4" />
                <div className="h-1 flex-1 rounded-full bg-white/10">
                  <div className="h-1 w-3/4 rounded-full bg-white/40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
