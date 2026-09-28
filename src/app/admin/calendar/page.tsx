import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminContentModule } from "@/components/admin-content-module";
import { prisma } from "@/lib/prisma";

export default async function Calendar() {
	const session = await auth();
	if (!session?.user) redirect("/admin/login");
	const records = await prisma.schoolCalendarItem.findMany({ orderBy: { startDate: "asc" } });
	return <AdminContentModule model="calendar" records={records as unknown as Array<Record<string, unknown>>} />;
}
