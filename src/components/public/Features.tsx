import { Radio, Search, ListMusic, Heart, SlidersHorizontal, Zap, Moon, User, type LucideIcon } from "lucide-react";
import { FEATURES } from "@/config/app";

const ICONS: Record<string, LucideIcon> = { Radio, Search, ListMusic, Heart, SlidersHorizontal, Zap, Moon, User };

export default function Features() {
  return (
    <section id="features" className="py-24 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Everything you need to just listen</h2>
          <p className="mt-4 text-lg text-mist-300">Tunify keeps the essentials close and the clutter out of the way.</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Zap;
            const spanClass =
              index === 0 ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : index === 5 ? "sm:col-span-2 lg:col-span-2" : "";

            return (
              <div
                key={feature.title}
                className={`group relative overflow-hidden rounded-2xl border border-white/8 bg-ink-900/60 p-6 transition-colors hover:border-white/15 ${spanClass}`}
              >
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-tunify-gradient opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                />
                <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-violet-light">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="relative mt-4 text-lg font-semibold text-mist-100">{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-mist-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
