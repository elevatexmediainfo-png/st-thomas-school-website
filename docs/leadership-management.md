# Leadership & Management

## Content ownership

- `/admin/principal` remains the sole editor of the existing Principal fields and photograph in `SchoolSetting`.
- `/admin/leadership` owns Chairman, Co-signatory / Manager, and unlimited custom profiles in `LeadershipMember`.
- General Settings and Website Content link to these editors and cannot overwrite their fields.
- Default role keys are unique; custom profiles have a null key. Default positions are unpublished rather than deleted.
- Existing public URLs and the homepage use `getPublishedLeadership()`. Draft/unpublished content has no public fallback. Incomplete profiles are omitted even if legacy data marks them published.
- Lower order values come first; ties sort by stable ID. Only the homepage preview is limited to three cards.
- Principal profile timestamps start at migration time for legacy data. The historical profile creation time is unknown. `SchoolSetting.updatedAt` is used for conservative stale-editor detection.
- Published edits go live immediately. Draft status is not a separate pending revision of published content.

## Database safety and local validation

No production operation is part of this change. Do not use the application's `.env.local` or ordinary `DATABASE_URL` for migration testing.

Create a disposable, direct local PostgreSQL database named `leadership_test` or `leadership_test_<lowercase suffix>`. Use a dedicated local database role with privileges limited to that database. A loopback tunnel to production is **not** an isolated database.

Provide `LEADERSHIP_DEV_DATABASE_URL` through a protected local shell and explicitly confirm `LEADERSHIP_ALLOW_ISOLATED_DB=yes`. The development tools accept only loopback PostgreSQL URLs and reject query parameters. They never load dotenv or fall back to `DATABASE_URL`. Do not put passwords in command history or commit environment files.

After confirming the target is disposable:

```text
npx --no-install prisma migrate deploy --config prisma.leadership-dev.config.ts
node scripts/backfill-leadership.mjs
node tests/leadership-database.mjs
node --test tests/leadership.test.mjs
```

The SQL migration adds a new table, enum, and Principal metadata only. Original Principal fields and `chairmanDirectorMessage` remain untouched. The backfill copies a nonempty legacy Chairman message into a draft profile without inventing a name. It never overwrites an existing Chairman profile; reruns are safe. Manager setup is an explicit Admin action.

The database integration test rolls back its CRUD fixtures but intentionally executes the idempotent backfill on the disposable database. This is not a production test tool.

To exercise the UI and full build, set `DATABASE_URL` to the same disposable development database in the test process, with a development-only `AUTH_SECRET`. Create test admins there only. Use fake media or a separate development Cloudinary account. Never use production Cloudinary credentials for image-deletion tests.

Required manual integration checks: both admin roles; inactive/anonymous denial; valid and invalid uploads; save during upload; shared-image replacement and deletion; stale concurrent edits; all existing leadership URLs; publish/unpublish; empty and error states; keyboard navigation; 390/768/1440 px layouts; long names and 12,000-character messages; preservation of original Principal content and custom desk title.

## Separate Neon schema-only test mode (prepared, not executed)

The loopback validator, local Prisma config, backfill and database integration runner remain unchanged. The separate pure validator `scripts/leadership-neon-database.mjs` remains available for offline policy checks. `prisma.leadership-neon-test.config.ts` now unconditionally rejects execution with a fixed credential-free error before reading environment variables, importing Prisma, or constructing a datasource. No default script selects this config. This is a security interlock, not an operational Neon migration mode.

The pinned target is project `divine-art-25041479`, branch `leadership-test`, branch ID `br-jolly-union-b4k5c9vf`, direct hostname `ep-solitary-resonance-b4azpkaq.c-6.us-east-2.aws.neon.tech`, database `neondb`, role `neondb_owner`, port 5432 (explicit or default). No endpoint ID is inferred. Independently match endpoint/branch metadata and confirm schema-only provenance before future connection; environment acknowledgements are not metadata verification.

