"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import UploadWidget from "@/components/admin/UploadWidget";

type Step = "form" | "upload" | "ready";

export default function NewReleasePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("Windows");
  const [description, setDescription] = useState("");
  const [changelog, setChangelog] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/releases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version, title, platform, description, changelog }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to create release");
      return;
    }

    setReleaseId(data.release.id);
    setStep("upload");
  }

  async function handlePublish() {
    if (!releaseId) return;
    if (!confirm(`Publish ${title || version}?`)) return;
    setSubmitting(true);
    const res = await fetch(`/api/releases/${releaseId}/publish`, { method: "POST" });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Failed to publish");
      return;
    }
    setStatusMessage("Published successfully");
    setTimeout(() => router.push("/admin/releases"), 900);
  }

  function handleSaveDraft() {
    setStatusMessage("Draft saved");
    setTimeout(() => router.push("/admin/releases"), 900);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-mist-100">Upload release</h1>
      <p className="mt-1 text-sm text-mist-400">Create a new Tunify release and attach its application file.</p>

      {step === "form" && (
        <form onSubmit={handleCreate} className="mt-8 space-y-5 rounded-2xl border border-white/8 bg-ink-900/60 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Version" required>
              <input
                required
                placeholder="1.2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Platform" required>
              <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputClass}>
                <option>Windows</option>
                <option>macOS</option>
                <option>Linux</option>
              </select>
            </Field>
          </div>

          <Field label="Release title" required>
            <input
              required
              placeholder="Tunify 1.2.0"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows={2}
              placeholder="Short summary shown on the public download card"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Changelog">
            <textarea
              rows={4}
              placeholder={"Improved player\nFixed playlist issues\nImproved performance"}
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className={inputClass}
            />
          </Field>

          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Continue to upload"}
          </button>
        </form>
      )}

      {step === "upload" && releaseId && (
        <div className="mt-8 space-y-6 rounded-2xl border border-white/8 bg-ink-900/60 p-6">
          <UploadWidget releaseId={releaseId} onUploaded={() => setStep("ready")} />
        </div>
      )}

      {step === "ready" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handlePublish}
            disabled={submitting}
            className="rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
          >
            Publish release
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-mist-100 hover:bg-white/5"
          >
            Save as draft
          </button>
          {statusMessage && <span className="text-sm text-emerald-400">{statusMessage}</span>}
          {error && <span className="text-sm text-red-400">{error}</span>}
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-light";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-mist-300">
        {label}
        {required && <span className="text-magenta-light"> *</span>}
      </span>
      {children}
    </label>
  );
}
