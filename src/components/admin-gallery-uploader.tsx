"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import type { GalleryImageDto } from "@/lib/gallery-images";

type Status = "queued" | "uploading" | "saving" | "done" | "error";
type UploadedMedia = { key: string; url: string };
type QueueItem = { id: string; file: File; preview: string; altText: string; status: Status; progress: number; error?: string; uploaded?: UploadedMedia };

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const maxBytes = 8 * 1024 * 1024;
const maxQueue = 30;
const concurrency = 3;

const labelFromName = (name: string) => name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim().slice(0, 240);
const formatSize = (bytes: number) => bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
const statusLabel: Record<Status, string> = { queued: "Ready", uploading: "Uploading", saving: "Saving", done: "Uploaded", error: "Failed" };

function uploadMedia(file: File, altText: string, onProgress: (percent: number) => void) {
  return new Promise<UploadedMedia>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100)); };
    xhr.onerror = () => reject(new Error("Network error. Check your connection and retry."));
    xhr.onload = () => {
      let body: { url?: string; key?: string; error?: string } = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* non-JSON error response */ }
      if (xhr.status >= 200 && xhr.status < 300 && body.url && body.key) resolve({ key: body.key, url: body.url });
      else reject(new Error(body.error ?? "Upload failed."));
    };
    const data = new FormData();
    data.set("file", file);
    data.set("altText", altText);
    xhr.send(data);
  });
}

