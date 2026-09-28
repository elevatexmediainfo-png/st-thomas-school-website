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

export function getMediaStorage(): MediaStorage | null {
  // A provider adapter must be added before credentials can enable uploads.
  return null;
}

export function safeMediaKey(value: string) {
  return /^[a-zA-Z0-9/_-]{1,240}$/.test(value) && !value.split("/").includes("..");
}
