import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSameOrigin } from "@/lib/admin-api";
import { getMediaStorage, safeMediaKey } from "@/lib/media-storage";

export const runtime = "nodejs";
const maxBytes = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function matchesImageType(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (contentType === "image/webp") return String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (contentType === "image/avif") return String.fromCharCode(...bytes.slice(4, 12)).includes("ftypavif");
  return false;
}

export async function POST(request: Request) {
  if (!(await auth())?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Same-origin request required." }, { status: 403 });
  const storage = getMediaStorage();
  if (!storage) return NextResponse.json({ error: "Media storage is not configured. No file was stored." }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  const altText = String(form.get("altText") ?? "").trim();
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Use a JPG, PNG, WebP, or AVIF image." }, { status: 415 });
  if (file.size < 1 || file.size > maxBytes) return NextResponse.json({ error: "Images must be smaller than 8 MB." }, { status: 413 });
  if (altText.length > 240) return NextResponse.json({ error: "Alt text must be 240 characters or fewer." }, { status: 400 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!matchesImageType(bytes, file.type)) return NextResponse.json({ error: "The file contents do not match the selected image type." }, { status: 415 });

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const key = `school/${randomUUID()}.${extension}`;
  let uploaded: Awaited<ReturnType<typeof storage.upload>>;
  // TEMPORARY diagnostics: no secrets, no file contents.
  console.info("Media upload attempt", { filename: file.name.slice(0, 80), mime: file.type, size: file.size, byteLength: bytes.length, keyFormat: key.replace(/[0-9a-f-]{36}/, "<uuid>"), fieldNames: Array.from(new Set(Array.from(form.keys()))), enteringUpload: true });
  try {
    uploaded = await storage.upload({ key, bytes, contentType: file.type, altText });
  } catch (error) {
    const details = (typeof error === "object" && error !== null ? error : {}) as { http_code?: unknown; message?: unknown };
    console.error("Media upload failed", { httpCode: typeof details.http_code === "number" ? details.http_code : undefined, message: typeof details.message === "string" ? details.message.slice(0, 300) : undefined });
    return NextResponse.json({ error: "The media provider could not store this image." }, { status: 502 });
  }
  return NextResponse.json({ key: uploaded.key, url: uploaded.url, altText });
}

export async function DELETE(request: Request) {
  if (!(await auth())?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Same-origin request required." }, { status: 403 });
  const storage = getMediaStorage();
  if (!storage) return NextResponse.json({ error: "Media storage is not configured. No file was deleted." }, { status: 503 });

  let body: { key?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }
  const key = typeof body.key === "string" ? body.key : "";
  if (!safeMediaKey(key) || !key.startsWith("school/")) return NextResponse.json({ error: "Invalid media key." }, { status: 400 });
  try {
    await storage.delete(key);
  } catch {
    return NextResponse.json({ error: "The media provider could not remove this image." }, { status: 502 });
  }
  return NextResponse.json({ success: true });
}
