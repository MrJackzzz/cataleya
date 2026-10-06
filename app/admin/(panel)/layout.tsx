import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar, type AdminAlerts } from "@/components/admin/AdminTopbar";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pendingUsers, newOrders, recentLogins] = await Promise.all([
    prisma.user.count({ where: { role: "PENDIENTE", isApproved: false } }),
    prisma.order.count({ where: { createdAt: { gte: since } } }),
    prisma.user.findMany({
      where: { lastLoginAt: { gte: since }, role: { not: "ADMIN" } },
      orderBy: { lastLoginAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        lastName: true,
        lastLoginAt: true,
      },
    }),
  ]);

  const alerts: AdminAlerts = {
    pendingUsers,
    newOrders,
    recentLogins: recentLogins.map((user) => ({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      at: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "",
    })),
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar alerts={alerts} />
        <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
