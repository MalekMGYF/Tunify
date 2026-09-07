import { INSTALLATION_STEPS } from "@/config/app";

export default function InstallationSteps() {
  return (
    <section id="installation" className="py-24 sm:py-28">
      <div className="container-page">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Getting set up</h2>
          <p className="mt-4 text-lg text-mist-300">Four steps and you&apos;re listening.</p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {INSTALLATION_STEPS.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-white/8 bg-ink-900/60 p-6">
              <span className="font-display text-3xl font-bold text-transparent [-webkit-text-stroke:1.5px_theme(colors.mist.400)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-semibold text-mist-100">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
