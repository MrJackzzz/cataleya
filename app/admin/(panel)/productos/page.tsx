import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { SampleForm, SampleStatusControl } from "@/components/admin/SampleForms";
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
  title: "Productos",
};

export default async function AdminProductsPage() {
  const [products, samples, clients] = await Promise.all([
    prisma.product.findMany({ orderBy: { codeNumber: "asc" } }),
    prisma.sampleDelivery.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, lastName: true } } },
    }),
    prisma.user.findMany({
      where: { role: { in: ["CLIENTE", "SOCIO", "FAMILIAR"] }, isApproved: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, lastName: true },
    }),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-gold">Catálogo</p>
          <h1 className="mt-1 font-display text-4xl text-ivory">
            Perfumes, stock y muestras
          </h1>
        </div>
        <ProductForm />
      </div>

      <section>
        <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-gold/15 hover:bg-transparent">
                <TableHead>Imagen</TableHead>
                <TableHead>N°</TableHead>
                <TableHead>Perfume</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Costo base</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="border-gold/10">
                  <TableCell>
                    <div className="relative size-12 overflow-hidden rounded-md border border-gold/15">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-gold-soft">{product.codeNumber}</TableCell>
                  <TableCell>
                    <span className="text-ivory">{product.name}</span>
                    <span className="block max-w-md truncate text-xs text-muted-foreground">
                      {product.description}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        product.stock === 0
                          ? "border-destructive/40 text-destructive"
                          : product.stock <= 5
                            ? "border-gold/40 text-gold-soft"
                            : "border-emerald-400/30 text-emerald-300"
                      }`}
                    >
                      {product.stock} u.
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatMoney(product.baseCostPrice)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] tracking-[0.14em] uppercase ${
                        product.isActive
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-border bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.isActive ? "Visible" : "Oculto"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <ProductRowActions product={product} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {products.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay perfumes cargados.
            </p>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow text-gold">Control de muestras</p>
          <h2 className="mt-1 font-display text-3xl text-ivory">
            Registrar entrega de muestra
          </h2>
        </div>

        <SampleForm
          clients={clients.map((client) => ({
            id: client.id,
            label: `${client.name} ${client.lastName}`,
          }))}
          products={products.map((product) => ({
            codeNumber: product.codeNumber,
            label: `N° ${product.codeNumber} · ${product.name}`,
          }))}
        />

        <div className="overflow-hidden rounded-xl border border-gold/15 bg-card">
          {samples.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No hay muestras registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gold/15 hover:bg-transparent">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
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
                    <TableCell className="text-ivory">
                      {sample.user.name} {sample.user.lastName}
                    </TableCell>
                    <TableCell>N° {sample.productCode}</TableCell>
                    <TableCell>{sample.quantity}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <SampleStatusControl
                          sampleId={sample.id}
                          status={sample.status}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </div>
  );
}
