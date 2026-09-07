import { randomUUID } from "node:crypto";
import { pool } from "./pool";
import { parseVersion } from "../version";
import type { ReleaseRow, ReleaseStatus } from "@/types/db";

/** Fields safe to return from public (unauthenticated) API endpoints. */
export function toPublicRelease(release: ReleaseRow) {
  return {
    id: release.id,
    version: release.version,
    title: release.title,
    description: release.description,
    changelog: release.changelog,
    platform: release.platform,
    fileName: release.fileName,
    fileSize: release.fileSize,
    downloadCount: release.downloadCount,
    publishedAt: release.publishedAt,
    createdAt: release.createdAt,
    // Deliberately omitted: storagePath, mimeType, status, isCurrent,
    // and anything else that reveals internal server details.
  };
}

/** Fields safe to return to authenticated admins (still no secrets). */
export function toAdminRelease(release: ReleaseRow) {
  return {
    id: release.id,
    version: release.version,
    title: release.title,
    description: release.description,
    changelog: release.changelog,
    platform: release.platform,
    fileName: release.fileName,
    fileSize: release.fileSize,
    mimeType: release.mimeType,
    status: release.status,
    isCurrent: release.isCurrent,
    downloadCount: release.downloadCount,
    createdAt: release.createdAt,
    updatedAt: release.updatedAt,
    publishedAt: release.publishedAt,
    // storagePath is intentionally omitted even from the admin view —
    // the admin UI never needs the raw internal path, only download
    // links that go through the API.
  };
}

const ORDER_BY_VERSION_DESC = `ORDER BY "versionMajor" DESC, "versionMinor" DESC, "versionPatch" DESC`;

export async function listPublishedReleases(): Promise<ReleaseRow[]> {
  const { rows } = await pool.query<ReleaseRow>(
    `SELECT * FROM "Release" WHERE status = 'PUBLISHED' ${ORDER_BY_VERSION_DESC}`
  );
  return rows;
}

export async function listAllReleasesForAdmin(): Promise<ReleaseRow[]> {
  const { rows } = await pool.query<ReleaseRow>(`SELECT * FROM "Release" ORDER BY "createdAt" DESC`);
  return rows;
}

export async function getCurrentRelease(platform?: string): Promise<ReleaseRow | null> {
  const { rows } = await pool.query<ReleaseRow>(
    platform
      ? `SELECT * FROM "Release" WHERE status = 'PUBLISHED' AND "isCurrent" = true AND platform = $1 ${ORDER_BY_VERSION_DESC} LIMIT 1`
      : `SELECT * FROM "Release" WHERE status = 'PUBLISHED' AND "isCurrent" = true ${ORDER_BY_VERSION_DESC} LIMIT 1`,
    platform ? [platform] : []
  );
  return rows[0] ?? null;
}

