"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Rocket, Archive, Trash2, Eye, Link as LinkIcon } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { ReleaseStatus } from "@/types/db";

type AdminRelease = {
  id: string;
  version: string;
  title: string;
  platform: string;
  status: ReleaseStatus;
  isCurrent: boolean;
  downloadCount: number;
  createdAt: string;
};

export default function ReleasesTable({ releases }: { releases: AdminRelease[] }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handlePublish(release: AdminRelease) {
    if (!confirm(`Publish ${release.title}? It will become the current download for ${release.platform}.`)) return;
    setBusyId(release.id);
    setError(null);
    const res = await fetch(`/api/releases/${release.id}/publish`, { method: "POST" });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(data.error || "Failed to publish release");
      return;
    }
    router.refresh();
  }

  async function handleArchive(release: AdminRelease) {
    if (!confirm(`Archive ${release.title}? It will stay in release history but won't be the current download.`)) return;
    setBusyId(release.id);
    setError(null);
    const res = await fetch(`/api/releases/${release.id}/archive`, { method: "POST" });
    const data = await res.json();
    setBusyId(null);
    if (!res.ok) {
      setError(data.error || "Failed to archive release");
      return;
    }
    router.refresh();
  }

  async function handleDelete(release: AdminRelease) {
    if (release.isCurrent) {
      alert("This is the current published release. Archive it or publish another release first, then delete.");
      return;
    }
    if (!confirm(`Permanently delete ${release.title}? This cannot be undone.`)) return;
    setBusyId(release.id);
    setError(null);
    const res = await fetch(`/api/releases/${release.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    setBusyId(null);
    if (!res.ok) {
      setError(data.error || "Failed to delete release");
      return;
    }
    router.refresh();
  }

  function handleCopyLink(release: AdminRelease) {
    const url = `${window.location.origin}/api/releases/${release.id}/download`;
    navigator.clipboard.writeText(url);
    setCopiedId(release.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (releases.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-ink-900/60 p-8 text-center text-sm text-mist-400">
        No releases yet.{" "}
        <Link href="/admin/releases/new" className="text-violet-light hover:underline">
          Upload your first one
        </Link>
        .
      </div>
    );
  }

  return (
    <div>
      {error && <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-white/8 md:block">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-ink-900/60 text-xs text-mist-400">
            <tr>
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">Platform</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Downloads</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/8">
            {releases.map((r) => (
              <tr key={r.id} className="text-mist-300">
                <td className="px-4 py-3 font-medium text-mist-100">
                  {r.version}
                  {r.isCurrent && <span className="ml-2 text-xs text-violet-light">current</span>}
                </td>
                <td className="px-4 py-3">{r.platform}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{r.downloadCount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <RowActions
                    release={r}
                    busy={busyId === r.id}
                    copied={copiedId === r.id}
                    onPublish={() => handlePublish(r)}
                    onArchive={() => handleArchive(r)}
                    onDelete={() => handleDelete(r)}
                    onCopy={() => handleCopyLink(r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {releases.map((r) => (
          <div key={r.id} className="rounded-2xl border border-white/8 bg-ink-900/60 p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-mist-100">
                {r.version} {r.isCurrent && <span className="text-xs text-violet-light">current</span>}
              </p>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-1 text-xs text-mist-400">
              {r.platform} · {new Date(r.createdAt).toLocaleDateString()} · {r.downloadCount.toLocaleString()} downloads
            </p>
            <div className="mt-3">
              <RowActions
                release={r}
                busy={busyId === r.id}
                copied={copiedId === r.id}
                onPublish={() => handlePublish(r)}
                onArchive={() => handleArchive(r)}
                onDelete={() => handleDelete(r)}
                onCopy={() => handleCopyLink(r)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RowActions({
  release,
  busy,
  copied,
  onPublish,
  onArchive,
  onDelete,
  onCopy,
}: {
  release: AdminRelease;
  busy: boolean;
  copied: boolean;
  onPublish: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/releases/${release.id}/edit`}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-mist-300 hover:bg-white/5 hover:text-mist-100"
      >
        <Pencil className="h-3.5 w-3.5" /> Edit
      </Link>
      {release.status !== "PUBLISHED" && (
        <button
          type="button"
          disabled={busy}
          onClick={onPublish}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-emerald-300 hover:bg-white/5 disabled:opacity-50"
        >
          <Rocket className="h-3.5 w-3.5" /> Publish
        </button>
      )}
      {release.status === "PUBLISHED" && (
        <button
          type="button"
          disabled={busy}
          onClick={onArchive}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-amber-300 hover:bg-white/5 disabled:opacity-50"
        >
          <Archive className="h-3.5 w-3.5" /> Archive
        </button>
      )}
      <a
        href={`/api/releases/${release.id}/download`}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-mist-300 hover:bg-white/5 hover:text-mist-100"
      >
        <Eye className="h-3.5 w-3.5" /> View
      </a>
      <button
        type="button"
        onClick={onCopy}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-mist-300 hover:bg-white/5 hover:text-mist-100"
      >
        <LinkIcon className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy link"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-red-300 hover:bg-white/5 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
    </div>
  );
}