Required acknowledgements: `LEADERSHIP_ALLOW_NEON_TEST=yes`, `LEADERSHIP_NEON_PROJECT_ID`, `LEADERSHIP_NEON_BRANCH_ID`, `LEADERSHIP_NEON_BRANCH_NAME` matching the pinned values, and `LEADERSHIP_NEON_SCHEMA_ONLY=yes`. The sole URL input is `LEADERSHIP_NEON_TEST_DATABASE_URL`, supplied through protected process input in a separately authorized future session. No dotenv loading or fallback to application/local URL variables occurs. Never print or persist real credentials or connection URLs.

The validator rejects `NODE_ENV=production`, `VERCEL=1`, or `VERCEL_ENV=production` even when all target acknowledgements are valid. Both username and password undergo percent-decoding validation; malformed escapes, incomplete escapes and invalid UTF-8 are rejected with the same fixed error. Decoded credentials are not retained.

Downstream credential-leakage review: installed `@prisma/config/dist/index.js` logs datasource objects in `defineDatasource` and whole config objects while parsing exports. `@prisma/debug/dist/index.js` retains raw arguments in its history even when console logging is disabled; `getLogs` can later serialize them. Merely clearing DEBUG or using a plain config object is insufficient. The CLI in `prisma/build/cli.js` also includes schema-engine invocation, diagnostic/error/panic handling and some exact-URL replacement in caught errors, which does not prove redaction of individual or encoded credentials. Complete engine-path redaction has not been verified.

The Neon config therefore no longer passes a URL or datasource to Prisma at all. It fails before credential access; it never creates a client or enables query/debug logging. No global console or Prisma logger is patched in application/local execution. Synthetic tests exercise the installed Prisma config loader with wildcard debug enabled and inspect captured console calls, retained Prisma debug history, returned errors and error stacks. The blocked load and validator rejection contain no synthetic URL, username or password. Test assertions for leakage use fixed messages to avoid echoing tested secrets in failure reports. This verifies the rejection boundary only, not successful Prisma/engine execution. A credential-safe execution boundary remains required before re-enabling Neon migrations. The pure validator returns a credential-bearing string on success and must never be logged; it is not a redaction API.

For any future re-enabled migration path, installed Prisma 7.10.0's native migration engine requires `sslmode=require` and `channel_binding=require`; the offline validator adds `sslaccept=strict` in memory (also accepted explicitly). It rejects `verify-full`, which this engine's URL parser handles as unsupported and falls back to `prefer`. Unknown/duplicate query keys, routing overrides, pooled/alternate hosts, roles, databases, ports, fragments and malformed inputs fail with a fixed error excluding the URL. Certificate trust and a successful TLS handshake remain untested.

Runtime limitation: adapter-pg 7.10.0 uses pg 8.23.0 / pg-connection-string 2.14.0, which supports `verify-full` and currently treats `require` as its alias. URL `channel_binding=require` does not enable or enforce binding in this installed pg version. Explicit `enableChannelBinding: true` enables opportunistic SCRAM-SHA-256-PLUS but permits fallback. Strict runtime channel binding is NOT enforced; application runtime code is unchanged. This migration config is not a runtime security fix.

PostgreSQL 18.6 CLI clients are installed under `C:\Program Files\PostgreSQL\18\bin` and support Neon's generated TLS settings; `verify-full` additionally requires appropriate trust configuration. Future metadata/provenance verification, migration history/baseline review, actual TLS checks and any runtime binding solution remain pending. Existing backfill and integration tools still refuse Neon. No connection, migration, SQL, backfill, schema push, reset or deployment is authorized by this preparation.

Database-free verification: `node --test tests/leadership.test.mjs tests/leadership-neon.test.mjs`. Tests use synthetic inputs; pg objects are instantiated only for parsing and never connected.

## Native tools Phase 1 (synthetic probes only)

`scripts/leadership-native-tools.mjs` provides `runNativeToolsPhase1`. It has no CLI entry point, credential-provider hook, connection command or SQL execution path. The only PostgreSQL arguments are `--version`, against absolute `C:\Program Files\PostgreSQL\18\bin\psql.exe` and `pg_dump.exe` paths, with exact 18.6 version checks. It never imports Prisma; the Prisma interlock is unchanged.

The current Leadership migration path and SHA-256 are pinned; a changed migration fails closed. Project, branch ID/name, direct hostname, database and role use the existing approved target constants. Alternate targets, arbitrary arguments, real-password inputs, production and Vercel markers are rejected. Metadata and schema-only provenance still require independent verification before any future connection.

