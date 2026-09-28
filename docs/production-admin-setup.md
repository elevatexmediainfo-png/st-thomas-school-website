# Production Admin Setup

## Environment

Copy `.env.example` to `.env.local` for local development. Keep `.env.local` and production secrets out of Git; `.env*` files are ignored, while `.env.example` is explicitly allowed.

Configure these values in the deployment platform's secret/environment settings:

- `DATABASE_URL`: PostgreSQL connection string used by Prisma.
- `AUTH_SECRET`: a stable, random secret with at least 32 bytes of entropy. Generate one locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`, then paste its output directly into the deployment secret manager. Do not commit it, print it in logs, or rotate it without planning to invalidate existing sessions.
- `AUTH_TRUST_HOST`: set to `true` only when the deployment platform's proxy/host setup requires Auth.js trusted-host mode.

Do not send actual secret values through chat or commit them to source control.

## First School Administrator

Set these environment variables temporarily in a protected operator shell or secret manager:

- `ADMIN_NAME`: the real administrator's display name.
- `ADMIN_EMAIL`: the real administrator's school email address.
- `ADMIN_PASSWORD`: a unique password of at least 14 characters. Use a password manager; do not use a shared/default password.
- `ADMIN_ROLE`: optional; defaults to `SUPER_ADMIN`. Supported values are `SUPER_ADMIN` and `CONTENT_ADMIN`.
- `DATABASE_URL`: the configured database connection.

Then run once:

```powershell
npm run admin:create
```

The script hashes the password with bcrypt before storage, takes a PostgreSQL advisory transaction lock, and refuses to run if any AdminUser already exists. It does not create a default account and does not print the password/hash. Remove the temporary `ADMIN_PASSWORD` from the operator environment after setup. If a first account must be repaired later, use a separately reviewed account-management procedure rather than rerunning bootstrap.

## Media Storage

No media storage provider or credentials are currently configured. `src/lib/media-storage.ts` defines the provider-neutral `MediaStorage` interface (`upload` and `delete`), and `/api/admin/media` is authenticated, validates image type/size and storage keys, and returns HTTP 503 while no provider adapter is installed. It never writes files locally.

To enable uploads later, select an S3-compatible provider and implement its adapter in `getMediaStorage()` without exposing credentials to the browser. Configure server-only variables:

- `MEDIA_STORAGE_PROVIDER` (for example, `s3-compatible`)
- `MEDIA_STORAGE_BUCKET`
- `MEDIA_STORAGE_REGION`
- `MEDIA_STORAGE_ENDPOINT` (provider endpoint, when required)
- `MEDIA_STORAGE_ACCESS_KEY_ID`
- `MEDIA_STORAGE_SECRET_ACCESS_KEY`
- `MEDIA_STORAGE_PUBLIC_BASE_URL` (or replace public URLs with an authenticated/signed URL strategy)

Use a private bucket and an explicit public-delivery policy appropriate to school photos. Never commit these values. The API currently supports JPEG, PNG, WebP, and AVIF uploads up to 8 MB, verifies file signatures, and accepts same-origin authenticated requests only. Image URL/key/alt-text columns are optional; empty images continue to render neutral placeholders. Replacement cleanup runs after record saves; cleanup failures are logged without exposing object keys and may require provider-side/manual cleanup.

## Security and QA Notes

All `/admin/*` paths except `/admin/login` are guarded by the existing Auth.js proxy, and mutation server actions call `auth()` again. Admission enquiry listing is a server-rendered admin route; no public enquiry API exists. Anonymous enquiry submission can create one validated record but cannot list, search, or read existing enquiries.
