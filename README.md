# Tunify — Website + Admin Dashboard + Release Management

A full-stack platform for Tunify: a public download website and an
admin dashboard for managing releases, backed by a real PostgreSQL
database, real authentication, real file storage, and real streaming
downloads. Nothing here is a placeholder — see "What was actually
tested" below for exactly what was verified end-to-end.

## Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, lucide-react
- **Backend:** Next.js Route Handlers
- **Database:** PostgreSQL, accessed via hand-written parameterized SQL (`pg`) — see "About the data layer" below for why this replaced Prisma Client at runtime
- **Auth:** bcrypt password hashing + signed, httpOnly JWT session cookies (`jose`)
- **Storage:** pluggable `StorageProvider` — local filesystem in dev, S3-compatible in production
- **Validation:** Zod

## Project structure

```
tunify-platform/
├── prisma/
│   ├── schema.prisma            # Authoritative DB schema + docs
│   └── migrations/               # SQL migrations matching the schema
├── scripts/
│   └── create-admin.ts           # Interactive first-admin setup
├── src/
│   ├── middleware.ts              # Protects /admin/* routes
│   ├── config/app.ts              # Static content (features, FAQ, install steps)
│   ├── types/db.ts                 # Shared row types
│   ├── lib/
│   │   ├── auth/                  # password.ts, session.ts, guard.ts
│   │   ├── db/                    # pool.ts, admins.ts, releases.ts, settings.ts
│   │   ├── storage/                # types.ts, local-provider.ts, s3-provider.ts, index.ts
│   │   ├── validation/schemas.ts   # Zod schemas + upload validation
│   │   ├── rate-limit.ts
│   │   └── version.ts              # Numeric version comparison (never string-sort)
│   ├── components/
│   │   ├── public/                 # Navbar, Hero, Features, AppPreview, DownloadSection, InstallationSteps, FAQ, Footer
│   │   └── admin/                  # Sidebar, StatusBadge, ReleasesTable, UploadWidget, EditReleaseForm, SettingsForm
│   └── app/
│       ├── page.tsx                 # Public homepage (/)
│       ├── releases/page.tsx        # Public release history (/releases)
│       ├── admin/
│       │   ├── login/page.tsx
│       │   └── (dashboard)/         # Sidebar-wrapped, session-protected
│       │       ├── page.tsx          # /admin — overview
│       │       ├── releases/page.tsx # /admin/releases
│       │       ├── releases/new/page.tsx
│       │       ├── releases/[id]/edit/page.tsx
│       │       └── settings/page.tsx
│       └── api/
│           ├── auth/{login,logout,me}/route.ts
│           ├── releases/route.ts                      # GET (public list / ?all=1 admin), POST (admin create)
│           ├── releases/[id]/route.ts                  # GET, PUT, DELETE
│           ├── releases/[id]/upload/route.ts           # POST — attach/replace file
│           ├── releases/[id]/publish/route.ts
│           ├── releases/[id]/archive/route.ts
│           ├── releases/[id]/stats/route.ts
│           ├── releases/[id]/download/route.ts         # Streams a specific release
│           ├── releases/latest/route.ts
│           ├── releases/latest/download/route.ts       # Streams whichever release is current
│           └── settings/route.ts                       # GET (public), PUT (admin)
```

## About the data layer (please read)

The Prisma schema (`prisma/schema.prisma`) is the real, authoritative,
version-controlled definition of the database — that part is exactly
what was requested. At **runtime**, though, this app queries Postgres
through hand-written parameterized SQL in `src/lib/db/*.ts` instead of
a generated Prisma Client.

Why: `prisma generate` and `prisma migrate` both need to download a
platform-specific query-engine binary from Prisma's CDN on first run.
The sandbox this was built in blocks that download (network egress
allowlist), so a Prisma Client could never actually be generated or
exercised here. Rather than hand you ORM calls that were never run
against a real database, every query was written directly against the
schema and **tested against a live local Postgres instance** (see
below) — admin creation, login, release CRUD, publish/archive logic,
file upload, and streaming downloads all really work.

If your machine has normal internet access, switching back to Prisma
Client is straightforward:
1. `npm install @prisma/client`
2. Add back `previewFeatures` if you want driver adapters, or just use the default engine
3. `npx prisma generate`
4. Replace the query bodies in `src/lib/db/*.ts` with `prisma.<model>.*` calls — the exported function signatures (`getReleaseById`, `createRelease`, `publishRelease`, etc.) were kept ORM-shaped specifically so this swap doesn't ripple into the API routes that call them.

The `prisma` CLI is still a dependency so you can use `prisma migrate`
for schema changes going forward; it just isn't used to serve queries
in this build.

## What was actually tested

This exact sequence was run against a live PostgreSQL database and a
production build of this app (not `next dev`, the real `next build` +
`next start`):

