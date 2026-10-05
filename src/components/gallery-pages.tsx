import type { ReactNode } from "react";
import Link from "next/link";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { type GalleryAlbum } from "@/content/gallery-content";
import { prisma } from "@/lib/prisma";

type LayoutProps = { children: ReactNode; title: string; description: string; current: string; eyebrow: string };

function Breadcrumbs({ current }: { current: string }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><strong>{current}</strong></nav>;
}

function GalleryLayout({ children, title, description, current, eyebrow }: LayoutProps) {
  return <div id="top"><SiteHeader /><main><section className="page-hero content-page-hero"><div className="container"><Breadcrumbs current={current} /><p className="eyebrow light">{eyebrow}</p><h1>{title}</h1><p className="page-hero-description">{description}</p></div></section><div className="content-page-nav"><div className="container"><p>Explore gallery</p><nav aria-label="Gallery pages"><Link className={current === "Gallery" ? "is-current" : ""} href="/gallery">Gallery</Link></nav></div></div>{children}</main><SiteFooter /></div>;
}

function GalleryAlbumCard({ album }: { album: GalleryAlbum }) {
  return <article className="gallery-album-card"><div className="gallery-cover-placeholder" role="img" aria-label={album.coverImageAlt || album.coverImage} style={album.coverImageUrl ? { backgroundImage: `url("${album.coverImageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!album.coverImageUrl && <span>{album.coverImage}</span>}</div><div className="gallery-album-content"><div><span>{album.category}</span><small>{album.date}</small></div><h3>{album.title}</h3>{album.description && <p>{album.description}</p>}<Link className="text-link" href={`/gallery/${album.slug}`}>View album <span aria-hidden="true">↗</span></Link></div></article>;
}

export async function GalleryPage() {
  const records = await prisma.galleryAlbum.findMany({ where: { status: "PUBLISHED" }, include: { photos: { where: { status: "PUBLISHED" }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } }, orderBy: { albumDate: "desc" } });
  const albums: GalleryAlbum[] = records.map((album) => ({ id: album.id, slug: album.slug, title: album.title, category: album.category, description: album.description ?? "", date: album.albumDate?.toLocaleDateString() ?? "Date not set", coverImage: "Album cover placeholder", coverImageUrl: album.coverImage ?? album.photos.find((photo) => photo.imageUrl)?.imageUrl ?? null, coverImageAlt: album.coverImageAlt ?? album.photos.find((photo) => photo.imageUrl)?.altText ?? null, photos: album.photos.map((photo) => photo.imageUrl ?? ""), captions: album.photos.map((photo) => photo.caption ?? ""), photoAlts: album.photos.map((photo) => photo.altText ?? photo.caption ?? album.title), published: true }));
  return <GalleryLayout eyebrow="Gallery" title="School gallery." description="Published gallery albums and items from the school." current="Gallery"><section className="content-listing-section container"><div className="content-intro-row"><div><p className="eyebrow">01 / Photo albums</p><h2>Gallery albums.</h2></div><p>Only approved, published albums are shown.</p></div>{albums.length ? <div className="gallery-album-grid">{albums.map((album) => <GalleryAlbumCard album={album} key={album.id} />)}</div> : <div className="admin-empty"><strong>No gallery albums have been published.</strong><p>Published albums will appear here when school-approved items are available.</p></div>}</section></GalleryLayout>;
}

function GalleryDetail({ album }: { album: GalleryAlbum }) {
  return <GalleryLayout eyebrow="Gallery album" title={album.title} description={album.description || "Published gallery album."} current="Album"><article className="content-detail-section container"><div className="detail-meta"><span>{album.category}</span><span>{album.date}</span></div><div className="detail-image-placeholder gallery-detail-cover" role="img" aria-label={album.coverImageAlt || album.coverImage} style={album.coverImageUrl ? { backgroundImage: `url("${album.coverImageUrl.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!album.coverImageUrl && <span>{album.coverImage}</span>}</div><div className="detail-copy"><h2>{album.title}</h2><div className="photo-grid" aria-label={`${album.title} photos`}>{album.photos.map((photo, index) => <figure key={`${index}-${album.captions[index]}`}><div className="photo-placeholder" role="img" aria-label={album.photoAlts[index] || "Gallery image placeholder"} style={photo ? { backgroundImage: `url("${photo.replaceAll('"', "%22")}")`, backgroundPosition: "center", backgroundSize: "cover" } : undefined}>{!photo && <span>Photo placeholder</span>}</div>{album.captions[index] && <figcaption>{album.captions[index]}</figcaption>}</figure>)}</div></div></article></GalleryLayout>;
}

export function GalleryDetailPage({ album }: { album: GalleryAlbum }) {
  return <GalleryDetail album={album} />;
}
