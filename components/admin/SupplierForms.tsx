"use client";

import { useActionState } from "react";
import { Loader2, PackagePlus, Truck } from "lucide-react";
import { createSupplier, createPurchase } from "@/app/actions/suppliers";
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

export function SupplierForm() {
  const [state, formAction, pending] = useActionState(createSupplier, null);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-gold/20 bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <Truck className="size-4 text-gold" />
        <h2 className="font-display text-2xl text-ivory">Nuevo proveedor</h2>
      </div>

      <div className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supplier-name">Nombre</Label>
          <Input id="supplier-name" name="name" placeholder="Proveedor de esencias" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supplier-contact">Contacto (opcional)</Label>
          <Input id="supplier-contact" name="contact" placeholder="WhatsApp o email" />
        </div>
      </div>

      {state?.error ? (
        <p className="mt-3 text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="mt-3 text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <Button type="submit" className="mt-4 w-full" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Guardando…" : "Registrar proveedor"}
      </Button>
    </form>
  );
}

export function PurchaseForm({
  suppliers,
}: {
  suppliers: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(createPurchase, null);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-gold/20 bg-card p-6"
    >
      <div className="flex items-center gap-2">
        <PackagePlus className="size-4 text-gold" />
        <h2 className="font-display text-2xl text-ivory">Registrar compra</h2>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label>Proveedor</Label>
          <Select name="supplierId">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar…" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-item">Insumo</Label>
          <Input id="purchase-item" name="item" placeholder="Esencia, frascos…" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-cost">Monto ($)</Label>
          <Input id="purchase-cost" name="cost" type="number" min={0} step="0.01" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-date">Fecha</Label>
          <Input id="purchase-date" name="date" type="date" defaultValue={today} required />
        </div>
      </div>

      {state?.error ? (
        <p className="mt-3 text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="mt-3 text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : null}
        {pending ? "Guardando…" : "Registrar compra"}
      </Button>
    </form>
  );
}
