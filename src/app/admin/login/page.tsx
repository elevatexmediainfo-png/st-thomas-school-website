import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Admin Login | St. Thomas English School, Ruabandha, Bhilai.",
  description: "Secure administrator login for St. Thomas English School, Ruabandha, Bhilai..",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return <main className="admin-auth-page"><div className="admin-auth-brand"><Image className="auth-logo" src="/school-logo.png" alt="St. Thomas English School, Ruabandha, Bhilai. logo" width={72} height={72} priority /><span><strong>St. Thomas English School, Ruabandha, Bhilai.</strong><small>School administration</small></span></div><div className="admin-auth-card"><p className="eyebrow">Private area</p><h1>Welcome<br /><em>back.</em></h1><p className="admin-auth-description">Sign in with an administrator account created by the school.</p><LoginForm /></div><p className="admin-auth-footer">St. Thomas English School, Ruabandha, Bhilai. · Bhilai</p></main>;
}