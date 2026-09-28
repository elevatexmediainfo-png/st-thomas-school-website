"use client";

export function AdminDeleteButton({ action, id, label, model }: { action: (formData: FormData) => Promise<void>; id: string; label: string; model?: string }) {
  return <form action={action} onSubmit={(event) => { if (!window.confirm(`Delete ${label}? This cannot be undone.`)) event.preventDefault(); }}><input type="hidden" name="id" value={id} />{model && <input type="hidden" name="model" value={model} />}<button className="admin-danger-button" type="submit">Delete</button></form>;
}