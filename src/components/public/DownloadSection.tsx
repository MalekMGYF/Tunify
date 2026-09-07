"use client";

import { Download, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { toPublicRelease } from "@/lib/db/releases";

type PublicRelease = ReturnType<typeof toPublicRelease>;

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 py-3 last:border-0">
      <span className="text-sm text-mist-400">{label}</span>
      <span className="text-sm font-medium text-mist-100">{value}</span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(new Date(date));
}

export default function DownloadSection({ appName, release }: { appName: string; release: PublicRelease | null }) {
  return (
    <section id="download" className="py-24 sm:py-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-900/70 p-8 sm:p-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-tunify-gradient opacity-20 blur-[100px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{appName}</h2>
              <p className="mt-3 text-lg text-mist-300">Download the latest version</p>

              {release ? (
                <>
                  <div className="mt-8 max-w-sm">
                    <DetailRow label="Version" value={release.version} />
                    <DetailRow label="File size" value={formatBytes(release.fileSize)} />
                    <DetailRow label="Platform" value={release.platform} />
                    <DetailRow label="Release date" value={formatDate(release.publishedAt)} />
                  </div>

                  {release.changelog && (
                    <details className="mt-6 max-w-sm">
                      <summary className="cursor-pointer text-sm text-mist-300 underline decoration-white/20 underline-offset-4 hover:text-mist-100 hover:decoration-white/40">
                        View changelog
                      </summary>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-mist-400">{release.changelog}</p>
                    </details>
                  )}
                </>
              ) : (
                <p className="mt-8 max-w-sm text-sm text-mist-400">
                  No release is published yet. Once an admin publishes one, it will appear here automatically.
                </p>
              )}

              <div className="mt-6">
                <Link
                  href="/releases"
                  className="inline-flex items-center gap-1.5 text-sm text-mist-300 underline decoration-white/20 underline-offset-4 hover:text-mist-100 hover:decoration-white/40"
                >
                  View release history
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-4 sm:items-center lg:items-stretch">
              <a
                href="/api/releases/latest/download"
                aria-disabled={!release}
                className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-glow transition-transform ${
                  release ? "bg-tunify-gradient hover:scale-[1.02] active:scale-[0.98]" : "cursor-not-allowed bg-ink-700 opacity-60"
                }`}
                onClick={(e) => {
                  if (!release) e.preventDefault();
                }}
              >
                <Download className="h-5 w-5" />
                Download {appName}
              </a>
              <p className="text-center text-xs text-mist-400 lg:text-left">
                By downloading, you agree to the Terms of Service and Privacy Policy below.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