export function AdminGalleryUploader({ albumId, onAdded }: { albumId: string; onAdded: (images: GalleryImageDto[]) => void }) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");
  const itemsRef = useRef<QueueItem[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => { itemsRef.current = items; }, [items]);
  useEffect(() => () => itemsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)), []);

  const patch = (id: string, changes: Partial<QueueItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item));
  const busy = items.some((item) => item.status === "uploading" || item.status === "saving");
  const pending = items.filter((item) => item.status === "queued" || item.status === "error");

  function addFiles(files: FileList | File[]) {
    const incoming = Array.from(files);
    const rejected: string[] = [];
    const accepted: QueueItem[] = [];
    for (const file of incoming) {
      if (!allowedTypes.has(file.type)) { rejected.push(`${file.name}: use JPG, PNG, WebP or AVIF`); continue; }
      if (file.size < 1 || file.size > maxBytes) { rejected.push(`${file.name}: must be smaller than 8 MB`); continue; }
      if (itemsRef.current.length + accepted.length >= maxQueue) { rejected.push(`${file.name}: queue limit of ${maxQueue} images reached`); continue; }
      accepted.push({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), altText: labelFromName(file.name), status: "queued", progress: 0 });
    }
    if (accepted.length) setItems((current) => [...current, ...accepted]);
    setNotice(rejected.length ? `Skipped ${rejected.length} file${rejected.length === 1 ? "" : "s"}: ${rejected.join("; ")}.` : "");
  }

  function remove(id: string) {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item || item.status === "uploading" || item.status === "saving") return;
    URL.revokeObjectURL(item.preview);
    // Media uploaded but never attached to the album would be orphaned, so ask the server to delete it.
    if (item.uploaded && item.status === "error") void fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: item.uploaded.key }) }).catch(() => undefined);
    setItems((current) => current.filter((entry) => entry.id !== id));
  }

  function clearCompleted() {
    itemsRef.current.filter((item) => item.status === "done").forEach((item) => URL.revokeObjectURL(item.preview));
    setItems((current) => current.filter((item) => item.status !== "done"));
  }

  // Album records are created one at a time so sort order stays sequential.
  function associate(item: QueueItem, media: UploadedMedia) {
    const run = async () => {
      const response = await fetch(`/api/admin/gallery/${albumId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ imageKey: media.key, imageUrl: media.url, altText: item.altText, caption: "" }] }),
      });
      const result = await response.json().catch(() => ({})) as { images?: GalleryImageDto[]; error?: string };
      if (!response.ok || !result.images) throw new Error(result.error ?? "The image was uploaded but could not be added to the album.");
      return result.images;
    };
    const next = saveChain.current.then(run);
    saveChain.current = next.catch(() => undefined);
    return next;
  }

  async function processItem(id: string) {
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (!item) return;
    patch(id, { status: "uploading", progress: item.uploaded ? 100 : 0, error: undefined });
    try {
      let media = item.uploaded;
      if (!media) {
        media = await uploadMedia(item.file, item.altText, (progress) => patch(id, { progress }));
        patch(id, { uploaded: media });
      }
      patch(id, { status: "saving", progress: 100 });
      const images = await associate(item, media);
      patch(id, { status: "done" });
      onAdded(images);
    } catch (error) {
      patch(id, { status: "error", error: error instanceof Error ? error.message : "Upload failed." });
    }
  }

  async function start(ids?: string[]) {
    const queue = [...(ids ?? itemsRef.current.filter((item) => item.status === "queued" || item.status === "error").map((item) => item.id))];
    await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      for (let id = queue.shift(); id; id = queue.shift()) await processItem(id);
    }));
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  const doneCount = items.filter((item) => item.status === "done").length;

  return <section className="admin-gallery-uploader" aria-labelledby="gallery-upload-heading">
    <div className="admin-gallery-uploader-head">
      <div><h3 id="gallery-upload-heading">Bulk upload</h3><p>JPG, PNG, WebP or AVIF, up to 8 MB each. Uploaded images are added to this album and published.</p></div>
      <button type="button" className="button button-dark" onClick={() => fileInput.current?.click()}>Upload Images</button>
    </div>
    <input ref={fileInput} className="sr-only" type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.target.value = ""; }} />
    <div className={`admin-dropzone${dragging ? " is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
      <strong>Drag and drop images here</strong>
      <span>or <button type="button" className="admin-link-button" onClick={() => fileInput.current?.click()}>browse your device</button></span>
    </div>
    {notice && <p className="admin-form-note" role="alert">{notice}</p>}
    {items.length > 0 && <>
      <div className="admin-upload-toolbar">
        <p>{items.length} selected{doneCount ? ` · ${doneCount} uploaded` : ""}</p>
        <div className="admin-form-actions">
          {doneCount > 0 && <button type="button" className="button button-outline-dark" onClick={clearCompleted}>Clear uploaded</button>}
          <button type="button" className="button button-dark" disabled={busy || pending.length === 0} onClick={() => void start()}>{busy ? "Uploading…" : `Start upload (${pending.length})`}</button>
        </div>
      </div>
      <ul className="admin-upload-list">
        {items.map((item) => <li key={item.id} className={`admin-upload-item is-${item.status}`}>
          <div className="admin-upload-thumb" style={{ backgroundImage: `url("${item.preview}")` }} role="img" aria-label={`Preview of ${item.file.name}`} />
          <div className="admin-upload-meta">
            <strong>{item.file.name}</strong>
            <small>{formatSize(item.file.size)} · {statusLabel[item.status]}{item.status === "uploading" && !item.uploaded ? ` ${item.progress}%` : ""}</small>
            {(item.status === "uploading" || item.status === "saving") && <progress value={item.progress} max={100} aria-label={`Upload progress for ${item.file.name}`} />}
            {item.status === "queued" && <label>Alt text<input value={item.altText} maxLength={240} onChange={(event) => patch(item.id, { altText: event.target.value })} /></label>}
            {item.error && <small className="admin-upload-error" role="alert">{item.error}</small>}
          </div>
          <div className="admin-upload-actions">
            {item.status === "error" && <button type="button" className="button button-outline-dark" onClick={() => void start([item.id])}>Retry</button>}
            {(item.status === "queued" || item.status === "error" || item.status === "done") && <button type="button" className="admin-danger-button" onClick={() => remove(item.id)} aria-label={`Remove ${item.file.name}`}>{item.status === "done" ? "Dismiss" : "Remove"}</button>}
          </div>
        </li>)}
      </ul>
    </>}
  </section>;
}
