export const dynamic = "force-dynamic";

import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getSettings } from "@/lib/db/settings";
import { listPublishedReleases } from "@/lib/db/releases";

const GITHUB_RELEASES_URL = "https://github.com/MalekMGYF/Tunify/releases";

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(new Date(date));
}

export default async function ReleasesPage() {
  const [settings, releases] = await Promise.all([getSettings(), listPublishedReleases()]);

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar appName={settings.appName} />
      <main className="pt-32 pb-24">
        <div className="container-page">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Release history</h1>
          <p className="mt-4 max-w-2xl text-lg text-mist-300">
            Every published {settings.appName} release, newest first. Older versions stay available here even after a
            newer one becomes current.
          </p>

          {releases.length === 0 ? (
            <div className="mt-14 rounded-2xl border border-white/8 bg-ink-900/60 p-8">
              <p className="text-mist-300">
                Release notes and version history are published on GitHub Releases.
              </p>
              <a
                href={GITHUB_RELEASES_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-light underline decoration-white/20 underline-offset-4 hover:text-mist-100 hover:decoration-white/40"
              >
                View releases on GitHub
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="mt-14 grid gap-6">
              {releases.map((release) => (
                <article
                  key={release.id}
                  className="rounded-2xl border border-white/8 bg-ink-900/60 p-6 sm:p-8"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-display text-xl font-semibold text-mist-100">{release.title}</h2>
                      <p className="mt-1 text-sm text-mist-400">
                        Version {release.version} · {release.platform} · {formatBytes(release.fileSize)} ·{" "}
                        {formatDate(release.publishedAt)}
                      </p>
                      {release.changelog && (
                        <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-mist-300">
                          {release.changelog}
                        </p>
                      )}
                      <p className="mt-3 text-xs text-mist-400">
                        {release.downloadCount.toLocaleString()} download{release.downloadCount === 1 ? "" : "s"}
                      </p>
                    </div>

                    <a
                      href={`/api/releases/${release.id}/download`}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="mt-10 text-sm text-mist-400">
            Looking for the newest build?{" "}
            <Link href="/#download" className="underline decoration-white/20 underline-offset-4 hover:text-mist-100">
              Back to the download section
            </Link>
            .
          </p>
        </div>
      </main>
      <Footer
        appName={settings.appName}
        description={settings.description}
        socialTwitter={settings.socialTwitter}
        socialGithub={settings.socialGithub}
        socialDiscord={settings.socialDiscord}
      />
    </div>
  );
}
