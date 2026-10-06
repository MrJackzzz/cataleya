import Link from "next/link";
import { startOfDay, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney, waLink } from "@/lib/format";
import { ORDER_KIND_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const monthStart = startOfMonth(now);

  const [
    salesToday,
    salesMonth,
    pendingOrders,
    pendingUsers,
    lowStock,
    recentOrders,
    pendingSamples,
    totalProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: todayStart }, status: { not: "CANCELADO" } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELADO" } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.user.count({ where: { role: "PENDIENTE", isApproved: false } }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 5 } },
      orderBy: { stock: "asc" },
      take: 6,
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, lastName: true, phone: true } },
        items: { include: { product: { select: { codeNumber: true } } } },
      },
    }),
    prisma.sampleDelivery.count({ where: { status: "PENDIENTE" } }),
    prisma.product.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "Facturación hoy", value: formatMoney(salesToday._sum.total ?? 0) },
    { label: "Facturación del mes", value: formatMoney(salesMonth._sum.total ?? 0) },
    { label: "Pedidos pendientes", value: String(pendingOrders) },
    { label: "Usuarios por aprobar", value: String(pendingUsers) },
    { label: "Muestras pendientes", value: String(pendingSamples) },
    { label: "Perfumes activos", value: String(totalProducts) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Resumen</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gold/15 bg-card p-5"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 font-display text-3xl text-gold-soft">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ivory">Últimos pedidos</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/pedidos">Ver todos</Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id} className="border-gold/10">
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <a
                        href={waLink(
                          order.user.phone,
                          `Hola ${order.user.name}, te escribimos por tu pedido de Cataleya Aromas.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors hover:text-gold-soft"
                      >
                        {order.user.name} {order.user.lastName}
                      </a>
                      <span className="block text-xs text-muted-foreground">
                        {order.items.map((item) => `N°${item.product.codeNumber}`).join(", ")}
                      </span>
                    </TableCell>
                    <TableCell>{ORDER_KIND_LABELS[order.kind]}</TableCell>
                    <TableCell className="text-right text-gold-soft">
                      {formatMoney(order.total)}
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl text-ivory">Stock bajo</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/productos">Productos</Link>
            </Button>
          </div>
          <div className="rounded-xl border border-gold/15 bg-card p-4">
            {lowStock.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Todo el stock en niveles sanos.
              </p>
            ) : (
              <ul className="divide-y divide-gold/10">
                {lowStock.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="text-ivory">
                      N° {product.codeNumber} · {product.name}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        product.stock === 0
                          ? "border-destructive/40 text-destructive"
                          : "border-gold/40 text-gold-soft"
                      }`}
                    >
                      {product.stock} u.
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
