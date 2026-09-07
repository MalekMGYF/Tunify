export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getReleaseById } from "@/lib/db/releases";
import EditReleaseForm from "@/components/admin/EditReleaseForm";

export default async function EditReleasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = await getReleaseById(id);
  if (!release) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-mist-100">Edit release</h1>
      <p className="mt-1 text-sm text-mist-400">{release.title}</p>

      <div className="mt-8">
        <EditReleaseForm
          initial={{
            id: release.id,
            version: release.version,
            title: release.title,
            platform: release.platform,
            description: release.description,
            changelog: release.changelog,
            fileName: release.fileName,
          }}
        />
      </div>
    </div>
  );
}
