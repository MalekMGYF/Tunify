export const dynamic = "force-dynamic";

import Link from "next/link";
import { getDashboardStats, listAllReleasesForAdmin, toAdminRelease } from "@/lib/db/releases";
import StatusBadge from "@/components/admin/StatusBadge";

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return mb >= 1024 ? `${(mb / 1024).toFixed(2)} GB` : `${mb.toFixed(1)} MB`;
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(date));
}

export default async function AdminDashboardPage() {
  const [stats, releases] = await Promise.all([getDashboardStats(), listAllReleasesForAdmin()]);
  const recent = releases.slice(0, 5).map(toAdminRelease);

  const cards = [
    { label: "Total releases", value: stats.totalReleases },
    { label: "Published", value: stats.publishedReleases },
    { label: "Drafts", value: stats.draftReleases },
    { label: "Archived", value: stats.archivedReleases },
    { label: "Total downloads", value: stats.totalDownloads.toLocaleString() },
  ];

  return (
    <div id="stats">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-mist-100">Dashboard</h1>
        <p className="text-sm text-mist-400">An overview of your Tunify releases.</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-white/8 bg-ink-900/60 p-4">
            <p className="text-xs text-mist-400">{card.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-mist-100">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-ink-900/60 p-6">
          <h2 className="text-sm font-semibold text-mist-100">Latest release</h2>
          {stats.currentRelease ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-display text-lg font-semibold text-mist-100">{stats.currentRelease.title}</p>
              <p className="text-mist-400">Version {stats.currentRelease.version}</p>
              <p className="text-mist-400">Platform: {stats.currentRelease.platform}</p>
              <p className="text-mist-400">File size: {formatBytes(stats.currentRelease.fileSize)}</p>
              <p className="text-mist-400">Released: {formatDate(stats.currentRelease.publishedAt)}</p>
              <p className="text-mist-400">Downloads: {stats.currentRelease.downloadCount.toLocaleString()}</p>
              <div className="pt-1">
                <StatusBadge status={stats.currentRelease.status} />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-mist-400">No release is currently published.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/8 bg-ink-900/60 p-6">
          <h2 className="text-sm font-semibold text-mist-100">Most downloaded</h2>
          {stats.mostDownloadedRelease && stats.mostDownloadedRelease.downloadCount > 0 ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="font-display text-lg font-semibold text-mist-100">{stats.mostDownloadedRelease.title}</p>
              <p className="text-mist-400">Version {stats.mostDownloadedRelease.version}</p>
              <p className="text-mist-400">
                {stats.mostDownloadedRelease.downloadCount.toLocaleString()} download
                {stats.mostDownloadedRelease.downloadCount === 1 ? "" : "s"}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-mist-400">No downloads recorded yet.</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-mist-100">Recent releases</h2>
          <Link href="/admin/releases" className="text-xs text-violet-light hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/8">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-ink-900/60 text-xs text-mist-400">
              <tr>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Downloads</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-mist-400">
                    No releases yet.
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={r.id} className="text-mist-300">
                    <td className="px-4 py-3 font-medium text-mist-100">{r.version}</td>
                    <td className="px-4 py-3">{r.platform}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">{r.downloadCount.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
