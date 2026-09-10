export const dynamic = "force-dynamic";

import Link from "next/link";
import { Download } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getSettings } from "@/lib/db/settings";

const GITHUB_API_URL = "https://api.github.com/repos/MalekMGYF/Tunify/releases";

type GithubAsset = {
  name: string;
  size: number;
  browser_download_url: string;
};

type GithubRelease = {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  published_at: string | null;
  assets: GithubAsset[];
};

async function getGithubReleases(): Promise<GithubRelease[]> {
  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: { Accept: "application/vnd.github+json" },
      // Revalidate periodically instead of hitting GitHub on every request.
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(
    new Date(dateString)
  );
}

function primaryAsset(release: GithubRelease): GithubAsset | undefined {
  return (
    release.assets.find((a) => a.name.toLowerCase().endsWith(".apk")) ??
    release.assets[0]
  );
}

export default async function ReleasesPage() {
  const [settings, releases] = await Promise.all([getSettings(), getGithubReleases()]);

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar appName={settings.appName} />
      <main className="pt-32 pb-24">
        <div className="container-page">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Release history</h1>
          <p className="mt-4 max-w-2xl text-lg text-mist-300">
            Every published {settings.appName} release, newest first.
          </p>

          {releases.length === 0 ? (
            <p className="mt-14 text-mist-400">No releases have been published yet.</p>
          ) : (
            <div className="mt-14 grid gap-6">
              {releases.map((release) => {
                const asset = primaryAsset(release);
                return (
                  <article key={release.id} className="rounded-2xl border border-white/8 bg-ink-900/60 p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="font-display text-xl font-semibold text-mist-100">
                          {release.name || release.tag_name}
                        </h2>
                        <p className="mt-1 text-sm text-mist-400">
                          {release.tag_name}
                          {asset ? ` · ${formatBytes(asset.size)}` : ""} · {formatDate(release.published_at)}
                        </p>
                        {release.body && (
                          <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-mist-300">
                            {release.body}
                          </p>
                        )}
                      </div>

                      {asset && (
                        <a
                          href={asset.browser_download_url}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      )}
                    </div>
                  </article>
                );
              })}
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