The Windows adapter uses absolute `whoami.exe` and `icacls.exe` paths, no shell, and hidden windows. It creates an empty unique directory, removes inherited ACLs, grants only the current Windows SID and verifies ACL consistency before creating an empty exclusive password file. It similarly restricts/verifies the file ACL before writing a fixed synthetic password, escaping passfile separators. The child environment is allowlisted with `PGPASSFILE`, pinned connection fields, `verify-full` and required channel binding. It never inherits PGPASSWORD, URLs, service names, routing overrides, PATH, Node options or debug settings. CA trust is not provisioned because Phase 1 cannot connect.

Raw output is privately bounded/drained and never forwarded. Results/errors use fixed statuses. Success, failure, timeout and AbortSignal cancellation attempt handle closure, file deletion and directory removal. Timeout/cancellation terminates the direct child and waits for its close before cleanup. Cleanup failure overrides success with `CLEANUP_FAILED` without paths/raw causes. No recursive deletion occurs. Forced wrapper/OS termination, failed child termination and inaccessible files can prevent cleanup; deletion is not forensic erasure.

The new tests use injected filesystem/process simulations only: no real native processes, ACL changes, credential files or database connections. Coverage includes ACL-before-write order, directory/file permission failure, hostile inherited variables, target/argument substitution, synthetic passfile escaping, output/error suppression, write failure, cleanup failure, timeout and cancellation. Real Windows ACL effectiveness and filesystem races remain unverified; `/verify` checks ACL consistency rather than independently auditing the DACL. This is Phase 1 scaffolding, not end-to-end protection or authorization to connect.

Run offline checks with `node --test tests/leadership.test.mjs tests/leadership-neon.test.mjs tests/leadership-native-tools.test.mjs`. Future connection/rehearsal commands, CA trust, metadata verification, artifact handling and secure credential provisioning need separate implementation review and authorization.

## Media lifecycle

Existing authenticated, same-origin `/api/admin/media` and Cloudinary storage are reused. URL, managed key, and alt text are saved together. New managed references must match the configured Cloudinary account. Legacy Principal references can remain unchanged without re-uploading.

Replacement cleanup runs after successful saves and checks keys and URL-only references across school settings, leadership, faculty, facilities, achievements, news/notices, events, gallery, sports and co-curricular records. Direct API deletion rejects referenced media. External URLs have no managed deletion key and are never deleted. Cleanup failure does not undo saved content.

Upload cancellation or failed form validation can leave orphan assets. No automatic bulk cleanup is included. Review orphan cleanup separately. Provider deletion and reference checks are not a distributed transaction; do not intentionally attach a key being concurrently retired.

## Release and rollback

Production requires separate explicit approval, a reviewed backup, staging rehearsal, migration review, environment verification, and an approved content backfill procedure. The included backfill tool deliberately refuses production targets. Deploy application changes only after the additive schema is available.

For rollback, the old application can continue using retained Principal/Chairman columns. New Chairman edits are stored only in `LeadershipMember`; export/reconcile them before rolling back if necessary. Keep the additive table and columns until retention and recovery are reviewed. Do not run destructive down migrations.

## Current verification boundary

Implementation was prepared without database access. Migration, backfill and DB/UI integration checks must remain pending until an explicitly isolated local database is available. Compile-only build results do not substitute for a full database-backed production build.

Verified locally on 2026-11-12:

- Prisma client generation and schema validation passed without database access.
- TypeScript `tsc --noEmit --incremental false` passed.
- All 10 database-free tests passed on Node 24. Node emits an informational module-type warning when loading the TypeScript utility files.
- ESLint passed with zero errors and seven existing warnings in the unchanged `src/app/admin/content-actions.ts`.
- `next build --experimental-build-mode compile` passed with an explicit unusable loopback database URL and development-only build settings. Google Font downloads required network access. This does not finalize a production build.
- Git whitespace checks passed. Original committed CSS and the pre-existing 67-line CSS addition were verified unchanged; leadership styling adds 25 separate lines.
- No migration, backfill, database integration test, Cloudinary mutation, deployment, commit, or push was executed. Docker Desktop's local daemon was unavailable.
