"use client";

import { useActionState } from "react";
import { Loader2, FlaskConical } from "lucide-react";
import { createSampleDelivery, setSampleStatus } from "@/app/actions/samples";
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

type ClientOption = { id: string; label: string };
type ProductOption = { codeNumber: number; label: string };

export function SampleForm({
  clients,
  products,
}: {
  clients: ClientOption[];
  products: ProductOption[];
}) {
  const [state, formAction, pending] = useActionState(createSampleDelivery, null);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-xl border border-gold/15 bg-card p-5 md:grid-cols-4"
    >
      <div className="space-y-2">
        <Label>Cliente</Label>
        <Select name="userId">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar…" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Fragancia (N°)</Label>
        <Select name="productCode">
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar…" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.codeNumber} value={String(product.codeNumber)}>
                {product.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sample-quantity">Cantidad</Label>
        <Input id="sample-quantity" name="quantity" type="number" min={1} defaultValue={1} />
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : <FlaskConical className="size-4" />}
          {pending ? "Registrando…" : "Registrar muestra"}
        </Button>
      </div>

      {state?.error ? (
        <p className="text-sm text-destructive md:col-span-4">{state.error}</p>
      ) : null}
      {state?.success ? (
        <p className="text-sm text-emerald-300 md:col-span-4">{state.success}</p>
      ) : null}
    </form>
  );
}

export function SampleStatusControl({
  sampleId,
  status,
}: {
  sampleId: string;
  status: "PENDIENTE" | "CERRADO";
}) {
  const [state, formAction, pending] = useActionState(setSampleStatus, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="sampleId" value={sampleId} />
      <Select name="status" defaultValue={status}>
        <SelectTrigger className="h-8 w-28 text-xs" disabled={pending}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
          <SelectItem value="CERRADO">Cerrado</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="submit"
        className="text-xs text-gold underline-offset-2 transition-colors hover:text-gold-soft hover:underline disabled:opacity-50"
        disabled={pending}
      >
        {pending ? "…" : state?.error ? "Reintentar" : "Guardar"}
      </button>
    </form>
  );
}
