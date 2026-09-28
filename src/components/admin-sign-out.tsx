"use client";

import { signOut } from "next-auth/react";

export function AdminSignOut() {
  return <button className="admin-sign-out" type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>Sign out <span aria-hidden="true">↗</span></button>;
}