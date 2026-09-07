export const dynamic = "force-dynamic";

import Link from "next/link";
import { Plus } from "lucide-react";
import { listAllReleasesForAdmin, toAdminRelease } from "@/lib/db/releases";
import ReleasesTable from "@/components/admin/ReleasesTable";

export default async function AdminReleasesPage() {
  const releases = await listAllReleasesForAdmin();
  const serializable = releases.map((r) => {
    const admin = toAdminRelease(r);
    return { ...admin, createdAt: admin.createdAt.toISOString() };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-mist-100">Releases</h1>
          <p className="text-sm text-mist-400">Manage every Tunify release.</p>
        </div>
        <Link
          href="/admin/releases/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-tunify-gradient px-4 py-2 text-sm font-semibold text-white shadow-glow"
        >
          <Plus className="h-4 w-4" /> New release
        </Link>
      </div>

      <div className="mt-6">
        <ReleasesTable releases={serializable} />
      </div>
    </div>
  );
}
