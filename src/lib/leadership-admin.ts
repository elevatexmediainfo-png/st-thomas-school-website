import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function requireLeadershipAdmin() {
  const session = await auth();
  if (!session?.user?.id) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: session.user.id }, select: { isActive: true, role: true } });
  if (!user?.isActive || !["SUPER_ADMIN", "CONTENT_ADMIN"].includes(user.role)) redirect("/admin/login");
}

export function revalidateLeadership() {
  for (const path of ["/", "/leadership", "/admin/leadership", "/admin/principal", "/administration", "/administration/management", "/administration/principal", "/administration/chairman-director", "/about/principal-message", "/about/chairman-message"]) revalidatePath(path);
}
