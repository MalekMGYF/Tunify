"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import UploadWidget from "./UploadWidget";

type Initial = {
  id: string;
  version: string;
  title: string;
  platform: string;
  description: string;
  changelog: string;
  fileName: string;
};

export default function EditReleaseForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const [version, setVersion] = useState(initial.version);
  const [title, setTitle] = useState(initial.title);
  const [platform, setPlatform] = useState(initial.platform);
  const [description, setDescription] = useState(initial.description);
  const [changelog, setChangelog] = useState(initial.changelog);
  const [showReplace, setShowReplace] = useState(false);
  const [fileName, setFileName] = useState(initial.fileName);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch(`/api/releases/${initial.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, title, platform, description, changelog }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save changes");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSave} className="space-y-5 rounded-2xl border border-white/8 bg-ink-900/60 p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Version">
          <input value={version} onChange={(e) => setVersion(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Platform">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClass}>
            <option>Windows</option>
            <option>macOS</option>
            <option>Linux</option>
          </select>
        </Field>
      </div>

      <Field label="Release title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Description">
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </Field>

      <Field label="Changelog">
        <textarea rows={5} value={changelog} onChange={(e) => setChangelog(e.target.value)} className={inputClass} />
      </Field>

      <div>
        <p className="mb-1.5 text-sm text-mist-300">Application file</p>
        <p className="text-sm text-mist-400">{fileName || "No file attached yet"}</p>
        {!showReplace ? (
          <button
            type="button"
            onClick={() => setShowReplace(true)}
            className="mt-2 text-sm text-violet-light hover:underline"
          >
            Replace file
          </button>
        ) : (
          <div className="mt-3">
            <UploadWidget
              releaseId={initial.id}
              onUploaded={(f) => {
                setFileName(f.fileName);
                setShowReplace(false);
              }}
            />
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Changes saved</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-light";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-mist-300">{label}</span>
      {children}
    </label>
  );
}
