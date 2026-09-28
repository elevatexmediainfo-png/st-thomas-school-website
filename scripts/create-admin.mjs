import bcrypt from "bcryptjs";
import pg from "pg";
import { randomUUID } from "node:crypto";

const required = ["DATABASE_URL", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = required.filter((name) => !process.env[name]?.trim());
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const name = process.env.ADMIN_NAME.trim();
const email = process.env.ADMIN_EMAIL.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const role = process.env.ADMIN_ROLE?.trim() || "SUPER_ADMIN";
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("ADMIN_EMAIL must be a valid email address.");
  process.exit(1);
}
if (password.length < 14 || Buffer.byteLength(password, "utf8") > 72) {
  console.error("ADMIN_PASSWORD must be at least 14 characters and no more than 72 UTF-8 bytes.");
  process.exit(1);
}
if (name.length > 160 || email.length > 254) {
  console.error("ADMIN_NAME or ADMIN_EMAIL exceeds the supported length.");
  process.exit(1);
}
if (!new Set(["SUPER_ADMIN", "CONTENT_ADMIN"]).has(role)) {
  console.error("ADMIN_ROLE must be SUPER_ADMIN or CONTENT_ADMIN.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const passwordHash = await bcrypt.hash(password, 12);
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock($1)", [72707370]);
  const count = await client.query('SELECT count(*)::int AS count FROM "AdminUser"');
  if (count.rows[0].count > 0) throw new Error("An administrator account already exists. Bootstrap is disabled after first use.");
  await client.query('INSERT INTO "AdminUser" ("id", "name", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5::"AdminRole", true, NOW(), NOW())', [randomUUID(), name, email, passwordHash, role]);
  await client.query("COMMIT");
  console.log(`Created the first administrator account for ${email} (${role}).`);
} catch (error) {
  await client.query("ROLLBACK").catch(() => {});
  console.error(error instanceof Error ? error.message : "Administrator setup failed.");
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
