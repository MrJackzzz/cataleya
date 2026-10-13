import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar, type AdminAlerts } from "@/components/admin/AdminTopbar";
import { ActionToastHost } from "@/components/admin/ActionToastHost";
import { formatDateTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [pendingUsers, newOrders, recentLogins, config, latestPending, latestOrder] =
    await Promise.all([
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
      prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
      prisma.user.findFirst({
        where: { role: "PENDIENTE", isApproved: false },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
      prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

  const latestActivity = [latestPending?.createdAt, latestOrder?.createdAt]
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.toISOString())
    .sort()
    .pop();

  const alerts: AdminAlerts = {
    pendingUsers,
    newOrders,
    recentLogins: recentLogins.map((user) => ({
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      at: user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "",
    })),
    latestActivity,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar logoUrl={config?.logoUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar alerts={alerts} />
        <main className="flex-1 px-4 py-6 sm:px-6">
          <ActionToastHost>{children}</ActionToastHost>
        </main>
      </div>
    </div>
  );
}
