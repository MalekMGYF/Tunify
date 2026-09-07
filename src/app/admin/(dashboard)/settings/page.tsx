export const dynamic = "force-dynamic";

import { getSettings } from "@/lib/db/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-mist-100">Settings</h1>
      <p className="mt-1 text-sm text-mist-400">
        Editable public information shown on the website. Server secrets and credentials are never shown here.
      </p>

      <div className="mt-8">
        <SettingsForm initial={settings} />
      </div>
    </div>
  );
}
