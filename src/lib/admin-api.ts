import { NextResponse } from "next/server";
import { auth } from "@/auth";

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

// Returns an error response when the request is not an authenticated admin request, otherwise null.
export async function guardAdminRequest(request: Request, options: { checkOrigin?: boolean } = {}) {
  if (!(await auth())?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (options.checkOrigin !== false && !isSameOrigin(request)) return NextResponse.json({ error: "Same-origin request required." }, { status: 403 });
  return null;
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null && !Array.isArray(body) ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
