import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { roundMoney } from "@/lib/pricing";
import { formatDateTime, formatMoney, waLink } from "@/lib/format";
import { ORDER_KIND_LABELS, ROLE_LABELS } from "@/lib/constants";
import { StatusBadge, RoleBadge } from "@/components/StatusBadge";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { OrderDeleteButton } from "@/components/admin/OrderDeleteButton";
import { AdminOrderForm } from "@/components/admin/AdminOrderForm";
import { OrderItemEditor } from "@/components/orders/OrderItemEditor";
import { OrderItemReturnForm } from "@/components/orders/OrderItemReturnForm";
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
  const [orders, clients, products, markups] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, lastName: true, phone: true, role: true } },
        items: { include: { product: true } },
        payments: { select: { amount: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ["PENDIENTE", "CLIENTE", "SOCIO", "FAMILIAR"] } },
      orderBy: [{ name: "asc" }, { lastName: "asc" }],
      select: { id: true, name: true, lastName: true, phone: true, role: true },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { codeNumber: "asc" },
      select: { id: true, codeNumber: true, name: true, stock: true, baseCostPrice: true },
    }),
    prisma.roleMarkup.findMany({
      select: { role: true, markupValue: true, isPercentage: true },
    }),
  ]);

  const pending = orders.filter((order) => order.status === "PENDIENTE").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold-deep">Órdenes</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">
          Pedidos ingresados
          {pending > 0 ? (
            <span className="ml-3 rounded-full bg-primary px-3 py-1 align-middle text-sm text-primary-foreground">
              {pending} pendientes
            </span>
          ) : null}
        </h1>
      </div>

      <section className="rounded-xl border border-gold/15 bg-card p-5">
        <h2 className="font-display text-2xl text-ivory">Nuevo pedido</h2>
        <p className="mb-4 mt-1 text-sm text-muted-foreground">
          Para un cliente registrado o uno nuevo (se crea como pendiente).
        </p>
        <AdminOrderForm
          clients={clients.map((client) => ({
            id: client.id,
            label: `${client.name} ${client.lastName} · ${client.phone} (${ROLE_LABELS[client.role] ?? client.role})`,
            role: client.role,
          }))}
          products={products.map((product) => ({
            id: product.id,
            label: `N° ${product.codeNumber} · ${product.name} (stock ${product.stock})`,
            stock: product.stock,
            baseCostPrice: product.baseCostPrice,
          }))}
          markups={markups}
        />
      </section>

      <div className="overflow-x-auto rounded-xl border border-gold/15 bg-card">
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
                  <TableHead>Abonado</TableHead>
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
                      <div key={item.id} className="mb-2 last:mb-0">
                        <p className="text-sm text-muted-foreground">
                          N° {item.product.codeNumber} · {item.quantity} ×{" "}
                          {formatMoney(item.price)}
                        </p>
                        {order.status === "PENDIENTE" ||
                        order.status === "EN_PROCESO" ? (
                          <div className="mt-1">
                            <OrderItemEditor
                              itemId={item.id}
                              quantity={item.quantity}
                              max={item.product.stock + item.quantity}
                            />
                          </div>
                        ) : null}
                        {order.status !== "CANCELADO" ? (
                          <div className="mt-1">
                            <OrderItemReturnForm
                              itemId={item.id}
                              max={item.quantity}
                            />
                          </div>
                        ) : null}
                      </div>
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
                    {(() => {
                      const paid = roundMoney(
                        order.payments.reduce((sum, entry) => sum + entry.amount, 0)
                      );
                      const payStatus =
                        paid <= 0 ? "PENDIENTE" : paid >= order.total ? "PAGADO" : "PARCIAL";
                      return (
                        <>
                          <StatusBadge status={payStatus} />
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {formatMoney(paid)} de {formatMoney(order.total)}
                          </span>
                        </>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <OrderStatusControl
                        orderId={order.id}
                        status={order.status}
                      />
                      <OrderDeleteButton orderId={order.id} />
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
