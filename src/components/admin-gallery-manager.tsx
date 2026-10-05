"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminGalleryUploader } from "@/components/admin-gallery-uploader";
import type { GalleryImageDto } from "@/lib/gallery-images";

type Draft = { caption: string; altText: string; status: string };
type Notice = { type: "success" | "error"; text: string };

async function request<T>(url: string, method: string, body?: unknown) {
  const response = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "The request could not be completed.");
  return data;
}

const initialDraft = (image: GalleryImageDto): Draft => ({ caption: image.caption ?? "", altText: image.altText ?? "", status: image.status });

export function AdminGalleryManager({ albumId, initialImages, initialCoverKey }: { albumId: string; initialImages: GalleryImageDto[]; initialCoverKey: string | null }) {
  const router = useRouter();
  const base = `/api/admin/gallery/${albumId}`;
  const [images, setImages] = useState(initialImages);
  const [coverKey, setCoverKey] = useState(initialCoverKey);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragHandle, setDragHandle] = useState<string | null>(null);

  const draftOf = (image: GalleryImageDto) => drafts[image.id] ?? initialDraft(image);
  const isDirty = (image: GalleryImageDto) => { const draft = draftOf(image); const original = initialDraft(image); return draft.caption !== original.caption || draft.altText !== original.altText || draft.status !== original.status; };
  const setDraft = (image: GalleryImageDto, changes: Partial<Draft>) => setDrafts((current) => ({ ...current, [image.id]: { ...draftOf(image), ...changes } }));
  const fail = (error: unknown) => setNotice({ type: "error", text: error instanceof Error ? error.message : "Something went wrong." });

  async function run(id: string, task: () => Promise<void>) {
    setPending(id);
    setNotice(null);
    try { await task(); } catch (error) { fail(error); } finally { setPending(null); }
  }

  const save = (image: GalleryImageDto) => run(image.id, async () => {
    const { image: saved } = await request<{ image: GalleryImageDto }>(`${base}/images/${image.id}`, "PATCH", draftOf(image));
    setImages((current) => current.map((entry) => entry.id === saved.id ? saved : entry));
    setDrafts((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== image.id)));
    setNotice({ type: "success", text: "Image details saved." });
  });

  const remove = (image: GalleryImageDto) => {
    if (!window.confirm("Delete this image from the gallery? The image file will also be removed. This cannot be undone.")) return Promise.resolve();
    return run(image.id, async () => {
      const result = await request<{ mediaCleanup?: string }>(`${base}/images/${image.id}`, "DELETE");
      setImages((current) => current.filter((entry) => entry.id !== image.id));
      if (image.imageKey && image.imageKey === coverKey) { setCoverKey(null); router.refresh(); }
      setNotice(result.mediaCleanup === "failed"
        ? { type: "error", text: "The image was removed from the album, but the stored file could not be deleted from the media provider. It may need manual cleanup." }
        : { type: "success", text: "Image deleted." });
    });
  };

  const setCover = (image: GalleryImageDto) => run(image.id, async () => {
    await request(`${base}/cover`, "POST", { imageId: image.id });
    setCoverKey(image.imageKey);
    setNotice({ type: "success", text: "Album cover updated." });
    router.refresh();
  });

  async function reorder(next: GalleryImageDto[]) {
    const previous = images;
    setImages(next.map((image, index) => ({ ...image, sortOrder: index })));
    setNotice(null);
    try { await request(`${base}/images`, "PUT", { ids: next.map((image) => image.id) }); } catch (error) { setImages(previous); fail(error); }
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    next.splice(to, 0, next.splice(from, 1)[0]);
    void reorder(next);
  }

  return <section className="admin-gallery-manager">
    <AdminGalleryUploader albumId={albumId} onAdded={(added) => { setImages((current) => [...current, ...added]); setNotice({ type: "success", text: `${added.length} image${added.length === 1 ? "" : "s"} added to the album.` }); }} />
    {notice && <p className={`admin-feedback ${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}</p>}
    {images.length === 0 ? <div className="admin-empty"><strong>No images in this album yet.</strong><p>Use Upload Images or drag photos into the upload area above.</p></div> : <>
      <p className="admin-form-note">{images.length} image{images.length === 1 ? "" : "s"} · drag the handle or use the arrows to reorder. Order is saved automatically.</p>
      <ul className="admin-gallery-grid">
        {images.map((image, index) => {
          const draft = draftOf(image);
          const busy = pending === image.id;
          const isCover = Boolean(image.imageKey) && image.imageKey === coverKey;
          return <li key={image.id} className={`admin-gallery-card${dragId === image.id ? " is-dragging" : ""}`} draggable={dragHandle === image.id}
            onDragStart={() => setDragId(image.id)} onDragEnd={() => { setDragId(null); setDragHandle(null); }}
            onDragOver={(event) => { if (dragId) event.preventDefault(); }}
            onDrop={(event) => { event.preventDefault(); const from = images.findIndex((entry) => entry.id === dragId); setDragId(null); setDragHandle(null); if (from >= 0) move(from, index); }}>
            <div className="admin-gallery-thumb" role="img" aria-label={image.altText || image.caption || "Gallery image"} style={image.imageUrl ? { backgroundImage: `url("${image.imageUrl.replaceAll('"', "%22")}")` } : undefined}>
              {isCover && <span className="admin-gallery-badge">Cover</span>}
              <button type="button" className="admin-gallery-handle" aria-label="Drag to reorder" onMouseDown={() => setDragHandle(image.id)} onMouseUp={() => setDragHandle(null)}>⠿</button>
            </div>
            <div className="admin-gallery-fields">
              <label>Caption<input value={draft.caption} maxLength={240} onChange={(event) => setDraft(image, { caption: event.target.value })} /></label>
              <label>Alt text<input value={draft.altText} maxLength={240} onChange={(event) => setDraft(image, { altText: event.target.value })} /></label>
              <label>Publishing<select value={draft.status} onChange={(event) => setDraft(image, { status: event.target.value })}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="UNPUBLISHED">Unpublished</option></select></label>
            </div>
            <div className="admin-gallery-actions">
              <button type="button" className="button button-dark" disabled={busy || !isDirty(image)} onClick={() => void save(image)}>{busy ? "Working…" : "Save"}</button>
              <button type="button" className="button button-outline-dark" disabled={busy || isCover || !image.imageKey} onClick={() => void setCover(image)}>{isCover ? "Current cover" : "Set as cover"}</button>
              <span className="admin-gallery-order">
                <button type="button" aria-label="Move earlier" disabled={busy || index === 0} onClick={() => move(index, index - 1)}>←</button>
                <small>{index + 1}</small>
                <button type="button" aria-label="Move later" disabled={busy || index === images.length - 1} onClick={() => move(index, index + 1)}>→</button>
              </span>
              <button type="button" className="admin-danger-button" disabled={busy} onClick={() => void remove(image)}>Delete</button>
            </div>
          </li>;
        })}
      </ul>
    </>}
  </section>;
}
