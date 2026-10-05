import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { guardAdminRequest } from "@/lib/admin-api";

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

export async function GET(request: Request) {
  const denied = await guardAdminRequest(request, { checkOrigin: false });
  if (denied) return denied;

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