1. Created an admin (hashed password, stored, never plaintext).
2. Logged in via `/api/auth/login`, got a real httpOnly session cookie.
3. Created a `1.0.0` draft release.
4. Confirmed **publishing was blocked** with a 422 because no file was attached yet.
5. Uploaded a 2 MB test binary via `/api/releases/:id/upload`; confirmed it landed outside the app's source tree under a randomized filename.
6. Published `1.0.0`; confirmed it became the public "current" release.
7. Downloaded it via the public, unauthenticated `/api/releases/latest/download` — the response was **byte-for-byte identical** to the uploaded file, with correct `Content-Type`/`Content-Disposition` headers.
8. Downloaded it twice more and confirmed the download counter incremented exactly once per download (not per page view).
9. Created, uploaded, and published `1.1.0`.
10. Confirmed the public homepage and API **immediately** reflected `1.1.0` as current, with **zero frontend code changes**.
11. Confirmed `1.0.0` remained in `/releases` history with its download count untouched, and its specific download link still streamed its own (older) file correctly.
12. Confirmed deleting the currently-published release was **blocked with a 409**, exactly as the spec requires.
13. Confirmed an unauthenticated request to a protected admin endpoint was **rejected with 401**.
14. Confirmed the admin dashboard and releases table pages render this real data (not mocked).

What was **not** tested live: the S3 storage provider (no S3 credentials in this environment — the code path is implemented and type-checked against the AWS SDK, but only the local filesystem provider was exercised), and the production Google Fonts fetch (blocked by the same sandbox network policy — this only affects font loading, not functionality, and works normally on any machine with internet access).

## Running it locally

Requirements: Node.js 18+, PostgreSQL.

```bash
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and SESSION_SECRET

# Create the database schema. If you have full internet access:
npx prisma migrate dev
# If Prisma's engine download is blocked in your environment, apply
# prisma/migrations/*/migration.sql directly with psql instead — it's
# plain SQL and matches the schema exactly.

npm run create-admin
# Prompts for an email and a password (min 10 characters) — never
# creates default credentials.

npm run dev
```

Visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the dashboard.

## Environment variables

See `.env.example`. Never commit a real `.env` file.

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — long random string signing admin sessions (`openssl rand -base64 48`)
- `STORAGE_PROVIDER` — `local` or `s3`
- `STORAGE_LOCAL_PATH` — where release files live in dev (kept outside the app directory)
- `STORAGE_BUCKET` / `STORAGE_REGION` / `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` / `STORAGE_ENDPOINT` — S3-compatible storage config (works with AWS S3, Cloudflare R2, Backblaze B2, MinIO, etc.)
- `MAX_UPLOAD_SIZE` — e.g. `500MB` or `2GB`

None of these are ever sent to the browser — they're only read in server-side code (Route Handlers, `lib/`, `scripts/`).

## Deploying to production

1. Provision a PostgreSQL database and set `DATABASE_URL`.
2. Set a strong, unique `SESSION_SECRET`.
3. Set `STORAGE_PROVIDER=s3` and fill in your S3-compatible bucket credentials — a filesystem-based store doesn't survive redeploys on most serverless/container hosts.
4. Run your migrations (`npx prisma migrate deploy`, or apply the SQL directly).
5. Run `npm run create-admin` once, in an environment with access to your production database, to create the first admin.
6. `npm run build && npm start`, or deploy to your platform of choice (Vercel, Render, Fly.io, a VPS, etc.) — this is a standard Next.js app.

## Security notes

- Passwords are hashed with bcrypt (12 rounds); plaintext is never stored or logged.
- Sessions are signed JWTs in httpOnly, secure (in production), sameSite cookies — verified server-side on every request via `middleware.ts` **and** independently inside every admin API route (`lib/auth/guard.ts`), since middleware alone is never trusted as the sole gate.
- Login is rate-limited per IP (in-memory — for multi-instance production deployments, swap this for a shared store like Redis).
- Uploaded filenames are never trusted: extension and MIME type are checked against an allow-list, and files are stored under a randomly generated name outside the app's source tree.
- Uploads are validated, stored, and *verified stored* before the release record is updated — and a replaced file's old copy is only deleted after the new one is confirmed safe, so a failed upload or replacement never corrupts a release.
- Public API responses and admin API responses both go through explicit allow-list mappers (`toPublicRelease`, `toAdminRelease`, `toPublicSettings`) — internal fields like the storage path are never serialized to any client, including the admin dashboard's own JS bundle.
- One known trade-off: Next.js Route Handlers buffer an uploaded file into memory via `formData()` before it's written to storage, so very large uploads (close to `MAX_UPLOAD_SIZE`) use that much server memory during upload. For high-volume production use, consider adding presigned direct-to-S3 uploads as a follow-up.
