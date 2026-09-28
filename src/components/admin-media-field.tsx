"use client";

import { useRef, useState } from "react";

type Props = {
  label: string;
  urlName: string;
  keyName: string;
  altName: string;
  initialUrl?: string | null;
  initialKey?: string | null;
  initialAlt?: string | null;
};

export function AdminMediaField({ label, urlName, keyName, altName, initialUrl, initialKey, initialAlt }: Props) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [key, setKey] = useState(initialKey ?? "");
  const [altText, setAltText] = useState(initialAlt ?? "");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function upload(file?: File) {
    if (!file) return;
    setMessage("");
    setBusy(true);
    try {
      const data = new FormData();
      data.set("file", file);
      data.set("altText", altText);
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const result = await response.json() as { url?: string; key?: string; error?: string };
      if (!response.ok || !result.url || !result.key) {
        setMessage(result.error ?? "Upload could not be completed.");
        return;
      }
      setUrl(result.url);
      setKey(result.key);
      setMessage("Image uploaded.");
    } catch {
      setMessage("Upload is currently unavailable.");
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function remove() {
  setUrl("");
  setKey("");
  setAltText("");
  setMessage("Image reference will be removed when you save this record.");
  }

  return <fieldset className="admin-media-field">
    <legend>{label}</legend>
    <input type="hidden" name={urlName} value={url} />
    <input type="hidden" name={keyName} value={key} />
    {url ? <div className="admin-media-preview" role="img" aria-label={altText || `${label} preview`} style={{ backgroundImage: `url("${url.replaceAll('"', "%22")}")` }} /> : <div className="admin-media-preview is-empty" role="img" aria-label={`${label} placeholder`}>Image placeholder</div>}
    <label>Image URL<input value={url} onChange={(event) => { setUrl(event.target.value); setKey(""); }} placeholder="Optional HTTPS URL or uploaded media" /></label>
    <label>Alt text<input name={altName} value={altText} maxLength={240} onChange={(event) => setAltText(event.target.value)} placeholder="Describe the image for accessibility" /></label>
    <input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => upload(event.target.files?.[0])} />
    <div className="admin-media-actions"><button type="button" className="button button-outline-dark" disabled={busy} onClick={() => fileInput.current?.click()}>{busy ? "Working..." : url ? "Replace image" : "Upload image"}</button>{url && <button type="button" className="admin-danger-button" disabled={busy} onClick={remove}>Remove image</button>}</div>
    {message && <p className="admin-form-note" role="status">{message}</p>}
    <p className="admin-form-note">Storage uploads remain unavailable until a provider is configured. Image URLs may be entered manually.</p>
  </fieldset>;
}
