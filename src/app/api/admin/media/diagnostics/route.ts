import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { guardAdminRequest } from "@/lib/admin-api";
import { getMediaStorage } from "@/lib/media-storage";

// TEMPORARY: remove after the Cloudinary signature problem is diagnosed.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function describe(value: string | undefined) {
  if (value === undefined) return { exists: false };
  return {
    exists: true,
    length: value.length,
    leadingOrTrailingWhitespace: value !== value.trim(),
    containsInnerWhitespace: /\s/.test(value.trim()),
    containsNewline: /[\r\n]/.test(value),
    containsQuote: /["'`]/.test(value),
  };
}

const tinyPng = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

function errorInfo(error: unknown) {
  const details = (typeof error === "object" && error !== null ? error : {}) as { http_code?: unknown; message?: unknown; error?: { http_code?: unknown; message?: unknown } };
  const inner = details.error ?? details;
  return {
    httpCode: typeof inner.http_code === "number" ? inner.http_code : undefined,
    message: typeof inner.message === "string" ? inner.message.slice(0, 200) : undefined,
  };
}

async function uploadTest(algorithm: "sha1" | "sha256" | undefined, extra: Record<string, boolean> = {}) {
  cloudinary.config({ signature_algorithm: algorithm });
  const publicId = `school/diagnostic-${randomUUID()}`;
  try {
    await new Promise<void>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ public_id: publicId, resource_type: "image", overwrite: false, ...extra }, (error, response) => {
        if (error || !response) reject(error ?? new Error("No response"));
        else resolve();
      });
      stream.end(tinyPng);
    });
  } catch (error) {
    return errorInfo(error);
  }
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    return { httpCode: 200, message: "Upload succeeded; test asset deleted" };
  } catch {
    return { httpCode: 200, message: "Upload succeeded; test asset deletion failed" };
  }
}

export async function GET(request: Request) {
  const denied = await guardAdminRequest(request, { checkOrigin: false });
  if (denied) return denied;

  const mode = new URL(request.url).searchParams.get("upload");
  if (mode === "adapter") {
    const storage = getMediaStorage();
    if (!storage) return NextResponse.json({ error: "Media storage is not configured." }, { status: 503, headers: { "Cache-Control": "no-store" } });
    const results: Record<string, { httpCode?: number; message?: string }> = {};
    for (const [label, extension] of [["png", "png"], ["jpeg", "jpg"], ["webp", "webp"], ["avif", "avif"]] as const) {
      const key = `school/${randomUUID()}.${extension}`;
      try {
        await storage.upload({ key, bytes: new Uint8Array(tinyPng), contentType: `image/${label}`, altText: "" });
      } catch (error) {
        results[label] = errorInfo(error);
        continue;
      }
      try {
        await storage.delete(key);
        results[label] = { httpCode: 200, message: "Upload succeeded; test asset deleted" };
      } catch {
        results[label] = { httpCode: 200, message: "Upload succeeded; test asset deletion failed" };
      }
    }
    return NextResponse.json(results, { headers: { "Cache-Control": "no-store" } });
  }
  if (mode === "variants") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const exactRealOptions = await uploadTest(undefined, { unique_filename: false, use_filename: false });
    const withoutUniqueAndUseFilename = await uploadTest(undefined);
    const onlyUniqueFilenameFalse = await uploadTest(undefined, { unique_filename: false });
    const onlyUseFilenameFalse = await uploadTest(undefined, { use_filename: false });
    return NextResponse.json({ exactRealOptions, withoutUniqueAndUseFilename, onlyUniqueFilenameFalse, onlyUseFilenameFalse }, { headers: { "Cache-Control": "no-store" } });
  }
  if (mode === "1") {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const sha1 = await uploadTest("sha1");
    const sha256 = await uploadTest("sha256");
    cloudinary.config({ signature_algorithm: undefined });
    return NextResponse.json({ sha1, sha256 }, { headers: { "Cache-Control": "no-store" } });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  const sdk = cloudinary.config();

  let ping: { ok: boolean; httpCode?: number; message?: string };
  try {
    await cloudinary.api.ping();
    ping = { ok: true, httpCode: 200 };
  } catch (error) {
    const details = (typeof error === "object" && error !== null ? error : {}) as { http_code?: unknown; message?: unknown; error?: { http_code?: unknown; message?: unknown } };
    const inner = details.error ?? details;
    ping = {
      ok: false,
      httpCode: typeof inner.http_code === "number" ? inner.http_code : undefined,
      message: typeof inner.message === "string" ? inner.message.slice(0, 200) : undefined,
    };
  }

  return NextResponse.json({
    cloudName: describe(cloudName),
    apiKey: { ...describe(apiKey), digitsOnly: apiKey ? /^\d+$/.test(apiKey) : false },
    apiSecret: describe(apiSecret),
    otherCloudinaryEnv: {
      CLOUDINARY_URL: process.env.CLOUDINARY_URL !== undefined,
      CLOUDINARY_ACCOUNT_URL: process.env.CLOUDINARY_ACCOUNT_URL !== undefined,
    },
    sdkConfig: {
      cloudNameLength: typeof sdk.cloud_name === "string" ? sdk.cloud_name.length : null,
      apiKeyLength: typeof sdk.api_key === "string" ? sdk.api_key.length : null,
      apiSecretLengthMatchesEnv: typeof sdk.api_secret === "string" && apiSecret !== undefined ? sdk.api_secret.length === apiSecret.length : null,
    },
    signedApiPing: ping,
  }, { headers: { "Cache-Control": "no-store" } });
}
