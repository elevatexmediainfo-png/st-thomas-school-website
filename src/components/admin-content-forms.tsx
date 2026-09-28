import Link from "next/link";
import { AdminMediaField } from "@/components/admin-media-field";
import { createEvent, createNotice, updateEvent, updateNotice } from "@/app/admin/admin-actions";

type Notice = { id: string; type: "NEWS" | "NOTICE"; title: string; slug: string; description: string | null; content: string | null; category: string; documentUrl: string | null; imageUrl: string | null; imageKey: string | null; imageAlt: string | null; status: string; isPinned: boolean; isArchived: boolean; publishDate: Date | null };
type EventRecord = { id: string; title: string; slug: string; description: string | null; eventDate: Date | null; eventTime: string | null; venue: string | null; category: string; imageUrl: string | null; imageKey: string | null; imageAlt: string | null; status: string; isFeatured: boolean; publication: string };

function Field({ label, name, value, type = "text", required = false }: { label: string; name: string; value?: string | null; type?: string; required?: boolean }) { return <label>{label}<input name={name} type={type} defaultValue={value ?? ""} required={required} /></label>; }

export function NoticeForm({ notice, type = notice?.type ?? "NOTICE" }: { notice?: Notice; type?: "NEWS" | "NOTICE" }) {
  const action = notice ? updateNotice : createNotice;
  const isNews = type === "NEWS";
  const basePath = isNews ? "/admin/news" : "/admin/notices";
  return <form className="admin-form" action={action}><input type="hidden" name="id" value={notice?.id ?? ""} /><input type="hidden" name="contentType" value={type} /><div className="admin-form-grid"><Field label={isNews ? "News title" : "Notice title"} name="title" value={notice?.title} required /><Field label="Slug (optional)" name="slug" value={notice?.slug} /><Field label="Category" name="category" value={notice?.category} required /><Field label="Date" name="publishDate" value={notice?.publishDate ? notice.publishDate.toISOString().slice(0, 16) : ""} type="datetime-local" /><label>Short description<textarea name="description" defaultValue={notice?.description ?? ""} rows={3} /></label><label>Full content<textarea name="content" defaultValue={notice?.content ?? ""} rows={7} /></label>{!isNews && <Field label="Optional document / PDF URL" name="documentUrl" value={notice?.documentUrl} />}</div><AdminMediaField label={isNews ? "News image" : "Notice image"} urlName="imageUrl" keyName="imageKey" altName="imageAlt" initialUrl={notice?.imageUrl} initialKey={notice?.imageKey} initialAlt={notice?.imageAlt} /><div className="admin-checkboxes"><label><input type="checkbox" name="published" defaultChecked={notice?.status === "PUBLISHED"} /> Published</label>{!isNews && <><label><input type="checkbox" name="pinned" defaultChecked={notice?.isPinned} /> Pinned / important</label><label><input type="checkbox" name="archived" defaultChecked={notice?.isArchived} /> Archived</label></>}</div><div className="admin-form-actions"><button className="button button-dark" type="submit">{notice ? `Save ${isNews ? "news" : "notice"}` : `Add ${isNews ? "news" : "notice"}`}</button><Link className="button button-outline-dark" href={basePath}>Cancel</Link></div></form>;
}

export function EventForm({ event }: { event?: EventRecord }) {
  const action = event ? updateEvent : createEvent;
  return <form className="admin-form" action={action}><input type="hidden" name="id" value={event?.id ?? ""} /><div className="admin-form-grid"><Field label="Event name" name="title" value={event?.title} required /><Field label="Slug (optional)" name="slug" value={event?.slug} /><Field label="Category" name="category" value={event?.category} required /><Field label="Date" name="eventDate" value={event?.eventDate ? event.eventDate.toISOString().slice(0, 10) : ""} type="date" /><Field label="Time" name="eventTime" value={event?.eventTime} /><Field label="Venue" name="venue" value={event?.venue} /><label>Status<select name="status" defaultValue={event?.status ?? "UPCOMING"}><option value="UPCOMING">Upcoming</option><option value="PAST">Past</option></select></label><label>Description<textarea name="description" defaultValue={event?.description ?? ""} rows={5} /></label></div><AdminMediaField label="Event image" urlName="imageUrl" keyName="imageKey" altName="imageAlt" initialUrl={event?.imageUrl} initialKey={event?.imageKey} initialAlt={event?.imageAlt} /><div className="admin-checkboxes"><label><input type="checkbox" name="published" defaultChecked={event?.publication === "PUBLISHED"} /> Published</label><label><input type="checkbox" name="featured" defaultChecked={event?.isFeatured} /> Featured</label></div><div className="admin-form-actions"><button className="button button-dark" type="submit">{event ? "Save event" : "Add event"}</button><Link className="button button-outline-dark" href="/admin/events">Cancel</Link></div></form>;
}

export function ContentFeedback({ status, error }: { status?: string; error?: string }) {
  const statusMessage: Record<string, string> = { created: "Content added successfully.", updated: "Changes saved successfully.", deleted: "Content deleted successfully." };
  const errorMessage: Record<string, string> = { required: "Enter the required title and category.", invalid: "Check the entered date and field lengths.", "duplicate-slug": "That web address is already in use. Change the optional slug or title.", "not-found": "That record could not be found." };
  if (status && statusMessage[status]) return <p className="admin-feedback success" role="status">{statusMessage[status]}</p>;
  if (error && errorMessage[error]) return <p className="admin-feedback error" role="alert">{errorMessage[error]}</p>;
  return null;
}

