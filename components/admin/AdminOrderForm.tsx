"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createAdminCartOrder } from "@/app/actions/orders";
import { priceForRole, roundMoney, type MarkupRate } from "@/lib/pricing";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientOption = { id: string; label: string; role: string };
type ProductOption = { id: string; label: string; stock: number; baseCostPrice: number };
type CartLine = { productId: string; quantity: number };

export function AdminOrderForm({
  clients,
  products,
  markups,
}: {
  clients: ClientOption[];
  products: ProductOption[];
  markups: MarkupRate[];
}) {
  const [state, formAction, pending] = useActionState(createAdminCartOrder, null);
  const [isNewClient, setIsNewClient] = useState(false);
  const [clientId, setClientId] = useState("");
  const [kind, setKind] = useState<"REPLICA" | "MUESTRA">("REPLICA");
  const [pickId, setPickId] = useState("");
  const [pickQty, setPickQty] = useState(1);
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.success);
      setLines([]);
      setPickId("");
      setPickQty(1);
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const role = isNewClient
    ? "PENDIENTE"
    : (clients.find((client) => client.id === clientId)?.role ?? "PENDIENTE");

  const detailed = useMemo(
    () =>
      lines
        .map((line) => ({
          ...line,
          product: products.find((item) => item.id === line.productId),
        }))
        .filter(
          (line): line is CartLine & { product: ProductOption } =>
            Boolean(line.product)
        ),
    [lines, products]
  );

  const estimated = useMemo(
    () =>
      roundMoney(
        detailed.reduce(
          (sum, line) =>
            sum + priceForRole(line.product.baseCostPrice, markups, role) * line.quantity,
          0
        )
      ),
    [detailed, markups, role]
  );

  const addLine = () => {
    const product = products.find((item) => item.id === pickId);
    if (!product) {
      toast.error("Seleccioná un perfume.");
      return;
    }
    if (product.stock < 1) {
      toast.error("Sin stock.");
      return;
    }
    const wanted = Math.max(1, Math.min(pickQty, product.stock));
    setLines((current) => {
      const existing = current.find((line) => line.productId === pickId);
      if (existing) {
        return current.map((line) =>
          line.productId === pickId
            ? { ...line, quantity: Math.min(line.quantity + wanted, product.stock) }
            : line
        );
      }
      return [...current, { productId: pickId, quantity: wanted }];
    });
    setPickQty(1);
  };

  const setLineQty = (productId: string, quantity: number) => {
    const product = products.find((item) => item.id === productId);
    const max = Math.max(1, product?.stock ?? 1);
    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: Math.min(Math.max(1, quantity), max) }
          : line
      )
    );
  };

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="userId" value={clientId} />
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="items" value={JSON.stringify(lines)} />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Cliente</Label>
          {isNewClient ? (
            <div className="grid grid-cols-2 gap-2">
              <Input name="newName" placeholder="Nombre" maxLength={60} required />
              <Input name="newLastName" placeholder="Apellido" maxLength={60} required />
              <Input
                name="newPhone"
                type="tel"
                placeholder="WhatsApp"
                maxLength={20}
                required
                className="col-span-2"
              />
            </div>
          ) : (
            <Select value={clientId} onValueChange={setClientId}>
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
          )}
          <div className="flex items-center gap-2 pt-1">
            <Switch
              id="new-client"
              checked={isNewClient}
              onCheckedChange={setIsNewClient}
            />
            <Label htmlFor="new-client" className="mb-0 text-xs">
              Cliente nuevo (se registra como pendiente)
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Perfume</Label>
          <Select value={pickId} onValueChange={setPickId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar…" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-end gap-2">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Quitar uno"
                onClick={() => setPickQty((value) => Math.max(1, value - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-10 text-center text-sm font-medium" aria-live="polite">
                {pickQty}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Agregar uno"
                onClick={() => setPickQty((value) => Math.min(99, value + 1))}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            <Button type="button" variant="outline" className="flex-1" onClick={addLine}>
              <Plus className="size-4" /> Agregar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={kind}
            onValueChange={(value) => setKind(value as "REPLICA" | "MUESTRA")}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REPLICA">Réplica (60 ml)</SelectItem>
              <SelectItem value="MUESTRA">Muestra (5 ml)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Se aplica a todo el pedido.
          </p>
        </div>
      </div>

      {detailed.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gold/20">
          {detailed.map((line) => {
            const unit = priceForRole(line.product.baseCostPrice, markups, role);
            return (
              <div
                key={line.productId}
                className="flex flex-wrap items-center gap-3 border-b border-gold/10 px-4 py-3 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ivory">
                    {line.product.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatMoney(unit)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Quitar uno"
                    onClick={() => setLineQty(line.productId, line.quantity - 1)}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">
                    {line.quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Agregar uno"
                    onClick={() => setLineQty(line.productId, line.quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <span className="w-24 text-right text-sm font-medium text-gold-soft">
                  {formatMoney(roundMoney(unit * line.quantity))}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Quitar ${line.product.label}`}
                  className="text-destructive"
                  onClick={() =>
                    setLines((current) =>
                      current.filter((entry) => entry.productId !== line.productId)
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            );
          })}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-muted/50 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {detailed.length} artículo(s) · total estimado según rol
            </p>
            <p className="font-display text-2xl text-gold-soft">
              {formatMoney(estimated)}
            </p>
          </div>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-gold/20 px-4 py-5 text-center text-sm text-muted-foreground">
          El carrito está vacío. Elegí un perfume y tocá Agregar.
        </p>
      )}

      <Button type="submit" className="w-full" disabled={pending || detailed.length === 0}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <ShoppingBag className="size-4" />}
        {pending ? "Guardando…" : "Guardar pedido"}
      </Button>
    </form>
  );
}
