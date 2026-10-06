import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDate, formatMoney } from "@/lib/format";
import { deletePurchase, deleteSupplier } from "@/app/actions/suppliers";
import { CostCalculator } from "@/components/admin/CostCalculator";
import { SupplierForm, PurchaseForm } from "@/components/admin/SupplierForms";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proveedores",
};

export default async function AdminSuppliersPage() {
  const [suppliers, markups] = await Promise.all([
    prisma.supplier.findMany({
      include: { purchases: { orderBy: { date: "desc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.roleMarkup.findMany({
      where: { role: { in: ["CLIENTE", "SOCIO", "FAMILIAR"] } },
    }),
  ]);

  const totalPurchases = suppliers.reduce(
    (sum, supplier) =>
      sum + supplier.purchases.reduce((inner, purchase) => inner + purchase.cost, 0),
    0
  );

  return (
    <div className="space-y-10">
      <div>
        <p className="eyebrow text-gold">Materia prima</p>
        <h1 className="mt-1 font-display text-4xl text-ivory">
          Proveedores y costos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ingresos totales de compras:{" "}
          <span className="text-gold-soft">{formatMoney(totalPurchases)}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CostCalculator
          markups={markups.map((markup) => ({
            role: markup.role,
            markupValue: markup.markupValue,
            isPercentage: markup.isPercentage,
          }))}
        />
        <SupplierForm />
      </div>

      <PurchaseForm
        suppliers={suppliers.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
        }))}
      />

      <section className="space-y-4">
        <h2 className="font-display text-3xl text-ivory">Proveedores</h2>

        {suppliers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gold/20 bg-card/50 px-5 py-10 text-center text-sm text-muted-foreground">
            Todavía no hay proveedores registrados.
          </div>
        ) : (
          suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="rounded-xl border border-gold/15 bg-card p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-2xl text-ivory">{supplier.name}</p>
                  {supplier.contact ? (
                    <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                  ) : null}
                </div>
                <form action={deleteSupplier}>
                  <input type="hidden" name="id" value={supplier.id} />
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="size-4" /> Eliminar
                  </Button>
                </form>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-gold/10">
                {supplier.purchases.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                    Sin compras registradas.
                  </p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        <th className="px-4 py-2">Fecha</th>
                        <th className="px-4 py-2">Insumo</th>
                        <th className="px-4 py-2 text-right">Monto</th>
                        <th className="px-4 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {supplier.purchases.map((purchase) => (
                        <tr key={purchase.id} className="border-b border-gold/5 last:border-0">
                          <td className="px-4 py-2 text-muted-foreground">
                            {formatDate(purchase.date)}
                          </td>
                          <td className="px-4 py-2 text-ivory">{purchase.item}</td>
                          <td className="px-4 py-2 text-right text-gold-soft">
                            {formatMoney(purchase.cost)}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <form action={deletePurchase} className="inline">
                              <input type="hidden" name="id" value={purchase.id} />
                              <button
                                type="submit"
                                className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                              >
                                Quitar
                              </button>
                            </form>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
