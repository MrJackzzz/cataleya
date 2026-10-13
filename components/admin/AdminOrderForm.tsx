"use client";

import { useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { createAdminOrder } from "@/app/actions/orders";
import { useToastAction } from "@/components/admin/ActionToastHost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ClientOption = { id: string; label: string };
type ProductOption = { id: string; label: string };

export function AdminOrderForm({
  clients,
  products,
}: {
  clients: ClientOption[];
  products: ProductOption[];
}) {
  const [, formAction, pending] = useToastAction(createAdminOrder);
  const [isNewClient, setIsNewClient] = useState(false);
  const [kind, setKind] = useState<"REPLICA" | "MUESTRA">("REPLICA");

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <Select name="userId" required>
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
        <Select name="productId" required>
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
        <div className="flex items-end gap-3">
          <div className="space-y-2">
            <Label>Cantidad</Label>
            <QtyStepper name="quantity" defaultValue={1} min={1} max={99} />
          </div>
          <div className="flex-1 space-y-2">
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
            <input type="hidden" name="kind" value={kind} />
          </div>
        </div>
      </div>

      <div className="flex items-end">
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ShoppingBag className="size-4" />
          )}
          {pending ? "Creando…" : "Crear pedido"}
        </Button>
      </div>
    </form>
  );
}
