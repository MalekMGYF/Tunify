"use client";

import { useState, type FormEvent } from "react";

type Initial = {
  appName: string;
  description: string;
  websiteTitle: string;
  supportedPlatforms: string[];
  socialTwitter: string;
  socialGithub: string;
  socialDiscord: string;
  contactEmail: string;
};

export default function SettingsForm({ initial }: { initial: Initial }) {
  const [appName, setAppName] = useState(initial.appName);
  const [description, setDescription] = useState(initial.description);
  const [websiteTitle, setWebsiteTitle] = useState(initial.websiteTitle);
  const [platforms, setPlatforms] = useState(initial.supportedPlatforms.join(", "));
  const [socialTwitter, setSocialTwitter] = useState(initial.socialTwitter);
  const [socialGithub, setSocialGithub] = useState(initial.socialGithub);
  const [socialDiscord, setSocialDiscord] = useState(initial.socialDiscord);
  const [contactEmail, setContactEmail] = useState(initial.contactEmail);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appName,
        description,
        websiteTitle,
        supportedPlatforms: platforms.split(",").map((p) => p.trim()).filter(Boolean),
        socialTwitter,
        socialGithub,
        socialDiscord,
        contactEmail,
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Failed to save settings");
      return;
    }
    setSaved(true);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5 rounded-2xl border border-white/8 bg-ink-900/60 p-6">
      <Field label="App name">
        <input value={appName} onChange={(e) => setAppName(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Description">
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Website title">
        <input value={websiteTitle} onChange={(e) => setWebsiteTitle(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Supported platforms" hint="Comma-separated, e.g. Windows, macOS">
        <input value={platforms} onChange={(e) => setPlatforms(e.target.value)} className={inputClass} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-3">
        <Field label="Twitter URL">
          <input value={socialTwitter} onChange={(e) => setSocialTwitter(e.target.value)} className={inputClass} />
        </Field>
        <Field label="GitHub URL">
          <input value={socialGithub} onChange={(e) => setSocialGithub(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Discord URL">
          <input value={socialDiscord} onChange={(e) => setSocialDiscord(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Contact email">
        <input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={inputClass} />
      </Field>

      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      {saved && <p className="text-sm text-emerald-400">Settings saved</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-tunify-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-glow disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-3.5 py-2.5 text-sm text-mist-100 outline-none focus:border-violet-light";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-mist-300">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-mist-400">{hint}</span>}
    </label>
  );
}
