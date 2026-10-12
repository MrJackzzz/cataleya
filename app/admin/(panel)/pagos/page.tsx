import type { Metadata } from "next";
import Link from "next/link";
import { endOfDay, parseISO, startOfDay, startOfMonth } from "date-fns";
import { prisma } from "@/lib/prisma";
import { paymentsFilterSchema } from "@/lib/validations";
import { roundMoney } from "@/lib/pricing";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { PaymentForm } from "@/components/admin/PaymentForm";
import { PaymentDeleteButton } from "@/components/admin/PaymentDeleteButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  title: "Pagos",
};

type PaymentStatus = "PENDIENTE" | "PARCIAL" | "PAGADO";

function orderStatusOf(total: number, paid: number): PaymentStatus {
  if (paid <= 0) return "PENDIENTE";
  if (roundMoney(total - paid) <= 0) return "PAGADO";
  return "PARCIAL";
}

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const now = new Date();

  const parsed = paymentsFilterSchema.safeParse({
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
    client: typeof params.client === "string" ? params.client : "",
    status: typeof params.status === "string" ? params.status : "TODOS",
  });
  const filter = parsed.success
    ? parsed.data
    : { from: undefined, to: undefined, client: "", status: "TODOS" as const };

  const fromDate =
    filter.from && !Number.isNaN(Date.parse(filter.from))
      ? startOfDay(parseISO(filter.from))
      : startOfDay(startOfMonth(now));
  const toDate =
    filter.to && !Number.isNaN(Date.parse(filter.to))
      ? endOfDay(parseISO(filter.to))
      : endOfDay(now);

  const clientQuery = filter.client.trim();

  const payments = await prisma.payment.findMany({
    where: {
      date: { gte: fromDate, lte: toDate },
      ...(clientQuery
        ? {
            order: {
              user: {
                OR: [
                  { name: { contains: clientQuery, mode: "insensitive" } },
                  { lastName: { contains: clientQuery, mode: "insensitive" } },
                  { phone: { contains: clientQuery } },
                ],
              },
            },
          }
        : {}),
    },
    include: {
      order: {
        include: {
          user: { select: { name: true, lastName: true, phone: true } },
          items: { include: { product: { select: { codeNumber: true } } } },
          payments: { select: { amount: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const visible = payments.filter((payment) => {
    if (filter.status === "TODOS") return true;
    const paid = roundMoney(
      payment.order.payments.reduce((sum, entry) => sum + entry.amount, 0)
    );
    return orderStatusOf(payment.order.total, paid) === filter.status;
  });

  const collected = roundMoney(
    visible.reduce((sum, payment) => sum + payment.amount, 0)
  );

  const openOrders = await prisma.order.findMany({
    where: { status: { in: ["PENDIENTE", "EN_PROCESO"] } },
    include: {
      user: { select: { name: true, lastName: true } },
      items: { include: { product: { select: { codeNumber: true } } } },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const withBalance = openOrders
    .map((order) => {
      const paid = roundMoney(
        order.payments.reduce((sum, entry) => sum + entry.amount, 0)
      );
      return { order, paid, remaining: roundMoney(order.total - paid) };
    })
    .filter((entry) => entry.remaining > 0);

  const outstanding = roundMoney(
    withBalance.reduce((sum, entry) => sum + entry.remaining, 0)
  );

  const isoDate = (date: Date) => date.toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-gold-deep">Cobros</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">Pagos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Período: {formatDate(fromDate)} — {formatDate(toDate)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Cobrado en el período</p>
          <p className="mt-1 font-display text-3xl text-gold-soft">
            {formatMoney(collected)}
          </p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Pagos registrados</p>
          <p className="mt-1 font-display text-3xl text-ivory">{visible.length}</p>
        </div>
        <div className="rounded-xl border border-gold/15 bg-card p-5">
          <p className="text-sm text-muted-foreground">Saldo pendiente total</p>
          <p className="mt-1 font-display text-3xl text-ivory">
            {formatMoney(outstanding)}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-gold/15 bg-card p-5">
        <h2 className="font-display text-2xl text-ivory">Registrar pago</h2>
        <div className="mt-4">
          <PaymentForm
            orders={withBalance.map((entry) => ({
              id: entry.order.id,
              label: `N° ${entry.order.items.map((item) => item.product.codeNumber).join(" + ") || "—"} · ${entry.order.user.name} ${entry.order.user.lastName} · saldo ${formatMoney(entry.remaining)}`,
            }))}
          />
          {withBalance.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No hay pedidos abiertos con saldo pendiente.
            </p>
          ) : null}
        </div>
      </section>

      <section>
        <form
          method="get"
          action="/admin/pagos"
          className="grid gap-4 rounded-xl border border-gold/15 bg-card p-5 sm:grid-cols-2 lg:grid-cols-5"
        >
          <div className="space-y-2">
            <Label htmlFor="pay-from">Desde</Label>
            <Input
              id="pay-from"
              name="from"
              type="date"
              defaultValue={isoDate(fromDate)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-to">Hasta</Label>
            <Input id="pay-to" name="to" type="date" defaultValue={isoDate(toDate)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-client">Cliente</Label>
            <Input
              id="pay-client"
              name="client"
              defaultValue={filter.client}
              placeholder="Nombre o WhatsApp"
            />
          </div>
          <div className="space-y-2">
            <Label>Estado del pedido</Label>
            <Select name="status" defaultValue={filter.status}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDIENTE">Sin pagos</SelectItem>
                <SelectItem value="PARCIAL">Parcial</SelectItem>
                <SelectItem value="PAGADO">Pagado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              Filtrar
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/pagos">Limpiar</Link>
            </Button>
          </div>
        </form>
      </section>

      <section>
        <div className="overflow-x-auto rounded-xl border border-gold/15 bg-card">
          {visible.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted-foreground">
              No hay pagos en el período seleccionado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((payment) => {
                  const paid = roundMoney(
                    payment.order.payments.reduce(
                      (sum, entry) => sum + entry.amount,
                      0
                    )
                  );
                  const status = orderStatusOf(payment.order.total, paid);
                  return (
                    <TableRow key={payment.id} className="border-gold/10 align-top">
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(payment.date)}
                      </TableCell>
                      <TableCell className="text-ivory">
                        {payment.order.user.name} {payment.order.user.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        N°{" "}
                        {payment.order.items
                          .map((item) => item.product.codeNumber)
                          .join(" + ") || "—"}{" "}
                        · {formatMoney(payment.order.total)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gold-soft">
                        {formatMoney(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={status} />
                      </TableCell>
                      <TableCell className="max-w-52 text-sm text-muted-foreground">
                        {payment.note ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <PaymentDeleteButton paymentId={payment.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