export async function getReleaseById(id: string): Promise<ReleaseRow | null> {
  const { rows } = await pool.query<ReleaseRow>(`SELECT * FROM "Release" WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

export async function createRelease(data: {
  version: string;
  title: string;
  description: string;
  changelog: string;
  platform: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
}): Promise<ReleaseRow> {
  const { major, minor, patch } = parseVersion(data.version);
  const id = randomUUID();
  const { rows } = await pool.query<ReleaseRow>(
    `INSERT INTO "Release"
      (id, version, "versionMajor", "versionMinor", "versionPatch", title, description, changelog,
       platform, "fileName", "storagePath", "fileSize", "mimeType", status, "isCurrent", "downloadCount",
       "createdAt", "updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'DRAFT',false,0, now(), now())
     RETURNING *`,
    [
      id,
      data.version,
      major,
      minor,
      patch,
      data.title,
      data.description,
      data.changelog,
      data.platform,
      data.fileName,
      data.storagePath,
      data.fileSize,
      data.mimeType,
    ]
  );
  return rows[0];
}

export async function updateReleaseMeta(
  id: string,
  data: Partial<{ version: string; title: string; description: string; changelog: string; platform: string }>
): Promise<ReleaseRow> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (data.version !== undefined) {
    const { major, minor, patch } = parseVersion(data.version);
    sets.push(`version = $${i++}`, `"versionMajor" = $${i++}`, `"versionMinor" = $${i++}`, `"versionPatch" = $${i++}`);
    values.push(data.version, major, minor, patch);
  }
  if (data.title !== undefined) {
    sets.push(`title = $${i++}`);
    values.push(data.title);
  }
  if (data.description !== undefined) {
    sets.push(`description = $${i++}`);
    values.push(data.description);
  }
  if (data.changelog !== undefined) {
    sets.push(`changelog = $${i++}`);
    values.push(data.changelog);
  }
  if (data.platform !== undefined) {
    sets.push(`platform = $${i++}`);
    values.push(data.platform);
  }

  sets.push(`"updatedAt" = now()`);
  values.push(id);

  const { rows } = await pool.query<ReleaseRow>(
    `UPDATE "Release" SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
    values
  );
  return rows[0];
}

export async function replaceReleaseFile(
  id: string,
  file: { fileName: string; storagePath: string; fileSize: number; mimeType: string }
): Promise<ReleaseRow> {
  const { rows } = await pool.query<ReleaseRow>(
    `UPDATE "Release"
     SET "fileName" = $1, "storagePath" = $2, "fileSize" = $3, "mimeType" = $4, "updatedAt" = now()
     WHERE id = $5
     RETURNING *`,
    [file.fileName, file.storagePath, file.fileSize, file.mimeType, id]
  );
  return rows[0];
}

/**
 * Publishes a release and makes it "current" for its platform,
 * atomically demoting whichever release was previously current for
 * that same platform. Never deletes the previous release.
 */
export async function publishRelease(id: string): Promise<ReleaseRow> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows: existingRows } = await client.query<ReleaseRow>(`SELECT * FROM "Release" WHERE id = $1 FOR UPDATE`, [id]);
    const release = existingRows[0];
    if (!release) throw new Error("Release not found");

    await client.query(
      `UPDATE "Release" SET "isCurrent" = false WHERE platform = $1 AND "isCurrent" = true AND id <> $2`,
      [release.platform, id]
    );

    const { rows } = await client.query<ReleaseRow>(
      `UPDATE "Release" SET status = 'PUBLISHED', "isCurrent" = true, "publishedAt" = now(), "updatedAt" = now()
       WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");
    return rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function archiveRelease(id: string): Promise<ReleaseRow> {
  const { rows } = await pool.query<ReleaseRow>(
    `UPDATE "Release" SET status = 'ARCHIVED', "isCurrent" = false, "updatedAt" = now() WHERE id = $1 RETURNING *`,
    [id]
  );
  return rows[0];
}

export async function setReleaseStatus(id: string, status: ReleaseStatus): Promise<ReleaseRow> {
  const { rows } = await pool.query<ReleaseRow>(
    `UPDATE "Release" SET status = $1, "updatedAt" = now() WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return rows[0];
}

export async function deleteReleaseRecord(id: string): Promise<void> {
  await pool.query(`DELETE FROM "Release" WHERE id = $1`, [id]);
}

/**
 * Only increments when the download actually starts streaming —
 * called from inside the download route handlers, never from a page
 * view or release-detail fetch.
 */
export async function incrementDownloadCount(id: string): Promise<void> {
  await pool.query(`UPDATE "Release" SET "downloadCount" = "downloadCount" + 1 WHERE id = $1`, [id]);
}

export async function getDashboardStats() {
  const [totalsRes, downloadsRes, currentRes, mostDownloadedRes] = await Promise.all([
    pool.query<{ status: ReleaseStatus; count: string }>(`SELECT status, COUNT(*)::text AS count FROM "Release" GROUP BY status`),
    pool.query<{ sum: string | null }>(`SELECT SUM("downloadCount")::text AS sum FROM "Release"`),
    pool.query<ReleaseRow>(`SELECT * FROM "Release" WHERE "isCurrent" = true ${ORDER_BY_VERSION_DESC} LIMIT 1`),
    pool.query<ReleaseRow>(`SELECT * FROM "Release" ORDER BY "downloadCount" DESC LIMIT 1`),
  ]);

  const counts: Record<ReleaseStatus, number> = { DRAFT: 0, PUBLISHED: 0, ARCHIVED: 0 };
  for (const row of totalsRes.rows) {
    counts[row.status] = Number(row.count);
  }

  return {
    totalReleases: counts.DRAFT + counts.PUBLISHED + counts.ARCHIVED,
    publishedReleases: counts.PUBLISHED,
    draftReleases: counts.DRAFT,
    archivedReleases: counts.ARCHIVED,
    totalDownloads: Number(downloadsRes.rows[0]?.sum ?? 0),
    currentRelease: currentRes.rows[0] ?? null,
    mostDownloadedRelease: mostDownloadedRes.rows[0] ?? null,
  };
}
