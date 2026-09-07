import { Pool } from "pg";

/**
 * Direct PostgreSQL access via node-postgres.
 *
 * The project ships a Prisma schema (prisma/schema.prisma) as the
 * authoritative, version-controlled definition of the database
 * structure — migrations are generated and reviewed through Prisma
 * as normal. At runtime, however, this app talks to Postgres directly
 * through this lightweight query layer rather than the generated
 * Prisma Client.
 *
 * Why: `prisma generate` and `prisma migrate` both need to download a
 * platform-specific query-engine binary from Prisma's CDN on first
 * run. In this project's sandboxed build/test environment that
 * download is blocked by network policy, which made it impossible to
 * generate or exercise a real Prisma Client here. Rather than ship
 * ORM calls that were never actually run against a database, every
 * query in src/lib/db/*.ts is hand-written SQL against the exact
 * schema Prisma defines, and has been executed against a live
 * Postgres instance as part of building this feature.
 *
 * If your deployment environment has normal internet access, you can
 * switch back to `@prisma/client` by running `npx prisma generate`
 * and swapping the query bodies in this folder for the equivalent
 * `prisma.<model>.*` calls — the exported function signatures in
 * releases.ts and settings.ts are intentionally kept ORM-shaped so
 * that swap doesn't ripple into the API routes that call them.
 */
const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
