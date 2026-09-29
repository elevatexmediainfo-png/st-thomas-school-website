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

Cloudinary is the configured media provider when all three server-only variables are present:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Never expose these variables to browser code or prefix them with `NEXT_PUBLIC_`. The adapter stores images under controlled `school/<UUID>.<extension>` keys and maps them to Cloudinary public IDs under the `school/` prefix. Users cannot choose arbitrary public IDs. The API supports JPEG, PNG, WebP, and AVIF uploads up to 8 MB, verifies file signatures, and accepts same-origin authenticated requests only. Manual HTTPS URLs remain supported even when Cloudinary is not configured. If any Cloudinary variable is missing, uploads return HTTP 503 and no file is stored.

Create a Cloudinary account and configure the three variables in the Vercel server environment. Use a dedicated Cloudinary folder/policy for school media and review delivery/privacy settings for school photos. Replacement cleanup runs after record saves; cleanup failures are logged without exposing object keys and may require provider-side/manual cleanup.

## Security and QA Notes

All `/admin/*` paths except `/admin/login` are guarded by the existing Auth.js proxy, and mutation server actions call `auth()` again. Admission enquiry listing is a server-rendered admin route; no public enquiry API exists. Anonymous enquiry submission can create one validated record but cannot list, search, or read existing enquiries.
