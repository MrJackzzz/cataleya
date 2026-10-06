import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney, waLink } from "@/lib/format";
import { ORDER_KIND_LABELS } from "@/lib/constants";
import { StatusBadge, RoleBadge } from "@/components/StatusBadge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pedidos",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, lastName: true, phone: true, role: true } },
      items: { include: { product: true } },
    },
  });

  const pending = orders.filter((order) => order.status === "PENDIENTE").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold">Órdenes</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">
          Pedidos ingresados
          {pending > 0 ? (
            <span className="ml-3 rounded-full bg-primary px-3 py-1 align-middle text-sm text-primary-foreground">
              {pending} pendientes
            </span>
          ) : null}
        </h1>
      </div>

      <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
        {orders.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No hay pedidos registrados todavía.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-gold/15 hover:bg-transparent">
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Detalle</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-gold/10 align-top">
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <a
                      href={waLink(
                        order.user.phone,
                        `Hola ${order.user.name}, te escribe Cataleya Aromas sobre tu pedido.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ivory transition-colors hover:text-gold-soft"
                    >
                      {order.user.name} {order.user.lastName}
                    </a>
                    <span className="mt-1 block">
                      <RoleBadge role={order.user.role} />
                    </span>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm text-muted-foreground">
                        N° {item.product.codeNumber} · {item.quantity} ×{" "}
                        {formatMoney(item.price)}
                      </p>
                    ))}
                    {order.note ? (
                      <p className="mt-1 max-w-52 text-xs text-gold-soft">
                        “{order.note}”
                      </p>
                    ) : null}
                  </TableCell>
                  <TableCell>{ORDER_KIND_LABELS[order.kind]}</TableCell>
                  <TableCell className="text-right text-gold-soft">
                    {formatMoney(order.total)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <OrderStatusControl
                        orderId={order.id}
                        status={order.status}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
