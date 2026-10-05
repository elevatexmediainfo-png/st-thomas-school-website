import { v2 as cloudinary } from "cloudinary";

export type StoredMedia = {
  key: string;
  url: string;
};

export type UploadMediaInput = {
  key: string;
  bytes: Uint8Array;
  contentType: string;
  altText: string;
};

export interface MediaStorage {
  upload(input: UploadMediaInput): Promise<StoredMedia>;
  delete(key: string): Promise<void>;
}

const cloudinaryKeyPattern = /^school\/[0-9a-f-]{36}\.(jpg|png|webp|avif)$/i;

class CloudinaryMediaStorage implements MediaStorage {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async upload(input: UploadMediaInput): Promise<StoredMedia> {
    if (!cloudinaryKeyPattern.test(input.key)) throw new Error("Invalid Cloudinary media key.");
    const publicId = input.key.replace(/\.[^.]+$/, "");
    const result = await new Promise<{ secure_url?: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({
        public_id: publicId,
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
        use_filename: false,
      }, (error, response) => {
        if (error || !response?.secure_url) {
          reject(error ?? new Error("Cloudinary did not return a secure URL."));
          return;
        }
        resolve(response);
      });
      stream.end(Buffer.from(input.bytes));
    });
    return { key: input.key, url: result.secure_url as string };
  }

  async delete(key: string): Promise<void> {
    if (!cloudinaryKeyPattern.test(key)) throw new Error("Invalid Cloudinary media key.");
    const publicId = key.replace(/\.[^.]+$/, "");
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    if (result.result !== "ok" && result.result !== "not found") throw new Error("Cloudinary could not delete the image.");
  }
}

export function getMediaStorage(): MediaStorage | null {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) return null;
  return new CloudinaryMediaStorage();
}

export function isManagedMediaKey(key: string) {
  return cloudinaryKeyPattern.test(key);
}

// Only accept URLs that point at this deployment's Cloudinary account and match the stored media key.
export function isTrustedMediaUrl(url: string, key: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !isManagedMediaKey(key)) return false;
  try {
    const parsed = new URL(url);
    const publicId = key.replace(/\.[^.]+$/, "");
    return parsed.protocol === "https:" && parsed.hostname === "res.cloudinary.com" && !parsed.search && !parsed.hash
      && parsed.pathname.startsWith(`/${cloudName}/image/upload/`) && parsed.pathname.includes(`/${publicId}.`);
  } catch {
    return false;
  }
}

export function safeMediaKey(value: string) {
  return /^[a-zA-Z0-9/_-]{1,240}$/.test(value) && !value.split("/").includes("..");
}
