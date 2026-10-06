import type { Metadata } from "next";
import Link from "next/link";
import { Package, FlaskConical, User, Phone } from "lucide-react";
import { requireApprovedClient } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ORDER_KIND_LABELS } from "@/lib/constants";
import { logoutAction } from "@/app/actions/auth";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StatusBadge, RoleBadge } from "@/components/StatusBadge";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi cuenta",
};

export default async function MyAccountPage() {
  const session = await requireApprovedClient();

  const [user, orders, samples, config] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sampleDelivery.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  if (!user) return null;

  const totalComprado = orders
    .filter((order) => order.status !== "CANCELADO")
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-gold">Historial de cliente</p>
            <h1 className="mt-2 font-display text-4xl text-ivory sm:text-5xl">
              {user.name} {user.lastName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RoleBadge role={user.role} />
              <span className="text-sm text-muted-foreground">
                <User className="mr-1 inline size-3.5" />
                {user.phone}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {config?.whatsapp ? (
              <Button asChild variant="outline">
                <a
                  href={waLink(
                    config.whatsapp,
                    `Hola Cataleya Aromas, soy ${user.name} ${user.lastName}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="size-4" /> WhatsApp
                </a>
              </Button>
            ) : null}
            <form action={logoutAction}>
              <Button type="submit" variant="ghost">
                Cerrar sesión
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gold/15 bg-card p-5">
            <Package className="size-4 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Pedidos totales</p>
            <p className="font-display text-3xl text-ivory">{orders.length}</p>
          </div>
          <div className="rounded-xl border border-gold/15 bg-card p-5">
            <FlaskConical className="size-4 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Muestras entregadas</p>
            <p className="font-display text-3xl text-ivory">
              {samples.reduce((sum, sample) => sum + sample.quantity, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-gold/15 bg-card p-5">
            <User className="size-4 text-gold" />
            <p className="mt-3 text-sm text-muted-foreground">Total abonado</p>
            <p className="font-display text-3xl text-gold-soft">
              {formatMoney(totalComprado)}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-3xl text-ivory">Mis pedidos</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gold/15 bg-card">
            {orders.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                Todavía no tenés pedidos.{" "}
                <Link href="/#perfumes" className="text-gold-soft underline">
                  Explorá el catálogo
                </Link>
                .
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/15 hover:bg-transparent">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} className="border-gold/10">
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(order.createdAt)}
                      </TableCell>
                      <TableCell>{ORDER_KIND_LABELS[order.kind]}</TableCell>
                      <TableCell>
                        {order.items.map((item) => (
                          <p key={item.id} className="text-sm">
                            N° {item.product.codeNumber} · {item.product.name} ×
                            {item.quantity}
                          </p>
                        ))}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gold-soft">
                        {formatMoney(order.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-3xl text-ivory">
            Muestras entregadas
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-gold/15 bg-card">
            {samples.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted-foreground">
                No registramos muestras a tu nombre.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gold/15 hover:bg-transparent">
                    <TableHead>Fecha</TableHead>
                    <TableHead>Fragancia</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.id} className="border-gold/10">
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(sample.createdAt)}
                      </TableCell>
                      <TableCell>N° {sample.productCode}</TableCell>
                      <TableCell>{sample.quantity}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={sample.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-gold/15 bg-card p-6">
            <h2 className="font-display text-2xl text-ivory">
              Cambiar contraseña
            </h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Usá la contraseña temporal que te dio el administrador para
              definir la tuya.
            </p>
            <ChangePasswordForm />
          </div>

          <div className="rounded-xl border border-gold/15 bg-gradient-to-br from-burgundy-deep/40 to-card p-6">
            <h2 className="font-display text-2xl text-ivory">
              ¿Necesitás ayuda?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Escribinos por WhatsApp y coordinamos la entrega de tus pedidos o
              muestras.
            </p>
            {config?.whatsapp ? (
              <Button asChild className="mt-4">
                <a
                  href={waLink(
                    config.whatsapp,
                    `Hola, quiero consultar por mi pedido. Soy ${user.name} ${user.lastName}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="size-4" /> Escribir por WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
