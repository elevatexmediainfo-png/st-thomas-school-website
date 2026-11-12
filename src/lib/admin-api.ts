import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const user = await prisma.adminUser.findUnique({ where: { id: session.user.id }, select: { isActive: true, role: true } });
  if (!user?.isActive || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(user.role)) return NextResponse.json({ error: "Active administrator access required." }, { status: 403 });
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
